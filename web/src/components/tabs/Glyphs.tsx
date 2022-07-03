import '../../scss/glyphs.scss'
import 'react-toastify/dist/ReactToastify.css'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { ToastContainer, toast, cssTransition } from 'react-toastify'
import { Glyph } from 'opentype.js'
import FontContext from '../../contexts/FontContext'
import FontNameHeader from '../FontNameHeader'
import GlyphInspectorModal from '../GlyphInspectorModal'
import Chip from '../Chip'
import GlyphItem from '../GlyphItem'

const GLYPHS_PER_PAGE = 200

const entityTextArea = document.createElement('textarea')

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const [glyphs, setGlyphs] = useState<Glyph[]>([])
  const [isModalOpen, setModalOpen] = useState(false)
  const [selectedGlyph, setSelectedGlyph] = useState<Glyph | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const numPages = Math.ceil(font.glyphs.length / GLYPHS_PER_PAGE)

  const renderPageButtons = (): JSX.Element[] => {
    const elements: JSX.Element[] = []

    for (let i = 0; i < numPages; i++) {
      let title = `${GLYPHS_PER_PAGE * i} - ${GLYPHS_PER_PAGE * (i + 1) - 1}`

      if (i === numPages - 1) {
        title = `${GLYPHS_PER_PAGE * i} - ${font.glyphs.length - 1}`
      }

      elements.push(
        <Chip
          key={i}
          selected={currentPage === i}
          title={title}
          onClick={() => setCurrentPage(i)}
        />
      )
    }

    return elements
  }

  const onSelectGlyph = (glyph: Glyph) => {
    setSelectedGlyph(glyph)
    setModalOpen(true)
  }

  const loadGlyphs = () => {
    const glyphList: Glyph[] = []

    for (let i = 0; i < GLYPHS_PER_PAGE; i++) {
      const index = i + GLYPHS_PER_PAGE * currentPage

      if (index === font.glyphs.length) {
        break
      }

      glyphList.push(font.glyphs.get(index))
    }

    setGlyphs(glyphList)
  }

  useEffect(() => {
    loadGlyphs()
  }, [currentPage])

  const buttonRow = useMemo(() => renderPageButtons(), [currentPage])

  const glyphComponent = useMemo(
    () =>
      glyphs.map(glyph => (
        <GlyphItem glyph={glyph} key={glyph.index} onClick={onSelectGlyph} />
      )),
    [glyphs]
  )

  return (
    <div className="glyphs">
      {selectedGlyph && (
        <GlyphInspectorModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          glyph={selectedGlyph}
        />
      )}
      <ToastContainer limit={1} />
      <FontNameHeader />
      <div className="page-button-wrapper">
        <div className="page-button-row">
          {buttonRow}
          <div className="row-spacer" />
        </div>
      </div>
      {glyphComponent}
      {numPages > 1 && (
        <div className="page-button-wrapper bottom">
          <div className="page-button-row">
            {buttonRow}
            <div className="row-spacer" />
          </div>
        </div>
      )}
    </div>
  )
}

export default Glyphs
