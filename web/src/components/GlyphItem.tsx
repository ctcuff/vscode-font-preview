import '../scss/glyph-item.scss'
import React from 'react'
import { Font, Glyph } from 'opentype.js'
import useRefWithCallback from '../hooks/ref-with-callback'
import { enableHighDPICanvas } from '../glyph-util'
import { getCSSVar } from '../util'

const CELL_WIDTH = 120
const CELL_HEIGHT = 120
const CELL_MARGIN_TOP = 8
const CELL_MARGIN_BOTTOM = 8
const CELL_MARGIN_LEFT_RIGHT = 8
const CELL_MARK_SIZE = 4
const CANVAS_PADDING = 16

type GlyphItemProps = {
  glyph: Glyph
  onClick: (glyph: Glyph) => void
  font: Font
  showGlyphWidth: boolean
}

const renderGlyph = (
  canvas: HTMLCanvasElement,
  font: Font,
  glyphIndex: number,
  showGlyphWidth: boolean
) => {
  const context = canvas.getContext('2d')

  if (!context) {
    return
  }

  context.clearRect(0, 0, CELL_WIDTH, CELL_HEIGHT)

  context.fillStyle = getCSSVar('--vscode-editor-foreground', '--theme-foreground')
  context.font = `12px ${getCSSVar('--vscode-font-family', '--theme-font-family')}`

  context.fillText(`${glyphIndex}`, 0, CELL_HEIGHT)

  const width = CELL_WIDTH - CELL_MARGIN_LEFT_RIGHT * 2
  const height = CELL_HEIGHT - CELL_MARGIN_TOP - CELL_MARGIN_BOTTOM
  const head = font.tables.head
  const maxHeight = head.yMax - head.yMin
  const fontScale = Math.min(width / (head.xMax - head.xMin), height / maxHeight)
  const fontSize = fontScale * font.unitsPerEm
  const fontBaseline = CELL_MARGIN_TOP + (height * head.yMax) / maxHeight
  const glyph = font.glyphs.get(glyphIndex)
  const glyphWidth = glyph.advanceWidth * fontScale
  const xMin = (CELL_WIDTH - glyphWidth) / 2
  const xMax = (CELL_WIDTH + glyphWidth) / 2

  if (showGlyphWidth) {
    context.fillRect(xMin - CELL_MARK_SIZE + 1, fontBaseline, CELL_MARK_SIZE, 1)
    context.fillRect(xMin, fontBaseline, 1, CELL_MARK_SIZE)
    context.fillRect(xMax, fontBaseline, CELL_MARK_SIZE, 1)
    context.fillRect(xMax, fontBaseline, 1, CELL_MARK_SIZE)
  }

  // Not using glyph.draw() because the fill color defaults to black
  // https://github.com/opentypejs/opentype.js/issues/421#issuecomment-578496004
  const path = glyph.getPath(xMin, fontBaseline, fontSize)

  path.fill = getCSSVar('--vscode-editor-foreground', '--theme-foreground')
  path.draw(context)
}

const GlyphItem = ({
  glyph,
  onClick,
  font,
  showGlyphWidth
}: GlyphItemProps): JSX.Element => {
  const setCanvasRef = useRefWithCallback<HTMLCanvasElement>(canvas => {
    enableHighDPICanvas(canvas, CELL_WIDTH, CELL_HEIGHT)
    renderGlyph(canvas, font, glyph.index, showGlyphWidth)
  })

  return (
    <div
      className="glyph-item"
      title="Click to inspect"
      style={{
        width: CELL_WIDTH + CANVAS_PADDING,
        height: CELL_HEIGHT + CANVAS_PADDING
      }}
      onClick={() => onClick(glyph)}
      data-glyph-index={glyph.index}
    >
      <canvas width={CELL_WIDTH} height={CELL_HEIGHT} ref={setCanvasRef} />
      <div className="glyph-detail">{glyph.name || '(null)'}</div>
    </div>
  )
}

export default GlyphItem
