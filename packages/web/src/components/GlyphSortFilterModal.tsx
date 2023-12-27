import '../scss/glyph-sort-filter-modal.scss'
import React, { useState } from 'react'
import { VscClose } from 'react-icons/vsc'
import Modal from 'react-modal'
import Chip from './Chip'

type GlyphSortFilterModalProps = {
  isOpen: boolean
  onClose: () => void
  onSortApplied: (sortBy: SortProperty | null, isAscending: boolean) => void
}

const properties = [
  'advanceWidth',
  'contours',
  'index',
  'leftSideBearing',
  'name',
  'points',
  'rightSideBearing',
  'unicode',
  'xMax',
  'xMin',
  'yMax',
  'yMin'
] as const

export type SortProperty = (typeof properties)[number]

const defaultSort: SortProperty = 'index'

const GlyphSortFilterModal = (props: GlyphSortFilterModalProps): JSX.Element => {
  const [ascending, setAscending] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<SortProperty>(defaultSort)
  const [appliedAscending, setAppliedAscending] = useState(true)
  const [appliedProperty, setAppliedProperty] = useState<SortProperty>(defaultSort)

  const closeAndReset = () => {
    setAscending(appliedAscending)
    setSelectedProperty(appliedProperty)
    props.onClose()
  }

  const closeAndResetToDefault = () => {
    setAscending(true)
    setSelectedProperty(defaultSort)
    setAppliedAscending(true)
    setAppliedProperty(defaultSort)
    props.onSortApplied(null, true)
    props.onClose()
  }

  const applyAndClose = () => {
    setAppliedProperty(selectedProperty)
    setAppliedAscending(ascending)
    props.onSortApplied(selectedProperty, ascending)
    props.onClose()
  }

  return (
    <Modal
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      // Needed because the 'preventScroll' prop doesn't work
      onAfterOpen={() => {
        document.body.style.overflowY = 'hidden'
      }}
      onAfterClose={() => {
        document.body.style.overflowY = 'overlay'
      }}
      onRequestClose={closeAndReset}
      isOpen={props.isOpen}
      className="glyph-sort-filter-modal"
      overlayClassName="glyph-sort-filter-modal-overlay"
    >
      <div className="modal-content">
        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
        <button type="button" onClick={closeAndReset} className="modal-close-btn">
          <VscClose />
        </button>
        <h1>Sort</h1>
        <div className="chip-container">
          {properties.map((property, index) => (
            <Chip
              title={property}
              key={index}
              selected={property === selectedProperty}
              onClick={() => setSelectedProperty(property)}
            />
          ))}
        </div>
        <h1>Order</h1>
        <div className="chip-container">
          <Chip
            title="ascending"
            selected={ascending}
            onClick={() => setAscending(true)}
          />
          <Chip
            title="descending"
            selected={!ascending}
            onClick={() => setAscending(false)}
          />
        </div>
        <div className="controls">
          <button type="button" onClick={closeAndResetToDefault}>
            Reset
          </button>
          <button type="button" onClick={applyAndClose}>
            Apply
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default GlyphSortFilterModal
