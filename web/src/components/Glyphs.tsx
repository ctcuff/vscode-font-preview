/* eslint-disable */
import '../scss/glyphs.scss'
import React, { useContext } from 'react'
import FontContext from '../contexts/FontContext'
import FontNameHeader from './FontNameHeader'

type GlyphData = {
  htmlEntity: string
  glyphIndex: number
  name: string
}

const Glyphs = (): JSX.Element => {
  const { font } = useContext(FontContext)
  const glyphs = font.glyphs
  const glyphsList: GlyphData[] = []

  for (let i = 0; i < glyphs.length; i++) {
    const glyph = glyphs.get(i)
    const { leftSideBearing, rightSideBearing, yMin, yMax } = glyph.getMetrics()

    // Glyphs that have a height of 0 for their bounding box are either
    // empty or won't be visible so we'll skip them
    if (leftSideBearing === 0 && rightSideBearing === 0 && yMin === 0 && yMax === 0) {
      continue
    }

    // Skip rendering null glyphs and the space character
    // since these characters can break the grid layout
    if (glyph.unicode !== undefined && glyph.unicode !== 32) {
      glyphsList.push({
        htmlEntity: `&#${glyph.unicode};`,
        glyphIndex: i,
        name: glyph.name
      })
    }
  }

  return (
    <div className="glyphs">
      <FontNameHeader />
      {glyphsList.map(({ htmlEntity, glyphIndex, name }, i) => (
        <div
          className="glyph"
          title={name}
          key={glyphIndex}
          data-index={i}
          onClick={() => {
            console.log({ index: i }, glyphs.get(glyphIndex))
          }}
        >
          <span dangerouslySetInnerHTML={{ __html: htmlEntity }} />
          <div className="glyph-detail">{name}</div>
        </div>
      ))}
    </div>
  )
}

export default Glyphs
