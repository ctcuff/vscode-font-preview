import opentype, { Font } from 'opentype.js'
import { FontExtension } from '../../shared/types'
import FontLoadError from './font-load-error'

type FontLoaderOptions = {
  fileExtension: FontExtension
  fileContent: number[]
  fileName: string
  base64Content: string
}

type FontFeature = {
  tag: string
}

type FontPayload = {
  font: Font
  features: string[]
}

/**
 * Fonts that can be parsed by opentype
 */
const supportedExtensions: ReadonlySet<FontExtension> = new Set<FontExtension>([
  'otf',
  'ttf',
  'woff'
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
  public insertStyle(): void {
    const style = document.createElement('style')
    const mimeType = this.getFontMimeType()

    // Using var() in the template string doesn't load the font family
    // so it has to be grabbed from the root element
    const fontFamilyName = getComputedStyle(document.documentElement).getPropertyValue(
      '--font-family-name'
    )

    style.id = 'font-preview'
    style.innerHTML = /* css */ `
      @font-face {
        font-family: ${fontFamilyName};
        src:
          url("data:font/${mimeType};base64,${this.opts.base64Content}")
          format("${mimeType}");
      }`

    document.head.insertAdjacentElement('beforeend', style)
  }

  public loadFont(): FontPayload {
    const { fileExtension, fileContent } = this.opts

    // Opentype can't parse some font types (like woff2 and ttc). In that case, we don't
    // wan't to throw an error since those fonts can still be rendered in the window so
    // we'll just return a dummy object
    if (!supportedExtensions.has(fileExtension)) {
      return {
        font: {} as Font,
        features: []
      }
    }

    const font = opentype.parse(new Uint8Array(fileContent).buffer)

    if (!font.supported) {
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
