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

type GlyphInspectorModalProps = {
  isOpen: boolean
  onClose: () => void
  onAfterOpen: Modal.OnAfterOpenCallback
  glyph: Glyph
  onAfterClose?: () => void
}

const GLYPH_CANVAS_SIZE = 500
const CANVAS_PADDING = 16

const formatUnicode = (unicode: number | undefined): string => {
  if (unicode === undefined) {
    return '(null)'
  }

  const unicodeHex = unicode.toString(16)

  return unicodeHex.length > 4
    ? `000000${unicodeHex.toUpperCase()}`.slice(-6)
    : `0000${unicodeHex.toUpperCase()}`.slice(-4)
}

const pathToSVG = (path: Path): string => {
  const { x1, y1, x2, y2 } = path.getBoundingBox()
  const w = (x2 - x1).toFixed(0)
  const h = (y2 - y1).toFixed(0)

  // prettier-ignore
  return (
    '' +
    '<svg ' +
      `width="${w}" ` +
      `height="${h}" ` +
      `viewBox="${x1.toFixed(0)} ${y1.toFixed(0)} ${w} ${h}" ` +
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
  displayName?: string
): JSX.Element {
  const objectProperty = object[property]
  let displayProperty: T[keyof T] | string = objectProperty

  if (typeof displayProperty === 'number') {
    displayProperty = displayProperty.toFixed(2)
  }

  return (
    <tr>
      <td>{displayName || property}</td>
      <td>{displayProperty ?? '(null)'}</td>
    </tr>
  )
}

const entityTextArea = document.createElement('textarea')

const copyGlyphToClipboard = (asSvg: boolean, glyph: Glyph, glyphPath: Path): void => {
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
    // eslint-disable-next-line no-console
    .catch(err => console.error(err))
}

const allRenderFields: RenderField[] = [
  'ascender',
  'baseline',
  'descender',
  'fill',
  'points',
  'stroke',
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
  const { font } = useContext(FontContext)
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
              {renderTableRow(glyph, 'name')}
              <tr>
                <td>unicode</td>
                <td>{formatUnicode(glyph.unicode)}</td>
              </tr>
              {renderTableRow(glyph, 'index')}
              {renderTableRow(glyphMetrics, 'xMin')}
              {renderTableRow(glyphMetrics, 'xMax')}
              {renderTableRow(glyphMetrics, 'yMin')}
              {renderTableRow(glyphMetrics, 'yMax')}
              {renderTableRow(glyph, 'advanceWidth')}
              {renderTableRow(glyphMetrics, 'leftSideBearing')}
              {renderTableRow(glyphMetrics, 'rightSideBearing')}
              {renderTableRow(font, 'ascender')}
              {renderTableRow(font, 'descender')}
              {renderTableRow(font, 'unitsPerEm')}
            </tbody>
          </table>
          <div className="toggle-list">
            {allRenderFields.map(field => (
              <Switch
                key={field}
                defaultChecked={renderFields.includes(field)}
                title={field}
                className="feature-toggle"
                onChange={checked => toggleTableField(field, checked)}
              />
            ))}
          </div>
          <div className="chip-actions">
            {glyph.unicode !== undefined && (
              <Chip
                title="Copy Text"
                className="chip-action"
                onClick={() => copyGlyphToClipboard(false, glyph, glyphPath)}
              />
            )}
            {glyphPath.commands.length > 0 && (
              <Chip
                title="Copy SVG"
                className="chip-action"
                onClick={() => copyGlyphToClipboard(true, glyph, glyphPath)}
              />
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default GlyphInspectorModal
