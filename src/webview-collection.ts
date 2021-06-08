/* eslint-disable no-console */
import * as vscode from 'vscode'

type CollectionItem = {
  uri: vscode.Uri
  webviewPanel: vscode.WebviewPanel
}

/**
 * A Helper class that holds a reference to all open webview panels
 */
class WebviewCollection {
  private readonly views: {
    [id: string]: vscode.WebviewPanel
  }

  constructor() {
    this.views = {}
  }

  public add(item: CollectionItem): void {
    const key = item.uri.toString()

    if (this.views[key]) {
      console.warn(`Panel with uri ${key} will be overridden!`)
    }

    // Called when the panel is closed
    item.webviewPanel.onDidDispose(() => {
      this.remove(item.uri)
    })

    this.views[key] = item.webviewPanel
  }

  public get(uri: vscode.Uri): vscode.WebviewPanel | undefined {
    return this.views[uri.toString()]
  }

  public remove(uri: vscode.Uri): void {
    const key = uri.toString()

    if (!this.views[key]) {
      console.warn(`Panel with uri ${key} not found`)
      return
    }

    delete this.views[key]
  }
}

export default WebviewCollection
