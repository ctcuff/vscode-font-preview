import * as vscode from 'vscode'
import * as path from 'path'
import * as wawoff2 from 'wawoff2'
import { FontExtension } from '../shared/types'
import Logger from './logger'

const LOG_TAG = 'FontDocument'

class FontDocument implements vscode.CustomDocument {
  public readonly uri: vscode.Uri
  /**
   * The file name without the extension
   */
  public readonly fileName: string
  /**
   * The file name with the extension
   */
  public readonly fullFileName: string
  public readonly extension: FontExtension
  private readonly logger = Logger.getInstance()

  constructor(uri: vscode.Uri) {
    const { name, ext } = path.parse(uri.fsPath)

    this.uri = uri
    this.fileName = name
    this.fullFileName = `${name}.${ext}`
    this.extension = ext.replace('.', '') as FontExtension
  }

  dispose(): void {}

  /**
   * @returns The size of the file in bytes
   */
  public async size(): Promise<number> {
    try {
      const { size } = await vscode.workspace.fs.stat(this.uri)
      return size
    } catch (err: unknown) {
      this.logger.error('Failed to retrieve file size', LOG_TAG, err)
      return -1
    }
  }

  /**
   * WOFF2 fonts are compressed and can't be parsed by opentype.js so
   * we need to decompress it and send the file contents using postMessage
   */
  public async decompress(): Promise<Uint8Array | null> {
    if (this.extension !== 'woff2') {
      this.logger.warn(
        "decompress called on a font with extension that isn't WOFF2",
        LOG_TAG
      )
      return null
    }

    this.logger.startTimer(LOG_TAG)

    let content: Uint8Array | null = null

    try {
      content = await vscode.workspace.fs.readFile(this.uri)
    } catch (err: unknown) {
      this.logger.error("Couldn't read file", LOG_TAG, err)
      vscode.window.showErrorMessage("Couldn't read file")
      return null
    }

    try {
      content = await wawoff2.decompress(content)

      this.logger.info(
        `Font decompressed in ${this.logger.endTimer(LOG_TAG).toFixed(2)}ms`,
        LOG_TAG
      )
    } catch (err: unknown) {
      this.logger.error("Couldn't decompress file content", LOG_TAG, err)
    }

    return content
  }
}

export default FontDocument
