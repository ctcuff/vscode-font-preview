import '../scss/glyph-inspector-modal.scss'
import React, { useContext, useMemo, useState } from 'react'
import Modal from 'react-modal'
import { Glyph, Path } from 'opentype.js'
import { toast, cssTransition } from 'react-toastify'
import { VscClose } from 'react-icons/vsc'
import GlyphCanvas, { RenderField } from './GlyphCanvas'
import FontContext from '../contexts/FontContext'
import Chip from './Chip'
import Switch from './Switch'
import useLogger from '../hooks/use-logger'

type GlyphInspectorModalProps = {
  isOpen: boolean
  onClose: () => void
  onAfterOpen: Modal.OnAfterOpenCallback
  glyph: Glyph
  onAfterClose?: () => void
}

const GLYPH_CANVAS_SIZE = 500
const CANVAS_PADDING = 16
const LOG_TAG = 'GlyphInspectorModal'

const formatUnicode = (unicode: number | undefined): string => {
  if (unicode === undefined) {
    return '(undefined)'
  }

  const unicodeHex = unicode.toString(16)

  return unicodeHex.length > 4
    ? `000000${unicodeHex.toUpperCase()}`.slice(-6)
    : `0000${unicodeHex.toUpperCase()}`.slice(-4)
}

const pathToSVG = (path: Path): string => {
  const { x1, y1, x2, y2 } = path.getBoundingBox()

  // Need to offset the svg a bit so it doesn't clip out of the view box
  const offset = 2
  const w = (x2 - x1 + offset).toFixed(0)
  const h = (y2 - y1 + offset).toFixed(0)

  // Centers the path withing the SVG
  const viewBoxX = (x1 - offset / 2).toFixed(0)
  const viewBoxY = (y1 - offset / 2).toFixed(0)

  // prettier-ignore
  return (
    '' +
    '<svg ' +
      `width="${w}" ` +
      `height="${h}" ` +
      `viewBox="${viewBoxX} ${viewBoxY} ${w} ${h}" ` +
      'fill="#808080" ' +
      'xmlns="http://www.w3.org/2000/svg"' +
    '>' +
      `${path.toSVG(4)}` +
    '</svg>'
  )
}

function renderTableRow<T>(
  object: T,
  property: keyof T,
  numberPrecision = 2
): JSX.Element | null {
  const objectProperty = object[property]

  if (objectProperty === null || objectProperty === undefined) {
    return (
      <tr>
        <td>{property as string}</td>
        <td>(undefined)</td>
      </tr>
    )
  }

  let displayProperty: T[keyof T] | string = objectProperty

  if (typeof displayProperty === 'number') {
    displayProperty = displayProperty.toFixed(numberPrecision)
  }

  return (
    <tr>
      <td>{property as string}</td>
      <td>{displayProperty as string}</td>
    </tr>
  )
}

const entityTextArea = document.createElement('textarea')

const allRenderFields: RenderField[] = [
  'ascender',
  'baseline',
  'descender',
  'sTypoAscender',
  'sTypoDescender',
  'fill',
  'sCapHeight',
  'points',
  'stroke',
  'sxHeight',
  'yMax',
  'yMin',
  'width'
]

const GlyphInspectorModal = ({
  isOpen,
  onClose,
  glyph,
  onAfterOpen,
  onAfterClose
}: GlyphInspectorModalProps): JSX.Element => {
  const glyphMetrics = useMemo(() => glyph.getMetrics(), [glyph])
  const glyphPath = useMemo(() => glyph.getPath(), [glyph])
  const contours = useMemo(() => glyph.getContours().flat().length, [glyph])
  const logger = useLogger()

  const { font, glyphDataCache } = useContext(FontContext)
  const [renderFields, setRenderFields] = useState<RenderField[]>([
    'width',
    'ascender',
    'baseline',
    'descender',
    'fill'
  ])

  const toggleTableField = (field: RenderField, enabled: boolean) => {
    if (enabled) {
      setRenderFields(fields => fields.concat(field))
    } else {
      setRenderFields(fields => fields.filter(value => value !== field))
    }
  }

  const copyGlyphToClipboard = (asSvg: boolean): void => {
    // The glyph will be encoded (for example F => &#70;) so we need
    // to put the glyph in a text area in order to copy the decoded version
    entityTextArea.innerHTML = asSvg ? pathToSVG(glyphPath) : `&#${glyph.unicode};`

    navigator.clipboard
      .writeText(entityTextArea.value)
      .then(() => {
        toast(`${asSvg ? 'SVG' : 'Glyph'} copied to clipboard`, {
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
      .catch(err => logger.error("Couldn't copy to clipboard", LOG_TAG, err))
  }

  const renderSwitch = (field: RenderField) => {
    switch (field) {
      // These fields may not exist on ever font so we need to check the os2
      // table before rendering switches that can toggle these features
      case 'sTypoAscender':
      case 'sTypoDescender':
      case 'sCapHeight':
      case 'sxHeight':
        if (!font.tables.os2[field]) {
          return null
        }
        break
      default:
        break
    }

    let switchTitle: string = field

    if (field === 'sTypoAscender') {
      switchTitle = 'sTypoAsc'
    } else if (field === 'sTypoDescender') {
      switchTitle = 'sTypoDesc'
    }

    return (
      <Switch
        key={field}
        defaultChecked={renderFields.includes(field)}
        htmlTitle={field}
        title={switchTitle}
        className="feature-toggle"
        onChange={checked => toggleTableField(field, checked)}
      />
    )
  }

  return (
    <Modal
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      onAfterOpen={onAfterOpen}
      onAfterClose={onAfterClose}
      onRequestClose={onClose}
      isOpen={isOpen}
      className="glyph-inspector-modal"
      overlayClassName="glyph-inspector-modal-overlay"
    >
      <div className="modal-content">
        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
        <button type="button" onClick={onClose} className="modal-close-btn">
          <VscClose />
        </button>
        <div
          className="canvas-container"
          style={{
            width: GLYPH_CANVAS_SIZE + CANVAS_PADDING,
            height: GLYPH_CANVAS_SIZE + CANVAS_PADDING
          }}
        >
          <GlyphCanvas
            renderFields={renderFields}
            glyph={glyph}
            width={GLYPH_CANVAS_SIZE}
            height={GLYPH_CANVAS_SIZE}
          />
        </div>
        <div className="glyph-detail">
          <table>
            <tbody>
              {renderTableRow(glyph, 'advanceWidth')}
              {renderTableRow(font, 'ascender')}
              <tr>
                <td>contours</td>
                <td>{contours}</td>
              </tr>
              {renderTableRow(font, 'descender')}
              {renderTableRow(glyph, 'index', 0)}
              {renderTableRow(glyphMetrics, 'leftSideBearing')}
              {renderTableRow(glyph, 'name')}
              <tr>
                <td>points</td>
                <td>{glyphDataCache[glyph.index].numPoints}</td>
              </tr>
              {renderTableRow(glyphMetrics, 'rightSideBearing')}
              {renderTableRow(font.tables.os2, 'sCapHeight')}
              {renderTableRow(font.tables.os2, 'sTypoAscender')}
              {renderTableRow(font.tables.os2, 'sTypoDescender')}
              {renderTableRow(font.tables.os2, 'sxHeight')}
              <tr>
                <td>unicode</td>
                <td>{formatUnicode(glyph.unicode)}</td>
              </tr>
              {renderTableRow(font, 'unitsPerEm')}
              {renderTableRow(glyphMetrics, 'xMax')}
              {renderTableRow(glyphMetrics, 'xMin')}
              {renderTableRow(glyphMetrics, 'yMax')}
              {renderTableRow(glyphMetrics, 'yMin')}
            </tbody>
          </table>
          <div className="toggle-list">{allRenderFields.map(renderSwitch)}</div>
          <div className="chip-actions">
            {glyph.unicode !== undefined && (
              <Chip
                title="Copy Text"
                className="chip-action"
                onClick={() => copyGlyphToClipboard(false)}
              />
            )}
            {glyphPath.commands.length > 0 && (
              <Chip
                title="Copy SVG"
                className="chip-action"
                onClick={() => copyGlyphToClipboard(true)}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default GlyphInspectorModal
