import type { Glyph, Font, Path } from 'opentype.js'
import { RenderField } from '../components/GlyphCanvas'
import { getCSSVar } from '../util'

const GLYPH_MARGIN = 16
const MARK_SIZE = 15

type Point = {
  x: number
  y: number
}

export const enableHighDPICanvas = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): void => {
  const pixelRatio = window.devicePixelRatio || 1

  if (pixelRatio === 1) {
    return
  }

  canvas.width = width * pixelRatio
  canvas.height = height * pixelRatio
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  canvas.getContext('2d')?.scale(pixelRatio, pixelRatio)
}

export const renderTableInfo = (
  canvas: HTMLCanvasElement,
  font: Font,
  renderFields: RenderField[]
): void => {
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

  if (renderFields.includes('sCapHeight') && font.tables.os2?.sCapHeight) {
    hLine('sCapHeight', font.tables.os2.sCapHeight)
  }

  if (renderFields.includes('sxHeight') && font.tables.os2?.sxHeight) {
    hLine('sxHeight', font.tables.os2.sxHeight)
  }
}

const drawCircles = (
  ctx: CanvasRenderingContext2D,
  circles: Point[],
  x: number,
  y: number,
  scale: number
) => {
  const radius = 2
  ctx.beginPath()

  circles.forEach(circle => {
    ctx.moveTo(x + circle.x * scale, y + circle.y * scale)
    ctx.arc(x + circle.x * scale, y + circle.y * scale, radius, 0, Math.PI * 2, false)
  })

  ctx.closePath()
  ctx.fill()
}

// Taken from: https://github.com/opentypejs/opentype.js/blob/9225ad6a88927394805d1be04ced66221c899840/src/glyph.js#L296
// Modified version to change the point colors
export const drawPoints = (
  path: Path,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  fontSize: number
): void => {
  const scale = (1 / path.unitsPerEm) * fontSize
  const circlesOnLine: Point[] = []
  const circlesOffLine: Point[] = []
  const seenOnLine = new Set<string>()
  const seenOffLine = new Set<string>()

  path.commands.forEach(cmd => {
    if (cmd.type !== 'Z') {
      const hash = `${cmd.x}:${-cmd.y}`
      if (!seenOnLine.has(hash)) {
        circlesOnLine.push({
          x: cmd.x,
          y: -cmd.y
        })
        seenOnLine.add(hash)
      }
    }

    if (cmd.type === 'C' || cmd.type === 'Q') {
      const hash = `${cmd.x1}:${-cmd.y1}`
      if (!seenOffLine.has(hash)) {
        circlesOffLine.push({
          x: cmd.x1,
          y: -cmd.y1
        })
        seenOffLine.add(hash)
      }
    }

    if (cmd.type === 'C') {
      const hash = `${cmd.x2}:${-cmd.y2}`
      if (!seenOffLine.has(hash)) {
        circlesOffLine.push({
          x: cmd.x2,
          y: -cmd.y2
        })
        seenOffLine.add(hash)
      }
    }
  })

  ctx.fillStyle = getCSSVar('--vscode-textLink-foreground', 'white')
  drawCircles(ctx, circlesOnLine, x, y, scale)
  ctx.fillStyle = 'red'
  drawCircles(ctx, circlesOffLine, x, y, scale)
}

export const calculateNumPoints = (path: Path): number => {
  let count = 0
  const seen = new Set<string>()

  path.commands.forEach(cmd => {
    if (cmd.type !== 'Z') {
      const hash = `Z_${cmd.x}:${-cmd.y}`
      if (!seen.has(hash)) {
        count += 1
        seen.add(hash)
      }
    }

    if (cmd.type === 'Q') {
      const hash = `Q_${cmd.x1}:${-cmd.y1}`
      if (!seen.has(hash)) {
        count += 1
        seen.add(hash)
      }
    }

    if (cmd.type === 'C') {
      let hash = `C1_${cmd.x1}:${-cmd.y1}`
      if (!seen.has(hash)) {
        count += 1
        seen.add(hash)
      }

      hash = `C2_${cmd.x2}:${-cmd.y2}`
      if (!seen.has(hash)) {
        count += 1
        seen.add(hash)
      }
    }
  })

  return count
}

export const drawGlyphPath = (context: CanvasRenderingContext2D, path: Path): void => {
  context.beginPath()

  path.commands.forEach(cmd => {
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
  })

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

export const renderGlyph = (
  canvas: HTMLCanvasElement,
  font: Font,
  glyph: Glyph,
  renderFields: RenderField[]
): void => {
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
  const glyphWidth = (glyph.advanceWidth ?? 1) * glyphScale
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

  if (renderFields.includes('points')) {
    drawPoints(glyph.path, context, xMin, glyphBaseline, glyphSize)
  }

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
}
