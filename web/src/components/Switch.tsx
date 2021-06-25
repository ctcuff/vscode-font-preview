import '../scss/switch.scss'
import React, { useState } from 'react'

type SwitchProps = {
  className?: string
  title?: string | JSX.Element
  onChange?: (checked: boolean) => void
}

const rand = () => Math.floor(Math.random() * 1_000_000)
const generateId = () => `input-${rand()}-${rand()}-${rand()}`

const Switch = ({
  className = '',
  title = '',
  onChange = () => {}
}: SwitchProps): JSX.Element => {
  const [id] = useState(generateId())

  const renderTitle = (): JSX.Element | null => {
    if (!title) {
      return null
    }

    if (typeof title === 'string') {
      return <p className="title">{title}</p>
    }

    return title
  }

  return (
    <div className={`${className} switch`}>
      {renderTitle()}
      <label className="wrapper" htmlFor={id}>
        <input
          type="checkbox"
          id={id}
          onChange={event => onChange(event.target.checked)}
        />
        <div className="background" />
      </label>
    </div>
  )
}

export default Switch
