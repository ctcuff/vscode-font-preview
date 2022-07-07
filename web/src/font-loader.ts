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
   * the font to be accessed anywhere in a stylesheet.
   */
  public insertStyle(arrayBuffer: ArrayBuffer): void {
    const style = document.createElement('style')
    const mimeType = this.getFontMimeType()
    const base64Content = base64ArrayBuffer(arrayBuffer)

    // Using var() in the template string doesn't load the font family
    // so it has to be grabbed from the root element
    const fontFamilyName = getCSSVar('--font-family-name')

    style.id = 'font-preview'
    style.innerHTML = /* css */ `
        @font-face {
          font-family: ${fontFamilyName};
          src:
            url("data:font/${mimeType};base64,${base64Content}")
            format("${mimeType}");
        }`

    document.head.insertAdjacentElement('beforeend', style)
  }

  private async fetchFileBuffer(): Promise<ArrayBuffer> {
    const res = await fetch(this.opts.fileUrl)
    const buffer = await res.arrayBuffer()
    return buffer
  }

  public async loadFont(): Promise<FontPayload> {
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
}

export default FontLoader
