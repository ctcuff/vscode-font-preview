import type { Config, WebviewMessage } from '../../shared/types'
import type { Webview, WebviewPanel, WorkspaceConfiguration } from 'vscode'

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

export interface ExtensionConfiguration extends WorkspaceConfiguration {
  get<T extends keyof Config>(section: T): Config[T]
}
