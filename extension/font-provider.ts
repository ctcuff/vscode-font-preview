import * as vscode from 'vscode'
import * as path from 'path'
import html from './index.html'
import { template } from './util'
import FontDocument from './font-document'
import { WorkspaceConfig, WebviewMessage, LogLevel, PreviewSample } from '../shared/types'
import { TypedWorkspaceConfiguration, TypedWebviewPanel } from './types/overrides'
import Logger from './logger'

// https://chromium.googlesource.com/chromium/blink/+/refs/heads/main/Source/platform/fonts/opentype/OpenTypeSanitizer.cpp#70
const MAX_WEB_FONT_SIZE = 30 * 1024 * 1024 // MB
const LOG_TAG = 'FontProvider'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class FontProvider implements vscode.CustomReadonlyEditorProvider {
  public static readonly viewType = 'font.detail.preview'
  private shouldShowProgressNotification: boolean = true
  private logger = Logger.getInstance()
  // TODO: Update sample texts when the config changes
  private sampleTexts: PreviewSample[]

  constructor(
    private readonly context: vscode.ExtensionContext,
    sampleTexts: PreviewSample[]
  ) {
    this.sampleTexts = sampleTexts
  }

  public static register(
    context: vscode.ExtensionContext,
    sampleTexts: PreviewSample[]
  ): vscode.Disposable {
    const provider = new FontProvider(context, sampleTexts)
    return vscode.window.registerCustomEditorProvider(FontProvider.viewType, provider)
  }

  public async openCustomDocument(uri: vscode.Uri): Promise<FontDocument> {
    return new FontDocument(uri)
  }

  public async resolveCustomEditor(
    document: FontDocument,
    panel: TypedWebviewPanel
  ): Promise<void> {
    panel.webview.options = {
      enableScripts: true,
      enableCommandUris: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(this.context.extensionPath, 'dist')),
        vscode.Uri.file(path.dirname(document.uri.path))
      ]
    }

    const fileUri = panel.webview.asWebviewUri(document.uri)
    const fileSize = await document.size()

    this.logger.info(`Loading font of size ${(fileSize / 1024).toFixed(2)}kb`, LOG_TAG)

    let fileContent: number[] = []

    if (fileSize > MAX_WEB_FONT_SIZE) {
      vscode.window.showWarningMessage(
        `${document.fileName}.${document.extension} exceeds than the maximum
        web font size (30 MB) and cannot be rendered. Font information will
        still be available.`
      )
    }

    // We need to decompress the file on the extension side because doing so in
    // the webview would likely cause the webview to crash due to memory consumption
    if (document.extension === 'woff2') {
      fileContent = Array.from((await document.decompress()) || [])
    }

    if (fileSize <= MAX_WEB_FONT_SIZE) {
      this.showProgressNotification(panel)
    }

    panel.webview.html = this.getWebviewContent()

    const colorThemeListener = vscode.window.onDidChangeActiveColorTheme(event => {
      panel.webview.postMessage({
        type: 'COLOR_THEME_CHANGE',
        payload: event.kind
      })
    })

    panel.webview.onDidReceiveMessage((message: WebviewMessage) => {
      this.onDidReceiveMessage(panel, message)
    })

    panel.onDidChangeViewState(event => {
      if (!event.webviewPanel.visible) {
        this.shouldShowProgressNotification = false
      }
    })

    panel.onDidDispose(() => {
      this.shouldShowProgressNotification = false
      colorThemeListener.dispose()
    })

    panel.webview.postMessage({
      type: 'FONT_LOADED',
      payload: {
        // TODO: if the vscode engine is updated to 1.57+, maybe we can use an ArrayBuffer or Uint8Array?
        fileContent,
        fileSize,
        fileUrl: `${fileUri.scheme}://${fileUri.authority}${fileUri.path}`,
        fileName: document.fileName,
        fileExtension: document.extension,
        // TODO: Move config out of font load event
        config: this.getAllConfig()
      }
    })
  }

  private onDidReceiveMessage(panel: TypedWebviewPanel, message: WebviewMessage): void {
    switch (message.type) {
      case 'ERROR':
        vscode.window.showErrorMessage(message.payload)
        break
      case 'WARNING':
        vscode.window.showWarningMessage(message.payload)
        break
      case 'INFO':
        vscode.window.showInformationMessage(message.payload)
        break
      case 'GET_CONFIG':
        panel.webview.postMessage({
          type: 'CONFIG_LOADED',
          payload: this.getAllConfig()
        })
        break
      case 'PROGRESS_START':
        this.showProgressNotification(panel)
        break
      case 'PROGRESS_STOP':
        this.shouldShowProgressNotification = false
        break
      case 'LOG': {
        this.logMessageFromWebview(
          message.payload.level,
          message.payload.message,
          message.payload.tag
        )
        break
      }
      case 'GET_SAMPLE_TEXT':
        panel.webview.postMessage({
          type: 'LOAD_SAMPLE_TEXT',
          payload: this.sampleTexts
        })
        break
    }
  }

  private logMessageFromWebview(level: LogLevel, message: string, tag?: string) {
    try {
      const key = level.toLowerCase() as keyof typeof this.logger

      switch (key) {
        case 'info':
        case 'warn':
        case 'error':
          this.logger[key](message, tag)
      }
    } catch (err) {
      this.logger.warn(`Error logging message from [${tag}]: ${err}`, LOG_TAG)
    }
  }

  private getAllConfig(): WorkspaceConfig {
    const config = vscode.workspace.getConfiguration(
      'font-preview'
    ) as TypedWorkspaceConfiguration

    return {
      // TODO: Move this to a class
      defaultTab: config.get('defaultTab'),
      useWorker: config.get('useWorker'),
      showGlyphWidth: config.get('showGlyphWidth'),
      showGlyphIndex: config.get('showGlyphIndex'),
      sampleTextPaths: config.get('sampleTextPaths')
    }
  }

  private getWebviewContent(): string {
    const webDistPath = vscode.Uri.file(
      path.join(this.context.extensionPath, 'dist', 'web-view.js')
    )

    const reactAppUri = webDistPath.with({ scheme: 'vscode-resource' }).toString()

    return template(html, { reactAppUri })
  }

  private showProgressNotification(panel: TypedWebviewPanel): void {
    this.shouldShowProgressNotification = true

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Window,
        title: 'Rendering font'
      },
      async () => {
        // Need to check if the panel is still visible so the notification
        // doesn't spin forever when the font editor is hidden
        while (this.shouldShowProgressNotification && panel.visible) {
          // VS Code will dismiss the notification once this function
          // returns so we need to create a fake loading scenario
          await wait(250)
        }
      }
    )
  }
}

export default FontProvider
