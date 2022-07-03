import '../scss/glyph-inspector-modal.scss'
import React from 'react'
import Modal from 'react-modal'
import { Glyph } from 'opentype.js'
import { VscClose } from 'react-icons/vsc'
import GlyphCanvas from './GlyphCanvas'

type GlyphInspectorModalProps = {
  isOpen: boolean
  onClose: () => void
  glyph: Glyph
}

const GlyphInspectorModal = ({
  isOpen,
  onClose,
  glyph
}: GlyphInspectorModalProps): JSX.Element => {
  return (
    <div>
      <Modal
        shouldCloseOnOverlayClick
        shouldCloseOnEsc
        isOpen={isOpen}
        className="glyph-inspector-modal"
        overlayClassName="glyph-inspector-modal-overlay"
      >
        <div className="modal-content">
          <button type="button" onClick={onClose} className="modal-close-btn">
            <VscClose />
          </button>
          <div className="canvas-container">
            <GlyphCanvas glyph={glyph} />
          </div>
          <p>Glyph: {glyph.name}</p>
        </div>
      </Modal>
    </div>
  )
}

export default GlyphInspectorModal
