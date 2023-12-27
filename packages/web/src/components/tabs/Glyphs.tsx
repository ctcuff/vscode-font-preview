import '../../scss/glyphs.scss'
import 'react-toastify/dist/ReactToastify.css'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { WorkspaceConfig, WebviewMessage } from '@font-preview/shared'
import { Glyph } from 'opentype.js'
import FontContext from '../../contexts/FontContext'
import FontNameHeader from '../FontNameHeader'
import GlyphInspectorModal from '../GlyphInspectorModal'
import Chip from '../Chip'
import GlyphItem from '../GlyphItem'
import useRefWithCallback from '../../hooks/ref-with-callback'
import useModal from '../../hooks/use-modal'
import GlyphSortFilterModal, { SortProperty } from '../GlyphSortFilterModal'

type GlyphProps = {
  config: WorkspaceConfig
}

const GLYPHS_PER_PAGE = 200

const Glyphs = ({ config }: GlyphProps): JSX.Element => {
  const { font, glyphs: allGlyphs, glyphDataCache } = useContext(FontContext)
  const [displayedGlyphs, setDisplayedGlyphs] = useState<Glyph[]>([])
  const [selectedGlyph, setSelectedGlyph] = useState<Glyph | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  // TODO: Combine the two properties into one sort object?
  const [sortByProperty, setSortByProperty] = useState<SortProperty | null>(null)
  const [isAscending, setIsAscending] = useState(true)
  const glyphInspectorModal = useModal()
  const glyphSortFilterModal = useModal()

  const buttonRowRef = useRefWithCallback<HTMLDivElement>(element => {
    element.onwheel = event => {
      event.preventDefault()
      element.scrollLeft += event.deltaY
    }
  }, [])

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
    glyphInspectorModal.open()
  }

  const loadGlyphs = () => {
    const glyphList: Glyph[] = []

    for (let i = 0; i < GLYPHS_PER_PAGE; i++) {
      const index = i + GLYPHS_PER_PAGE * currentPage
      if (index === allGlyphs.length) {
        break
      }
      glyphList.push(allGlyphs[index])
    }

    setDisplayedGlyphs(glyphList)
  }

  const onMessage = (message: MessageEvent<WebviewMessage>) => {
    // Because the canvas doesn't update its color when VSCode's theme
    // changes, we need to re-render the glyphs
    if (message.data.type === 'COLOR_THEME_CHANGE') {
      loadGlyphs()
    }
  }

  useEffect(() => {
    switch (sortByProperty) {
      case null:
        allGlyphs.sort((a, b) => a.index - b.index)
        break
      case 'xMin':
      case 'xMax':
      case 'yMin':
      case 'yMax':
      case 'leftSideBearing':
      case 'advanceWidth':
      case 'unicode':
        allGlyphs.sort((a, b) =>
          isAscending
            ? (a[sortByProperty] ?? Infinity) - (b[sortByProperty] ?? Infinity)
            : (b[sortByProperty] ?? -Infinity) - (a[sortByProperty] ?? -Infinity)
        )
        break
      case 'rightSideBearing':
        allGlyphs.sort((a, b) => {
          const aMetrics = glyphDataCache[a.index].metrics
          const bMetrics = glyphDataCache[b.index].metrics

          // prettier-ignore
          return isAscending
            ? (aMetrics.rightSideBearing ?? Infinity) - (bMetrics.rightSideBearing ?? Infinity)
            : (bMetrics.rightSideBearing ?? -Infinity) - (aMetrics.rightSideBearing ?? -Infinity)
        })
        break
      case 'index':
        if (!isAscending) {
          allGlyphs.sort((a, b) => b.index - a.index)
        }
        break
      case 'name':
        allGlyphs.sort((a, b) =>
          isAscending
            ? (a.name || '').localeCompare(b.name || '')
            : (b.name || '').localeCompare(a.name || '')
        )
        break
      case 'contours':
        allGlyphs.sort((a, b) => {
          const aContours = glyphDataCache[a.index].contours.length
          const bContours = glyphDataCache[b.index].contours.length

          return isAscending ? aContours - bContours : bContours - aContours
        })
        break
      case 'points':
        allGlyphs.sort((a, b) => {
          const aPoints = glyphDataCache[a.index].numPoints
          const bPoints = glyphDataCache[b.index].numPoints

          return isAscending ? aPoints - bPoints : bPoints - aPoints
        })
        break
      default:
        break
    }

    loadGlyphs()
  }, [isAscending, sortByProperty])

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

  // Ensures that the glyphs only re-render when either the color theme changes
  // or the current page changes
  const glyphComponent = useMemo(
    () =>
      displayedGlyphs.map(glyph => (
        <GlyphItem
          glyph={glyph}
          key={glyph.index}
          onClick={onSelectGlyph}
          font={font}
          config={config}
        />
      )),
    [displayedGlyphs]
  )

  return (
    <div className="glyphs">
      {selectedGlyph && (
        <GlyphInspectorModal
          // Needed because the 'preventScroll' prop doesn't work
          onAfterOpen={() => {
            document.body.style.overflowY = 'hidden'
          }}
          onAfterClose={() => {
            document.body.style.overflowY = 'overlay'
          }}
          isOpen={glyphInspectorModal.isOpen}
          onClose={glyphInspectorModal.close}
          glyph={selectedGlyph}
        />
      )}
      <GlyphSortFilterModal
        onSortApplied={(sortBy, ascending) => {
          setSortByProperty(sortBy)
          setIsAscending(ascending)
        }}
        isOpen={glyphSortFilterModal.isOpen}
        onClose={glyphSortFilterModal.close}
      />
      <div className="header-container">
        <FontNameHeader />
        <Chip title="Sort" onClick={glyphSortFilterModal.open} />
      </div>
      {displayedGlyphs.length > 0 && numPages > 1 && (
        <div className="page-button-wrapper">
          <div className="page-button-row" ref={buttonRowRef}>
            {buttonRow}
            <div className="row-spacer" />
          </div>
        </div>
      )}
      {glyphComponent}
    </div>
  )
}

export default Glyphs
