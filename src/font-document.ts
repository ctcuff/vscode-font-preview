import * as vscode from 'vscode'
import * as path from 'path'

class FontDocument implements vscode.CustomDocument {
  public readonly uri: vscode.Uri
  public readonly fileName: string
  public readonly extension: string

  constructor(uri: vscode.Uri) {
    this.uri = uri
    this.fileName = path.parse(uri.fsPath).name
    this.extension = path.extname(uri.fsPath).replace('.', '')
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
