/* eslint-disable */
import '../scss/glyphs.scss'
import React, { useCallback, useContext } from 'react'
import { GlyphSet, Path, PathCommand } from 'opentype.js'
import { FontContext } from '../contexts/FontContext'

type GlyphsProps = {
  glyphs: GlyphSet
}

const drawHorizontalLine = (
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  y: number
): void => {
  context.beginPath()
  context.moveTo(0, y)
  context.lineTo(canvasWidth, y)
  context.stroke()
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
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

const drawPathWithArrows = (context: CanvasRenderingContext2D, path: Path) => {
  let cmd: PathCommand
  let i
  let x1
  let y1
  let x2
  let y2
  const arrows: [CanvasRenderingContext2D, number, number, number, number][] = []

  context.beginPath()

  for (i = 0; i < path.commands.length; i += 1) {
    cmd = path.commands[i]
    if (cmd.type === 'M') {
      if (x1 !== undefined) {
        arrows.push([context, x1, y1, x2, y2])
      }
      context.moveTo(cmd.x, cmd.y)
    } else if (cmd.type === 'L') {
      context.lineTo(cmd.x, cmd.y)
      x1 = x2
      y1 = y2
    } else if (cmd.type === 'C') {
      context.bezierCurveTo(cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y)
      x1 = cmd.x2
      y1 = cmd.y2
    } else if (cmd.type === 'Q') {
      context.quadraticCurveTo(cmd.x1, cmd.y1, cmd.x, cmd.y)
      x1 = cmd.x1
      y1 = cmd.y1
    } else if (cmd.type === 'Z') {
      arrows.push([context, x1, y1, x2, y2])
      context.closePath()
    }
    // @ts-ignore
    x2 = cmd.x
    // @ts-ignore
    y2 = cmd.y
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
  context.fillStyle = '#000000'
  // arrows.forEach(function (arrow) {
  //   drawArrow.apply(null, arrow)
  // })
}

const CANVAS_SIZE = 500

const Glyphs = ({ glyphs }: GlyphsProps): JSX.Element => {
  const font = useContext(FontContext)

  const randIndex = Math.floor(Math.random() * glyphs.length)
  const glyph = glyphs.get(randIndex)
  const glyphsList = []

  for (let i = 0; i < glyphs.length; i++) {
    glyphsList.push(glyphs.get(i).unicode)
  }

  // const canvasRef = useCallback((canvas: HTMLCanvasElement | null) => {
  //   const context = canvas?.getContext('2d')

  //   if (!canvas || !context) {
  //     return
  //   }

  //   // Fonts that go off the canvas
  //   // Merriweather Light:
  //   //  283
  //   // Raleway: 103, 403

  //   const bounds = glyph.getBoundingBox()

  //   const x = ((canvas.width - bounds.x2 - bounds.x1) / 2) * 2
  //   const y = (bounds.y2 + (canvas.height - bounds.y2) / 2) / 2
  //   const fontSize = 500

  //   const glyphMargin = 5
  //   const w = canvas.width
  //   const h = canvas.height
  //   const glyphW = w - glyphMargin * 2
  //   const glyphH = h - glyphMargin * 2
  //   const head = font.tables.head
  //   const maxHeight = head.yMax - head.yMin
  //   const glyphScale = Math.min(glyphW / (head.xMax - head.xMin), glyphH / maxHeight)
  //   const glyphSize = glyphScale * font.unitsPerEm

  //   const glyphBaseline = glyphMargin + (glyphH * head.yMax) / maxHeight

  //   const width = canvas.width
  //   const glyphWidth = glyph.advanceWidth * glyphScale
  //   const x0 = (width - glyphWidth) / 2
  //   context.fillStyle = '#000000'
  //   const path = glyph.getPath(x0, glyphBaseline, glyphSize)

  //   context.fillStyle = '#ff0000'

  //   console.log({
  //     randIndex,
  //     descender: font.descender,
  //     ascender: font.ascender
  //   })

  //   // glyph.draw(context, x, y, fontSize)
  //   // glyph.drawMetrics(context, x, y, fontSize)
  //   path.fill = '#808080'
  //   path.stroke = '#000000'
  //   path.strokeWidth = 1.5
  //   drawPathWithArrows(context, path)

  //   // drawHorizontalLine(context, canvas.width, y)
  // }, [])

  return (
    <div className="glyphs">
      {glyphsList.map((g, index) => (
        <div className="glyph" onClick={() => console.log({ index })} key={index}>
          {String.fromCharCode(g)}
        </div>
      ))}
      {/* <canvas ref={canvasRef} 
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE
        }}
        width={CANVAS_SIZE * 2}
        height={CANVAS_SIZE * 2}
      /> */}
    </div>
  )
}

export default Glyphs
