import { createContext } from 'react'
import type { Contour, Font, Metrics, Glyph } from 'opentype.js'

export type GlyphDataCache = {
  readonly contours: Contour
  readonly numPoints: number
  readonly metrics: Metrics
  readonly index: number
}

type FontContextProps = {
  font: Font
  /**
   * Holds a reference to the filename of the font (without the extension)
   * in case the name of the font can be accessed through opentype
   */
  fileName: string
  /**
   * A list of features for this font from the `gpos` and `gsub` tables
   */
  fontFeatures: string[]
  /**
   * A list of all the glyphs found in the `font` object
   */
  glyphs: Glyph[]
  /**
   * Holds a copy of all the glyphs in the `font` object so th at all glyph
   * metrics, paths, and contours only need to be calculated once during load
   */
  glyphDataCache: GlyphDataCache[]
}

const FontContext = createContext<FontContextProps>({
  // A dummy object is provided here because the App component makes sure
  // that the context is never initialized with a null value. Because of
  // that, we need a fake Font object so TS doesn't complain
  font: {} as Font,
  fileName: '',
  fontFeatures: [],
  glyphs: [],
  glyphDataCache: []
})

export default FontContext
