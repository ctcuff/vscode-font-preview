import opentype, { Glyph, Font } from 'opentype.js'
import React, { useContext } from 'react'
import FontContext from '../contexts/FontContext'
import useRefWithCallback from '../hooks/ref-with-callback'

type GlyphCanvasProps = {
  glyph: Glyph
}

const GLYPH_MARGIN = 5

const enableHighDPICanvas = (canvas: HTMLCanvasElement) => {
  const pixelRatio = window.devicePixelRatio || 1

  if (pixelRatio === 1) {
    return
  }

  const width = canvas.width
  const oldHeight = canvas.height

  canvas.width = width * pixelRatio
  canvas.height = oldHeight * pixelRatio
  canvas.style.width = `${width}px`
  canvas.style.height = `${oldHeight}px`

  canvas.getContext('2d')?.scale(pixelRatio, pixelRatio)
}

const drawArrow = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  const arrowLength = 10
  const arrowAperture = 4
  const dx = x2 - x1
  const dy = y2 - y1
  const segmentLength = Math.sqrt(dx * dx + dy * dy)
  const unitX = dx / segmentLength
  const unitY = dy / segmentLength
  const baseX = x2 - arrowLength * unitX
  const baseY = y2 - arrowLength * unitY
  const normalX = arrowAperture * unitY
  const normalY = -arrowAperture * unitX

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

  ctx.fillStyle = '#000000'

  arrows.forEach(arrow => drawArrow(...arrow))
}

/**
 * Handles rendering information about the font's tables on the canvas
 */
const initGlyphDisplay = (canvas: HTMLCanvasElement, font: Font) => {
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
  context.fillStyle = '#a0a0a0'

  hLine('Baseline', 0)
  hLine('yMax', font.tables.head.yMax)
  hLine('yMin', font.tables.head.yMin)
  hLine('Ascender', font.tables.hhea.ascender)
  hLine('Descender', font.tables.hhea.descender)
}

const displayGlyph = (canvas: HTMLCanvasElement, font: opentype.Font, glyph: Glyph) => {
  const pixelRatio = window.devicePixelRatio || 1
  const ctx = canvas.getContext('2d')
  const width = canvas.width / pixelRatio
  const height = canvas.height / pixelRatio
  const head = font.tables.head
  const maxHeight = head.yMax - head.yMin
  const maxWidth = width - GLYPH_MARGIN * 2

  if (!ctx) {
    return
  }

  ctx.clearRect(0, 0, width, height)

  const glyphHeight = height - GLYPH_MARGIN * 2
  const glyphScale = Math.min(maxWidth / (head.xMax - head.xMin), glyphHeight / maxHeight)
  const glyphSize = glyphScale * font.unitsPerEm
  const glyphBaseline = GLYPH_MARGIN + (glyphHeight * head.yMax) / maxHeight

  const glyphWidth = glyph.advanceWidth * glyphScale
  const xMin = (width - glyphWidth) / 2
  const xMax = (width + glyphWidth) / 2
  const markSize = 10

  ctx.fillStyle = '#606060'

  ctx.fillRect(xMin - markSize + 1, glyphBaseline, markSize, 1)
  ctx.fillRect(xMin, glyphBaseline, 1, markSize)
  ctx.fillRect(xMax, glyphBaseline, markSize, 1)
  ctx.fillRect(xMax, glyphBaseline, 1, markSize)

  ctx.textAlign = 'center'

  ctx.fillText('0', xMin, glyphBaseline + markSize + 10)
  ctx.fillText(`${glyph.advanceWidth}`, xMax, glyphBaseline + markSize + 10)

  ctx.fillStyle = '#000000'

  const path = glyph.getPath(xMin, glyphBaseline, glyphSize)

  path.fill = '#808080'
  path.stroke = '#000000'
  path.strokeWidth = 1.5

  drawPathWithArrows(ctx, path)

  glyph.drawPoints(ctx, xMin, glyphBaseline, glyphSize)
}

const GlyphCanvas = ({ glyph }: GlyphCanvasProps): JSX.Element => {
  const canvasSize = 500
  const { font } = useContext(FontContext)
  const setCanvasBgRef = useRefWithCallback<HTMLCanvasElement>(canvas => {
    enableHighDPICanvas(canvas)
    initGlyphDisplay(canvas, font)
  })

  const setCanvasGlyphRef = useRefWithCallback<HTMLCanvasElement>(canvas => {
    enableHighDPICanvas(canvas)
    displayGlyph(canvas, font, glyph)
  })

  return (
    <>
      <canvas width={canvasSize} height={canvasSize} ref={setCanvasGlyphRef} />
      <canvas width={canvasSize} height={canvasSize} ref={setCanvasBgRef} />
    </>
  )
}

export default GlyphCanvas
