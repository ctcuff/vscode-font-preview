import { WebviewMessage } from '../../shared/webview-message'

interface VSCodeAPI {
  postMessage: (message: WebviewMessage) => void
  getState(): { [key: string]: unknown } | undefined
  setState(data: { [key: string]: unknown }): void
}

declare global {
  interface Window {
    /**
     * This method is exposed by vscode to allow webviews to pass messages
     * back to the extension. This method must **only** be called once.
     */
    acquireVsCodeApi: () => VSCodeAPI
  }
}
