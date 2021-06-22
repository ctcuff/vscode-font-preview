import '../scss/slider.scss'
import React, { useEffect, useState } from 'react'

type SliderProps = {
  min: number
  max: number
  step?: number
  title?: string
  value?: number
  className?: string
  onChange?: (value: number) => void
}

const Slider = ({
  min,
  max,
  title,
  step = 1,
  value = 0,
  className = '',
  onChange = () => {}
}: SliderProps): JSX.Element => {
  const [sliderValue, setSliderValue] = useState(value)

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = parseFloat(event.target.value)
    setSliderValue(val)
    onChange(val)
  }

  useEffect(() => {
    setSliderValue(value)
  }, [value])

  return (
    <div className={`slider ${className}`}>
      {title && (
        <span className="slider-title">
          {title}: {sliderValue}
        </span>
      )}
      <div className="slider-range">
        <span className="label-min">{min}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={onInputChange}
        />
        <span className="label-max">{max}</span>
      </div>
    </div>
  )
}

export default Slider
