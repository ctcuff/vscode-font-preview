import * as vscode from 'vscode'
import * as path from 'path'
import html from './index.html'
import { template } from './util'
import FontDocument from './font-document'
import { WebviewMessage } from '../shared/types'
import * as wawoff2 from 'wawoff2'
import { ExtensionConfiguration, TypedWebviewPanel } from './types/overrides'

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

    let fileContent: number[] = []

    // WOFF2 fonts are compressed and can't be parsed by opentype.js so we
    // we need to decompress it and send the file contents using postMessage
    if (document.extension === 'woff2') {
      try {
        const content = await document.read()

        if (!content) {
          throw new Error(`Couldn't read ${document.uri.path}: no content`)
        }

        let decompressedContent = await wawoff2.decompress(content)
        fileContent = Array.from(decompressedContent)
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.warn(`Couldn't decompress file content ${err}`)
      }
    }

    panel.webview.html = this.getWebviewContent()

    panel.webview.postMessage({
      type: 'FONT_LOADED',
      payload: {
        fileUrl: `${fileUri.scheme}://${fileUri.authority}${fileUri.path}`,
        fileContent,
        fileName: document.fileName,
        fileExtension: document.extension
      }
    })

    panel.webview.onDidReceiveMessage((message: WebviewMessage) =>
      this.onDidReceiveMessage(panel, message)
    )

    const colorThemeListener = vscode.window.onDidChangeActiveColorTheme(event => {
      panel.webview.postMessage({
        type: 'COLOR_THEME_CHANGE',
        payload: event.kind
      })
    })

    panel.onDidDispose(() => colorThemeListener.dispose())
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
      case 'GET_CONFIG': {
        const config: ExtensionConfiguration =
          vscode.workspace.getConfiguration('font-preview')

        panel.webview.postMessage({
          type: 'CONFIG_LOADED',
          payload: {
            defaultTab: config.get('defaultTab')
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
