/* eslint-disable */
// @ts-ignore
// Ignored because TypeScript doesn't have type definitions
// for webpack's inline loader
import workerUrl from 'worker-plugin/loader!./font-worker'
/* eslint-enable */
import opentype, { Font } from 'opentype.js'
import { FontExtension, FontLoadEvent } from '../../shared/types'
import FontLoadError from './font-load-error'
import { base64ArrayBuffer, getCSSVar } from './util'

type FontLoaderOptions = FontLoadEvent['payload']

type FontFeature = {
  tag: string
}

type FontPayload = {
  font: Font
  features: string[]
}

// https://chromium.googlesource.com/chromium/blink/+/refs/heads/main/Source/platform/fonts/opentype/OpenTypeSanitizer.cpp#70
const MAX_WEB_FONT_SIZE = 30 * 1024 * 1024 // MB

/**
 * Fonts that can be parsed by opentype
 */
const supportedExtensions: ReadonlySet<FontExtension> = new Set<FontExtension>([
  'otf',
  'ttf',
  'woff',
  'woff2'
])

class FontLoader {
  private opts: FontLoaderOptions
  private worker: Worker | null = null

  /**
   * True if the font can be parsed by Opentype, false otherwise
   */
  public supported: boolean

  constructor(opts: FontLoaderOptions) {
    this.opts = opts
    this.supported = supportedExtensions.has(this.opts.fileExtension)
  }

  public getFontMimeType(): string {
    const { fileExtension } = this.opts

    switch (fileExtension) {
      case 'otf':
        return 'opentype'
      case 'ttf':
      case 'ttc':
        return 'truetype'
      case 'woff':
      case 'woff2':
        return 'woff'
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unsupported extension: ${fileExtension}`)
        return ''
    }
  }

  /**
   * Creates and inserts a <style> element with the loaded font. This allows
   * the font to be accessed anywhere in a stylesheet. If the worker was successfully
   * initialized, this will be done off the main thread to spare resources. Otherwise,
   * this will be done synchronously
   */
  public insertStyle(buffer: ArrayBuffer): void {
    if (this.worker) {
      this.insertStyleWithWorker(buffer)
    } else {
      this.insertStyleSync(buffer)
    }
  }

  public async loadFont(): Promise<FontPayload> {
    if (!this.worker) {
      this.worker = await this.initWorker()
    }

    const { fileExtension } = this.opts

    // WOFF2 needs to be decompressed so we need to use the file data
    // coming from VSCode instead of fetching it
    const buffer =
      this.opts.fileExtension === 'woff2'
        ? new Uint8Array(this.opts.fileContent).buffer
        : await this.fetchFileBuffer()

    if (this.opts.fileSize <= MAX_WEB_FONT_SIZE) {
      this.insertStyle(buffer)
    }

    // Opentype can't parse some font types (like ttc). In that case, we don't
    // wan't to throw an error since those fonts can still be rendered in the window so
    // we'll just return a dummy object
    if (!supportedExtensions.has(fileExtension)) {
      return {
        font: {} as Font,
        features: []
      }
    }

    const font = opentype.parse(buffer)

    // WOFF2 is supported thanks to the wawoff2 decompression library but it's hardcoded
    // to be unsupported by opentype
    if (!font.supported && fileExtension !== 'woff2') {
      throw new FontLoadError()
    }

    // gpos and gsub contain information about the different features available
    // for the font (kern, tnum, sups, etc).
    const { gpos, gsub } = font.tables

    const gposFeatures: string[] =
      gpos?.features?.map((feature: FontFeature) => feature.tag) || []
    const gsubFeatures: string[] =
      gsub?.features?.map((feature: FontFeature) => feature.tag) || []

    const features = new Set<string>(
      [...gposFeatures, ...gsubFeatures]
        .sort((a, b) => a.localeCompare(b))
        .filter(str => !!str.trim())
    )

    return { font, features: Array.from(features) }
  }

  private async fetchFileBuffer(): Promise<ArrayBuffer> {
    const res = await fetch(this.opts.fileUrl)
    const buffer = await res.arrayBuffer()
    return buffer
  }

  private async initWorker(): Promise<Worker | null> {
    // Workers are only supported using data: or blob: uris so
    // we need to use fetch and load the worker src as a blob
    // https://github.com/Microsoft/vscode-docs/blob/eb58fbbf6c26e781f33aec963eeba0139337ba87/api/extension-guides/webview.md#using-web-workers
    try {
      const res = await fetch(workerUrl)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const worker = new Worker(blobUrl, { type: 'module' })

      return worker
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error(`Failed to initialize worker: ${err}`)
      return null
    }
  }

  private insertStyleSync(buffer: ArrayBuffer): void {
    const base64Content = base64ArrayBuffer(buffer)
    this.addStyleToDom(base64Content)
  }

  private insertStyleWithWorker(buffer: ArrayBuffer): void {
    // Shouldn't make it here but just in case...
    if (!this.worker) {
      this.insertStyleSync(buffer)
      return
    }

    this.worker.onmessage = ({ data }: MessageEvent<string>) => this.addStyleToDom(data)
    this.worker.postMessage(buffer)
  }

  private addStyleToDom(base64Font: string): void {
    const style = document.createElement('style')
    const mimeType = this.getFontMimeType()

    // Using var() in the template string doesn't load the font family
    // so it has to be grabbed from the root element
    const fontFamilyName = getCSSVar('--font-family-name')

    style.id = 'font-preview'
    style.innerHTML = /* css */ `
        @font-face {
          font-family: ${fontFamilyName};
          src:
            url("data:font/${mimeType};base64,${base64Font}")
            format("${mimeType}");
        }`

    document.head.insertAdjacentElement('beforeend', style)
  }
}

export default FontLoader
