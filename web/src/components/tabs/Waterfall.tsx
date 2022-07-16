import '../../scss/waterfall.scss'
import React, { useState } from 'react'
import FontNameHeader from '../FontNameHeader'
import Chip from '../Chip'

// Text borrowed from Mr. Spaceship, by Philip K. Dick
// https://www.gutenberg.org/files/32522/32522-h/32522-h.htm
const defaultDisplayText =
  'The ship was coasting evenly, in the hands of its invisible pilot.'
const startingSize = 128
const endSize = 8
const decrementAmount = 8
const sizes: number[] = []

if (startingSize % 8 !== 0) {
  throw new Error('startingSize must be a multiple of 8')
}

for (let i = startingSize; i >= endSize; i -= decrementAmount) {
  sizes.push(i)
}

const Waterfall = (): JSX.Element => {
  const [displayText, setDisplayText] = useState(defaultDisplayText)

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayText(event.target.value)
  }

  const resetText = (): void => {
    setDisplayText(defaultDisplayText)
  }

  return (
    <div className="waterfall">
      <div className="header">
        <FontNameHeader className="font-name" />
        {displayText !== defaultDisplayText && (
          <Chip title="Reset" className="default-text-chip" onClick={resetText} />
        )}
      </div>
      {sizes.map(fontSize => (
        <div className="sentence-block" key={fontSize}>
          <span className="font-size">{fontSize}px</span>
          <div className="overflow-gradient" />
          <input
            type="text"
            style={{ fontSize }}
            className="sentence-input"
            value={displayText}
            onChange={onInputChange}
          />
        </div>
      ))}
    </div>
  )
}

export default Waterfall
