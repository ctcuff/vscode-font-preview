import * as vscode from 'vscode'

class FontDocument implements vscode.CustomDocument {
  public readonly uri: vscode.Uri

  constructor(uri: vscode.Uri) {
    this.uri = uri
  }

  dispose(): void {}

  public async getContent(): Promise<Uint8Array | null> {
    try {
      return await vscode.workspace.fs.readFile(this.uri)
    } catch (err) {
      vscode.window.showErrorMessage(err.message)
    }

    return null
  }
}

export default FontDocument
