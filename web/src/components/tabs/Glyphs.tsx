import '../../scss/glyphs.scss'
import 'react-toastify/dist/ReactToastify.css'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Glyph } from 'opentype.js'
import FontContext from '../../contexts/FontContext'
import FontNameHeader from '../FontNameHeader'
import GlyphInspectorModal from '../GlyphInspectorModal'
import Chip from '../Chip'
import GlyphItem from '../GlyphItem'
import { WebviewMessage } from '../../../../shared/types'

const GLYPHS_PER_PAGE = 200

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

      // Edge case: don't repeat the last index if it's the same as the first
      if (GLYPHS_PER_PAGE * i === font.glyphs.length - 1) {
        title = `${GLYPHS_PER_PAGE * i}`
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

  const onMessage = (message: MessageEvent<WebviewMessage>) => {
    // Because the canvas doesn't update its color when VSCode's theme
    // changes, we need to re-render the glyphs
    if (message.data.type === 'COLOR_THEME_CHANGE') {
      loadGlyphs()
    }
  }

  useEffect(() => {
    loadGlyphs()

    // The window event listener needs to depend on current page so that
    // the value of 'currentPage' is up to date when it changes
    window.addEventListener('message', onMessage)

    return () => {
      window.removeEventListener('message', onMessage)
    }
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
      <FontNameHeader />
      {glyphs.length > 0 && numPages > 1 && (
        // TODO: Can this be extracted?
        <div className="page-button-wrapper">
          <div className="page-button-row">
            {buttonRow}
            <div className="row-spacer" />
          </div>
        </div>
      )}
      {glyphComponent}
      {glyphs.length > 0 && numPages > 1 && (
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
