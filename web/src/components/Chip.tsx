import '../scss/chip.scss'
import React from 'react'

type ChipProps = {
  title: string
  onClick?: () => void
  className?: string
  selected?: boolean
}

const Chip = ({
  title,
  onClick = () => {},
  className = '',
  selected = false
}: ChipProps): JSX.Element => (
  <button
    type="button"
    className={`chip ${selected ? 'chip--selected' : ''} ${className}`}
    onClick={onClick}
  >
    {title}
  </button>
)

export default Chip
