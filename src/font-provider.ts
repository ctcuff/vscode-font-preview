import * as vscode from 'vscode'
import * as path from 'path'
import html from './index.html'
import { template } from './util'
import FontDocument from './font-document'
import { Config, WebviewMessage } from '../shared/types'
import * as wawoff2 from 'wawoff2'

class FontProvider implements vscode.CustomReadonlyEditorProvider {
  public static readonly viewType = 'font.detail.preview'

  constructor(private readonly context: vscode.ExtensionContext) {}

  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new FontProvider(context)
    return vscode.window.registerCustomEditorProvider(FontProvider.viewType, provider)
  }

  public async openCustomDocument(uri: vscode.Uri): Promise<FontDocument> {
    return new FontDocument(uri)
  }

  public async resolveCustomEditor(
    document: FontDocument,
    panel: vscode.WebviewPanel
  ): Promise<void> {
    panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'dist'))]
    }

    let content = await document.getContent()

    if (!content) {
      return
    }

    if (document.extension === 'woff2') {
      try {
        content = await wawoff2.decompress(content)
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.warn(`Couldn't decompress file content ${err}`)
      }
    }

    this.postMessage(panel, {
      type: 'FONT_LOADED',
      payload: {
        // postMessage can't handle a Uint8Array so we have to
        // send an array of numbers instead.
        fileContent: Array.from(content),
        fileName: document.fileName,
        fileExtension: document.extension
      }
    })

    panel.webview.onDidReceiveMessage((message: WebviewMessage) =>
      this.onDidReceiveMessage(panel, message)
    )

    panel.webview.html = this.getWebviewContent()

    const colorThemeListener = vscode.window.onDidChangeActiveColorTheme(event => {
      this.postMessage(panel, {
        type: 'COLOR_THEME_CHANGE',
        payload: event.kind
      })
    })

    panel.onDidDispose(() => colorThemeListener.dispose())
  }

  private postMessage(panel: vscode.WebviewPanel, message: WebviewMessage): void {
    panel.webview.postMessage(message)
  }

  private onDidReceiveMessage(panel: vscode.WebviewPanel, message: WebviewMessage): void {
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
      case 'GET_CONFIG': {
        const config = vscode.workspace.getConfiguration('font-preview')

        this.postMessage(panel, {
          type: 'CONFIG_LOADED',
          payload: {
            defaultTab: config.get('defaultTab') as Config['defaultTab']
          }
        })
        break
      }
    }
  }

  private getWebviewContent(): string {
    const webDistPath = vscode.Uri.file(
      path.join(this.context.extensionPath, 'dist', 'web-view.js')
    )

    const reactAppUri = webDistPath.with({ scheme: 'vscode-resource' }).toString()

    return template(html, { reactAppUri })
  }
}

export default FontProvider
