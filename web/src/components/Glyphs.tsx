import '../scss/glyphs.scss'
import 'react-toastify/dist/ReactToastify.css'
import React, { useContext, useEffect, useState } from 'react'
import { ToastContainer, toast, cssTransition } from 'react-toastify'
import FontContext from '../contexts/FontContext'
import FontNameHeader from './FontNameHeader'

type GlyphData = {
  htmlEntity: string
  glyphIndex: number
  name: string
}

const entityTextArea = document.createElement('textarea')

const copyGlyphToClipboard = (glyph: string): void => {
  // The glyph will be encoded (for example F => &#70;) so we need
  // to put the glyph in a text area in order to copy the decoded version
  entityTextArea.innerHTML = glyph

  navigator.clipboard
    .writeText(entityTextArea.value)
    .then(() => {
      toast('Glyph copied to clipboard', {
        position: 'bottom-right',
        className: 'react-toast',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnFocusLoss: false,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        transition: cssTransition({
          enter: 'react-toast__enter',
          exit: 'react-toast__exit'
        })
      })
    })
    // eslint-disable-next-line no-console
    .catch(err => console.error(err))
}

const Glyphs = (): JSX.Element => {
  const { font } = useContext(FontContext)
  const [glyphs, setGlyphs] = useState<GlyphData[]>([])

  useEffect(() => {
    const glyphList: GlyphData[] = []

    for (let i = 0; i < font.glyphs.length; i++) {
      const glyph = font.glyphs.get(i)
      const { leftSideBearing, rightSideBearing, yMin, yMax } = glyph.getMetrics()

      // Glyphs that have a height of 0 for their bounding box are either
      // empty or won't be visible so we'll skip them
      if (leftSideBearing === 0 && rightSideBearing === 0 && yMin === 0 && yMax === 0) {
        continue
      }

      // Skip rendering null glyphs and the space character
      // since these characters can break the grid layout
      if (glyph.unicode !== undefined && glyph.unicode !== 32) {
        glyphList.push({
          htmlEntity: `&#${glyph.unicode};`,
          glyphIndex: i,
          name: glyph.name || `${glyph.unicode}`
        })
      }

      setGlyphs(glyphList)
    }
  }, [])

  return (
    <div className="glyphs">
      <ToastContainer limit={1} />
      <FontNameHeader />
      {glyphs.map(({ htmlEntity, glyphIndex, name }, i) => (
        <div
          className="glyph"
          title={name}
          key={glyphIndex}
          data-index={i}
          onClick={() => copyGlyphToClipboard(htmlEntity)}
        >
          <span
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              // In order for the editor to render the decoded glyph, we need to
              // render it as an unsafe string rather than a string inside a component
              __html: htmlEntity
            }}
          />
          <div className="glyph-detail">{name}</div>
        </div>
      ))}
    </div>
  )
}

export default Glyphs
