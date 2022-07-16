import React, { useContext } from 'react'
import type { Glyph, Font, Path } from 'opentype.js'
import FontContext from '../contexts/FontContext'
import useRefWithCallback from '../hooks/ref-with-callback'
import { enableHighDPICanvas } from '../glyph-util'
import { getCSSVar } from '../util'

export type RenderField =
  | 'ascender'
  | 'baseline'
  | 'descender'
  | 'capHeight'
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

const GLYPH_MARGIN = 16
const MARK_SIZE = 15

const drawGlyphPath = (context: CanvasRenderingContext2D, path: Path) => {
  context.beginPath()

  for (let i = 0; i < path.commands.length; i++) {
    const cmd = path.commands[i]
    switch (cmd.type) {
      case 'M':
        context.moveTo(cmd.x, cmd.y)
        break
      case 'L':
        context.lineTo(cmd.x, cmd.y)
        break
      case 'C':
        context.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y)
        break
      case 'Q':
        context.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y)
        break
      case 'Z':
        context.closePath()
        break
      default:
        break
    }
  }

  if (path.fill) {
    context.fillStyle = path.fill
    context.fill()
  }

  if (path.stroke) {
    context.strokeStyle = path.stroke
    context.lineWidth = path.strokeWidth
    context.stroke()
  }

  context.fillStyle = '#00FF00'
}

const renderTableInfo = (
  canvas: HTMLCanvasElement,
  font: Font,
  renderFields: RenderField[]
) => {
  const pixelRatio = window.devicePixelRatio || 1
  const width = canvas.width / pixelRatio
  const height = canvas.height / pixelRatio
  const glyphHeight = height - GLYPH_MARGIN * 2
  const head = font.tables.head
  const maxHeight = head.yMax - head.yMin
  const context = canvas.getContext('2d')

  if (!context) {
    return
  }

  const hLine = (text: string, yUnits: number) => {
    const maxWidth = width - GLYPH_MARGIN * 2
    const glyphScale = Math.min(
      maxWidth / (head.xMax - head.xMin),
      glyphHeight / maxHeight
    )
    const glyphBaseline = GLYPH_MARGIN + (glyphHeight * head.yMax) / maxHeight
    const ypx = glyphBaseline - yUnits * glyphScale

    context.fillText(text, 0, ypx + 3)
    context.fillRect(100, ypx, width, 1)
  }

  context.clearRect(0, 0, width, height)

  context.fillStyle = getCSSVar('--vscode-editor-foreground', '--theme-foreground')
  context.font = `13px ${getCSSVar('--vscode-font-family', '--theme-font-family')}`

  if (renderFields.includes('baseline')) {
    hLine('baseline', 0)
  }

  if (renderFields.includes('ascender')) {
    hLine('ascender', font.tables.hhea.ascender)
  }

  if (renderFields.includes('descender')) {
    hLine('descender', font.tables.hhea.descender)
  }

  if (renderFields.includes('yMin')) {
    hLine('yMin', font.tables.head.yMin)
  }

  if (renderFields.includes('yMax')) {
    hLine('yMax', font.tables.head.yMax)
  }

  if (renderFields.includes('sTypoAscender') && font.tables.os2?.sTypoAscender) {
    hLine('sTypoAscender', font.tables.os2.sTypoAscender)
  }

  if (renderFields.includes('sTypoDescender') && font.tables.os2?.sTypoDescender) {
    hLine('sTypoDescender', font.tables.os2.sTypoDescender)
  }

  if (renderFields.includes('capHeight') && font.tables.os2?.sCapHeight) {
    hLine('capHeight', font.tables.os2.sCapHeight)
  }

  if (renderFields.includes('sxHeight') && font.tables.os2?.sxHeight) {
    hLine('sxHeight', font.tables.os2.sxHeight)
  }
}

const renderGlyph = (
  canvas: HTMLCanvasElement,
  font: Font,
  glyph: Glyph,
  renderFields: RenderField[]
) => {
  const pixelRatio = window.devicePixelRatio || 1
  const context = canvas.getContext('2d')
  const width = canvas.width / pixelRatio
  const height = canvas.height / pixelRatio
  const head = font.tables.head
  const maxHeight = head.yMax - head.yMin
  const maxWidth = width - GLYPH_MARGIN * 2

  if (!context) {
    return
  }

  context.clearRect(0, 0, width, height)

  const glyphHeight = height - GLYPH_MARGIN * 2
  const glyphScale = Math.min(maxWidth / (head.xMax - head.xMin), glyphHeight / maxHeight)
  const glyphSize = glyphScale * font.unitsPerEm
  const glyphBaseline = GLYPH_MARGIN + (glyphHeight * head.yMax) / maxHeight
  const glyphWidth = glyph.advanceWidth * glyphScale
  const xMin = (width - glyphWidth) / 2
  const xMax = (width + glyphWidth) / 2

  if (renderFields.includes('width')) {
    context.fillStyle = getCSSVar('--vscode-editor-foreground', '--theme-foreground')

    context.fillRect(xMin - MARK_SIZE + 1, glyphBaseline, MARK_SIZE, 1)
    context.fillRect(xMin, glyphBaseline, 1, MARK_SIZE)
    context.fillRect(xMax, glyphBaseline, MARK_SIZE, 1)
    context.fillRect(xMax, glyphBaseline, 1, MARK_SIZE)

    context.textAlign = 'center'
    context.font = `12px ${getCSSVar('--vscode-font-family', '--theme-font-family')}`

    context.fillText('0', xMin, glyphBaseline + MARK_SIZE + 10)
    context.fillText(`${glyph.advanceWidth}`, xMax, glyphBaseline + MARK_SIZE + 10)
  }

  context.fillStyle = '#808080'

  // Using getPath instead of drawPath so we can change the color of the fill
  const path = glyph.getPath(xMin, glyphBaseline, glyphSize)

  if (renderFields.includes('stroke')) {
    path.fill = '#808080'
    path.stroke = '#808080'
    path.strokeWidth = 2
  }

  path.fill = renderFields.includes('fill')
    ? getCSSVar('--vscode-editor-foreground', '--theme-foreground')
    : 'transparent'

  drawGlyphPath(context, path)

  if (renderFields.includes('points')) {
    glyph.drawPoints(context, xMin, glyphBaseline, glyphSize)
  }
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
    enableHighDPICanvas(canvas, width, height)
    renderTableInfo(canvas, font, renderFields)
  })

  // Renders the glyph
  const setCanvasGlyphRef = useRefWithCallback<HTMLCanvasElement>(canvas => {
    enableHighDPICanvas(canvas, width, height)
    renderGlyph(canvas, font, glyph, renderFields)
  })

  return (
    <>
      <canvas width={width} height={height} ref={setCanvasBgRef} />
      <canvas width={width} height={height} ref={setCanvasGlyphRef} />
    </>
  )
}

export default GlyphCanvas
