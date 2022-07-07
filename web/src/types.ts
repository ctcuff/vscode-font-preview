import type { WebviewApi } from 'vscode-webview'
import type { FontLoadEvent, WebviewMessage } from '../../shared/types'

/**
 * Represents the state saved when the content of the webview
 * panel is destroyed.
 */
export type GlobalSavedState = FontLoadEvent['payload']

/**
 * VS Code's webview API doesn't give a type to `postMessage`'s parameter
 * so it needs to be extended and modified manually.
 */
export interface TypedWebviewApi extends WebviewApi<GlobalSavedState> {
  postMessage(message: WebviewMessage): void
}
