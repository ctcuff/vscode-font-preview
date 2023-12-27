import '../scss/chip.scss'
import React from 'react'

type ChipProps = {
  title: string | JSX.Element
  onClick?: () => void
  className?: string
  selected?: boolean
}

const Chip = (props: ChipProps): JSX.Element => (
  <button
    type="button"
    className={`chip ${props.selected ? 'chip--selected' : ''} ${props.className}`}
    onClick={props.onClick}
  >
    {props.title}
  </button>
)

export default Chip
