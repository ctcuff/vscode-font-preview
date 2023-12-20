import '../scss/switch.scss'
import React, { useState } from 'react'

type SwitchProps = {
  className?: string
  title?: string | JSX.Element
  htmlTitle?: string
  onChange?: (checked: boolean) => void
  defaultChecked?: boolean
}

const rand = () => Math.floor(Math.random() * 1_000_000)
const generateId = () => `input-${rand()}-${rand()}-${rand()}`

const renderTitle = (
  title: string | JSX.Element,
  htmlTitle: string
): JSX.Element | null => {
  if (!title) {
    return null
  }

  if (typeof title === 'string') {
    return (
      <p className="title" title={htmlTitle}>
        {title}
      </p>
    )
  }

  return title
}

const Switch = ({
  className = '',
  title = '',
  htmlTitle = '',
  defaultChecked = false,
  onChange = () => {}
}: SwitchProps): JSX.Element => {
  const [id] = useState(generateId())

  return (
    <div className={`${className} switch`}>
      {renderTitle(title, htmlTitle)}
      {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
      <label className="wrapper" htmlFor={id}>
        <input
          defaultChecked={defaultChecked}
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
