import React, { useContext } from 'react'
import type { Glyph } from 'opentype.js'
import FontContext from '../contexts/FontContext'
import useRefWithCallback from '../hooks/ref-with-callback'
import * as glyphUtil from '../util/glyph-util'

export type RenderField =
  | 'ascender'
  | 'baseline'
  | 'descender'
  | 'sCapHeight'
  | 'fill'
  | 'points'
  | 'stroke'
  | 'sxHeight'
  | 'sTypoAscender'
  | 'sTypoDescender'
  | 'width'
  | 'yMax'
  | 'yMin'

type GlyphCanvasProps = {
  glyph: Glyph
  width: number
  height: number
  renderFields: RenderField[]
}

const GlyphCanvas = ({
  glyph,
  width,
  height,
  renderFields
}: GlyphCanvasProps): JSX.Element => {
  const { font } = useContext(FontContext)

  // Displays baseline, ascender, and descender info
  const setCanvasBgRef = useRefWithCallback<HTMLCanvasElement>(canvas => {
    glyphUtil.enableHighDPICanvas(canvas, width, height)
    glyphUtil.renderTableInfo(canvas, font, renderFields)
  })

  // Renders the glyph
  const setCanvasGlyphRef = useRefWithCallback<HTMLCanvasElement>(canvas => {
    glyphUtil.enableHighDPICanvas(canvas, width, height)
    glyphUtil.renderGlyph(canvas, font, glyph, renderFields)
  })

  return (
    <>
      <canvas width={width} height={height} ref={setCanvasBgRef} />
      <canvas width={width} height={height} ref={setCanvasGlyphRef} />
    </>
  )
}

export default GlyphCanvas
