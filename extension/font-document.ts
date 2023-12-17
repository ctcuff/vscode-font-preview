import * as vscode from 'vscode'
import * as path from 'path'
import * as wawoff2 from 'wawoff2'
import { FontExtension } from '../shared/types'

class FontDocument implements vscode.CustomDocument {
  public readonly uri: vscode.Uri
  public readonly fileName: string
  public readonly extension: FontExtension

  constructor(uri: vscode.Uri) {
    const { name, ext } = path.parse(uri.fsPath)

    this.uri = uri
    this.fileName = name
    this.extension = ext.replace('.', '') as FontExtension
  }

  dispose(): void {}

  public async size(): Promise<number> {
    try {
      const { size } = await vscode.workspace.fs.stat(this.uri)
      return size
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error(`Failed to retrieve file size: ${err}`)
      return -1
    }
  }

  public async read(): Promise<Uint8Array | null> {
    try {
      const content = await vscode.workspace.fs.readFile(this.uri)

      // WOFF2 fonts are compressed and can't be parsed by opentype.js so we
      // we need to decompress it and send the file contents using postMessage
      if (this.extension === 'woff2') {
        try {
          return await wawoff2.decompress(content)
        } catch (err: any) {
          // eslint-disable-next-line no-console
          console.warn(`Couldn't decompress file content ${err}`)
        }
      }

      return content
    } catch (err: any) {
      vscode.window.showErrorMessage(`Couldn't read file: ${err.message}`)
      return null
    }
  }
}

export default FontDocument
