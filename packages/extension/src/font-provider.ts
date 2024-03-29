import * as vscode from 'vscode'
import * as path from 'path'
import html from './index.html'
import { template } from './util'
import FontDocument from './font-document'
import { WebviewMessage, LogLevel, ShowMessageEvent } from '@font-preview/shared'
import { TypedWebviewPanel } from './types/overrides'
import LoggingService from './logging-service'
import YAMLLoader from './yaml-loader'
import YAMLValidationError from './yaml-validation-error'
import GlobalStateManager from './global-state-manager'
import ConfigManager from './config-manager'

// https://chromium.googlesource.com/chromium/blink/+/refs/heads/main/Source/platform/fonts/opentype/OpenTypeSanitizer.cpp#70
const MAX_WEB_FONT_SIZE = 30 * 1024 * 1024 // MB
const LOG_TAG = 'FontProvider'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class FontProvider implements vscode.CustomReadonlyEditorProvider {
  public static readonly viewType = 'font.detail.preview'
  private shouldShowProgressNotification: boolean = false
  private readonly yamlLoader: YAMLLoader

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly logger: LoggingService,
    private readonly globalState: GlobalStateManager,
    private readonly workspaceConfig: ConfigManager
  ) {
    this.yamlLoader = new YAMLLoader(logger, workspaceConfig)
  }

  public register(): void {
    this.context.subscriptions.push(
      vscode.window.registerCustomEditorProvider(FontProvider.viewType, this)
    )
  }

  public async openCustomDocument(uri: vscode.Uri): Promise<FontDocument> {
    return new FontDocument(uri, this.logger)
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

    panel.webview.html = this.getWebviewContent()

    const colorChangeListener = vscode.window.onDidChangeActiveColorTheme(event => {
      panel.webview.postMessage({
        type: 'COLOR_THEME_CHANGE',
        payload: event.kind
      })
    })

    panel.webview.onDidReceiveMessage(async (message: WebviewMessage) => {
      await this.onDidReceiveMessage(panel, message, document)
    })

    panel.onDidChangeViewState(event => {
      if (!event.webviewPanel.visible) {
        this.shouldShowProgressNotification = false
      }
    })

    panel.onDidDispose(() => {
      colorChangeListener.dispose()
      this.shouldShowProgressNotification = false
    })
  }

  private async loadFont(panel: TypedWebviewPanel, document: FontDocument) {
    const fileUri = panel.webview.asWebviewUri(document.uri)
    const fileSize = await document.size()

    this.logger.info(`Loading font of size ${(fileSize / 1024).toFixed(2)} kb`, LOG_TAG)

    let fileContent: number[] = []

    if (fileSize > MAX_WEB_FONT_SIZE) {
      vscode.window.showWarningMessage(
        `${document.fileName}.${document.extension} exceeds than the maximum
        web font size (30 MB) and cannot be rendered. Some font information may
        still be available.`
      )
    }

    // We need to decompress the file on the extension side because doing so in
    // the webview would likely cause the webview to crash due to memory consumption
    if (document.extension === 'woff2') {
      fileContent = Array.from((await document.decompress()) || [])
    }

    // Skip showing the progress notification since the font is too large to be parsed
    if (fileSize <= MAX_WEB_FONT_SIZE) {
      this.showProgressNotification(panel)
    }

    panel.webview.postMessage({
      type: 'FONT_LOADED',
      payload: {
        // TODO: if the vscode engine is updated to 1.57+, maybe we can use an ArrayBuffer or Uint8Array?
        // Still might not be faster though...
        fileContent,
        fileSize,
        fileUrl: `${fileUri.scheme}://${fileUri.authority}${fileUri.path}`,
        fileName: document.fileName,
        fileExtension: document.extension,
        useWorker: this.workspaceConfig.get('useWorker')
      }
    })
  }

  private async onDidReceiveMessage(
    panel: TypedWebviewPanel,
    message: WebviewMessage,
    document: FontDocument
  ): Promise<void> {
    this.logger.debug(`Received message from webview: ${message.type}`, LOG_TAG)

    switch (message.type) {
      case 'SHOW_MESSAGE':
        this.showMessage(message.payload.messageType, message.payload.message)
        break
      case 'GET_FONT':
        this.loadFont(panel, document)
        break
      case 'GET_CONFIG':
        const config = this.workspaceConfig.all()
        const { defaultTab, retainTabPosition } = config
        const currentPanelTab = this.globalState.get('previewTab', defaultTab)

        panel.webview.postMessage({
          type: 'CONFIG_LOADED',
          payload: {
            ...config,
            defaultTab: retainTabPosition ? currentPanelTab : defaultTab
          }
        })
        break
      case 'TOGGLE_PROGRESS':
        if (message.payload) {
          this.showProgressNotification(panel)
        } else {
          this.shouldShowProgressNotification = false
        }
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
        this.loadSampleText(panel)
        break
      case 'PREVIEW_TAB_CHANGE':
        await this.globalState.update('previewTab', message.payload.tab)
        break
    }
  }

  private showMessage(
    messageType: ShowMessageEvent['payload']['messageType'],
    message: string
  ) {
    switch (messageType) {
      case 'ERROR':
        vscode.window.showErrorMessage(message)
        break
      case 'WARNING':
        vscode.window.showWarningMessage(message)
        break
      case 'INFO':
        vscode.window.showInformationMessage(message)
        break
      default:
        this.logger.error(`Invalid message type in [showMessage]: ${message}`)
    }
  }

  private logMessageFromWebview(level: LogLevel, message: string, tag?: string) {
    switch (level) {
      case LogLevel.DEBUG:
        this.logger.debug(message, tag)
        break
      case LogLevel.INFO:
        this.logger.info(message, tag)
        break
      case LogLevel.WARN:
        this.logger.warn(message, tag)
        break
      case LogLevel.ERROR:
        this.logger.error(message, tag)
        break
      default:
        this.logger.error(`Invalid log level received from tag [${tag}]`, LOG_TAG)
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

  /**
   * Loads all sample text files form the config `font-preview.sampleTextPaths`
   * and posts a message to the panel when complete
   */
  private async loadSampleText(panel: TypedWebviewPanel) {
    const { sampleTexts, errors } = await this.yamlLoader.loadSampleTextsFromConfig()

    panel.webview.postMessage({
      type: 'SAMPLE_TEXT_LOADED',
      payload: sampleTexts
    })

    if (!this.workspaceConfig.get('showSampleTextErrors')) {
      return
    }

    errors.forEach(error => {
      const actions: string[] =
        error.reason instanceof YAMLValidationError
          ? ['Show Logs', 'Open File', "Don't Show Again"]
          : []

      if (error.reason.message) {
        vscode.window
          .showWarningMessage(error.reason.message, ...actions)
          .then(async action => {
            switch (action) {
              case 'Show Logs':
                this.logger.outputChannel.show()
                break
              case 'Open File':
                this.openYAMLFile((error.reason as YAMLValidationError).filePath)
                break
              case "Don't Show Again":
                await this.workspaceConfig.set('showSampleTextErrors', false)
                break
            }
          })
      }
    })
  }

  private async openYAMLFile(filePath: string) {
    try {
      const document = await vscode.workspace.openTextDocument(filePath)
      await vscode.window.showTextDocument(document, { preview: false })
    } catch (err) {
      this.logger.error('Error opening document', LOG_TAG, err)
    }
  }
}

export default FontProvider
