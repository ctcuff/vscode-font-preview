import * as vscode from 'vscode'
import Disposable from './disposable'

class FontDocument extends Disposable implements vscode.CustomDocument {
  public readonly uri: vscode.Uri

  constructor(uri: vscode.Uri) {
    super()
    this.uri = uri
  }

  /**
   * Returns the content of the font file.
   */
  public async getContent(): Promise<number[] | null> {
    try {
      const fileContent = await vscode.workspace.fs.readFile(this.uri)

      // postMessage can't handle a Uint8Array so we have to send an
      // array of numbers instead.
      return Array.from(fileContent)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
    }

    return null
  }
}

export default FontDocument
