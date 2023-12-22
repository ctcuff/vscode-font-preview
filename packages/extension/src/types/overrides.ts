import type { WebviewMessage } from '@font-preview/shared'
import type { Webview, WebviewPanel } from 'vscode'

/**
 * VS Code's webview API doesn't give a type to `postMessage`'s parameter
 * so it needs to be extended and modified manually.
 */
export interface TypedWebview extends Webview {
  postMessage(message: WebviewMessage): Thenable<boolean>
}

export interface TypedWebviewPanel extends WebviewPanel {
  webview: TypedWebview
}
