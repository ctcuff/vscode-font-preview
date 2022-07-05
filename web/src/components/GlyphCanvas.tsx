import opentype, { Glyph, Font } from 'opentype.js'
import React, { useContext } from 'react'
import FontContext from '../contexts/FontContext'
import useRefWithCallback from '../hooks/ref-with-callback'
import { enableHighDPICanvas } from '../glyph-util'
import { getCSSVar } from '../util'

type GlyphCanvasProps = {
  glyph: Glyph
  width: number
  height: number
}

const GLYPH_MARGIN = 16
const MARK_SIZE = 15
const ARROW_LENGTH = 10
const ARROW_APERTURE = 6

const drawArrow = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  const dx = x2 - x1
  const dy = y2 - y1
  const segmentLength = Math.sqrt(dx * dx + dy * dy)
  const unitX = dx / segmentLength
  const unitY = dy / segmentLength
  const baseX = x2 - ARROW_LENGTH * unitX
  const baseY = y2 - ARROW_LENGTH * unitY
  const normalX = ARROW_APERTURE * unitY
  const normalY = -ARROW_APERTURE * unitX

  ctx.beginPath()
  ctx.moveTo(x2, y2)
  ctx.lineTo(baseX + normalX, baseY + normalY)
  ctx.lineTo(baseX - normalX, baseY - normalY)
  ctx.lineTo(x2, y2)
  ctx.closePath()
  ctx.fill()
}

const drawPathWithArrows = (ctx: CanvasRenderingContext2D, path: opentype.Path) => {
  let i: number
  let cmd: opentype.PathCommand
  let x1: number | undefined
  let y1: number | undefined
  let x2: number | undefined
  let y2: number | undefined
  const arrows: [CanvasRenderingContext2D, number, number, number, number][] = []

  ctx.beginPath()

  for (i = 0; i < path.commands.length; i += 1) {
    cmd = path.commands[i]
    if (cmd.type === 'M') {
      if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
        arrows.push([ctx, x1, y1, x2, y2])
      }
      ctx.moveTo(cmd.x, cmd.y)
    } else if (cmd.type === 'L') {
      ctx.lineTo(cmd.x, cmd.y)
      x1 = x2
      y1 = y2
    } else if (cmd.type === 'C') {
      ctx.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y)
      x1 = cmd.x2
      y1 = cmd.y2
    } else if (cmd.type === 'Q') {
      ctx.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y)
      x1 = cmd.x1
      y1 = cmd.y1
    } else if (cmd.type === 'Z') {
      if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
        arrows.push([ctx, x1, y1, x2, y2])
      }
      ctx.closePath()
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    x2 = (cmd as any).x
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y2 = (cmd as any).y
  }

  if (path.fill) {
    ctx.fillStyle = path.fill
    ctx.fill()
  }

  if (path.stroke) {
    ctx.strokeStyle = path.stroke
    ctx.lineWidth = path.strokeWidth
    ctx.stroke()
  }

  ctx.fillStyle = '#00FF00'

  arrows.forEach(arrow => drawArrow(...arrow))
}

const renderTableInfo = (canvas: HTMLCanvasElement, font: Font) => {
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

    context.fillText(text, 2, ypx + 3)
    context.fillRect(80, ypx, width, 1)
  }

  context.clearRect(0, 0, width, height)

  context.fillStyle = getCSSVar('--vscode-editor-foreground', '--theme-foreground')
  context.font = `13px ${getCSSVar('--vscode-font-family', '--theme-font-family')}`

  hLine('baseline', 0)
  hLine('ascender', font.tables.hhea.ascender)
  hLine('descender', font.tables.hhea.descender)
}

const renderGlyph = (canvas: HTMLCanvasElement, font: opentype.Font, glyph: Glyph) => {
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

  context.fillStyle = getCSSVar('--vscode-editor-foreground', '--theme-foreground')

  context.fillRect(xMin - MARK_SIZE + 1, glyphBaseline, MARK_SIZE, 1)
  context.fillRect(xMin, glyphBaseline, 1, MARK_SIZE)
  context.fillRect(xMax, glyphBaseline, MARK_SIZE, 1)
  context.fillRect(xMax, glyphBaseline, 1, MARK_SIZE)

  context.textAlign = 'center'
  context.font = `12px ${getCSSVar('--vscode-font-family', '--theme-font-family')}`

  context.fillText('0', xMin, glyphBaseline + MARK_SIZE + 10)
  context.fillText(`${glyph.advanceWidth}`, xMax, glyphBaseline + MARK_SIZE + 10)

  context.fillStyle = '#808080'

  const path = glyph.getPath(xMin, glyphBaseline, glyphSize)

  path.fill = '#808080'
  path.stroke = '#808080'
  path.strokeWidth = 2.5

  path.fill = getCSSVar('--vscode-editor-foreground', '--theme-foreground')

  drawPathWithArrows(context, path)

  glyph.drawPoints(context, xMin, glyphBaseline, glyphSize)
}

const GlyphCanvas = ({ glyph, width, height }: GlyphCanvasProps): JSX.Element => {
  const { font } = useContext(FontContext)

  // Displays baseline, ascender, and descender info
  const setCanvasBgRef = useRefWithCallback<HTMLCanvasElement>(canvas => {
    enableHighDPICanvas(canvas, width, height)
    renderTableInfo(canvas, font)
  })

  // Renders the glyph
  const setCanvasGlyphRef = useRefWithCallback<HTMLCanvasElement>(canvas => {
    enableHighDPICanvas(canvas, width, height)
    renderGlyph(canvas, font, glyph)
  })

  return (
    <>
      <canvas width={width} height={height} ref={setCanvasGlyphRef} />
      <canvas width={width} height={height} ref={setCanvasBgRef} />
    </>
  )
}

export default GlyphCanvas
