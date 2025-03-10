import '../scss/slider.scss';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

type SliderProps = {
  min: number;
  max: number;
  step: number;
  title: string | JSX.Element;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  className?: string;
};

const Slider = ({
  min,
  max,
  title,
  step,
  value,
  className,
  unit,
  onChange
}: SliderProps): JSX.Element => {
  const [sliderValue, setSliderValue] = useState(value);

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(event.target.value);
      setSliderValue(val);
      onChange(val);
    },
    [onChange]
  );

  const titleElement = useMemo(() => {
    if (!title) {
      return null;
    }

    if (typeof title === 'string') {
      return (
        <span className="slider-title">
          {title}: {sliderValue}
          {unit}
        </span>
      );
    }

    return title;
  }, [sliderValue, title, unit]);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  return (
    <div className={classNames('slider', className)}>
      {titleElement}
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
  );
};

export default Slider;
