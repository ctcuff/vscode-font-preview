import * as vscode from 'vscode';
import * as path from 'path';
import * as wawoff2 from 'wawoff2';
import { FontExtension } from '@font-preview/shared';
import Logger from './logger';

const LOG_TAG = 'FontDocument';

class FontDocument implements vscode.CustomDocument {
  /**
   * The file name without the extension
   */
  public readonly fileName: string;
  /**
   * The file name with the extension
   */
  public readonly fullFileName: string;
  public readonly extension: FontExtension;

  constructor(public readonly uri: vscode.Uri, private readonly logger: Logger) {
    const { name, ext } = path.parse(uri.fsPath);

    this.fileName = name;
    this.fullFileName = `${name}.${ext}`;
    this.extension = ext.replace('.', '').toLowerCase() as FontExtension;
  }

  dispose(): void {}

  /**
   * @returns The size of the file in bytes
   */
  public async size(): Promise<number> {
    try {
      const { size } = await vscode.workspace.fs.stat(this.uri);
      return size;
    } catch (error: unknown) {
      this.logger.error({
        message: 'Failed to retrieve file size',
        tag: LOG_TAG,
        error
      });
      return -1;
    }
  }

  /**
   * WOFF2 fonts are compressed and can't be parsed by opentype.js so
   * we need to decompress it and send the file contents using postMessage
   *
   * @returns The decompressed TTF content represented as a Uint8Array
   */
  public async decompress(): Promise<Uint8Array | null> {
    if (this.extension !== 'woff2') {
      this.logger.warn({
        message: "decompress called on a font with extension that isn't WOFF2",
        tag: LOG_TAG
      });
      return null;
    }

    this.logger.startTimer(LOG_TAG);

    let content: Uint8Array | null = null;

    try {
      content = await vscode.workspace.fs.readFile(this.uri);
    } catch (error: unknown) {
      this.logger.endTimer(LOG_TAG);
      this.logger.error({
        error,
        message: "Couldn't read file",
        tag: LOG_TAG
      });
      vscode.window.showErrorMessage("Couldn't read file");
      return null;
    }

    try {
      content = await wawoff2.decompress(content);

      const decompressTime = this.logger.endTimer(LOG_TAG).toFixed(2);

      this.logger.info({
        message: `Font decompressed in ${decompressTime} ms`,
        tag: LOG_TAG
      });
    } catch (error: unknown) {
      this.logger.endTimer(LOG_TAG);
      this.logger.error({
        error,
        message: "Couldn't decompress file content",
        tag: LOG_TAG
      });
    }

    return content;
  }
}

export default FontDocument;
