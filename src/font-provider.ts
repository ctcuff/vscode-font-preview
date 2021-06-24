import * as vscode from 'vscode'
import * as path from 'path'
import html from './index.html'
import { template } from './util'
import FontDocument from './font-document'
import { WebviewMessage } from '../shared/webview-message'

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
      localResourceRoots: [
        vscode.Uri.file(path.join(this.context.extensionPath, 'web-dist'))
      ]
    }

    const content = await document.getContent()

    if (!content) {
      return
    }

    this.postMessage(panel, {
      type: 'LOAD',
      payload: {
        // postMessage can't handle a Uint8Array so we have to
        // send an array of numbers instead.
        fileContent: Array.from(content),
        fileName: document.fileName,
        extension: document.extension,
        base64Content: Buffer.from(content).toString('base64')
      }
    })

    panel.webview.onDidReceiveMessage(this.onDidReceiveMessage)

    panel.webview.html = this.getWebviewContent()
  }

  private postMessage(panel: vscode.WebviewPanel, message: WebviewMessage): void {
    panel.webview.postMessage(message)
  }

  private onDidReceiveMessage(message: WebviewMessage): void {
    switch (message.type.toUpperCase()) {
      case 'ERROR':
        vscode.window.showErrorMessage(message.payload)
        break
      case 'WARNING':
        vscode.window.showWarningMessage(message.payload)
    }
  }

  private getWebviewContent(): string {
    const webDistPath = vscode.Uri.file(
      path.join(this.context.extensionPath, 'web-dist', 'index.js')
    )

    const reactAppUri = webDistPath.with({ scheme: 'vscode-resource' }).toString()

    return template(html, { reactAppUri })
  }
}

export default FontProvider
