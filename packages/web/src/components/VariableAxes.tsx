import '../scss/variable-axes.scss'
import React, { useContext, useEffect, useState } from 'react'
import type { Table } from 'opentype.js'
import FontContext from '../contexts/FontContext'
import Slider from './Slider'
import { createVariationCSS } from '../util'

type FontVariableAxis = {
  defaultValue: number
  maxValue: number
  minValue: number
  name: { [key: string]: string }
  tag: string
}

type FontVariation = {
  [key: string]: number
}

type VariableAxesProps = {
  onVariationChange?: (css: string) => void
  variationSettings?: FontVariation
}

const VariableAxes = ({
  onVariationChange,
  variationSettings
}: VariableAxesProps): JSX.Element | null => {
  const { font } = useContext(FontContext)
  const [fontVariationSettings, setFontVariationSettings] = useState<FontVariation>(
    variationSettings || {}
  )

  const onChange = (variant: string, value: number) => {
    const modifiedVariation = {
      ...fontVariationSettings,
      [variant]: Math.trunc(value)
    }

    setFontVariationSettings(modifiedVariation)

    const css = createVariationCSS(modifiedVariation)

    onVariationChange?.(css)
  }

  const renderVariableSliders = (): JSX.Element | null => {
    const fvar: Table = font.tables?.fvar

    if (!fvar) {
      return null
    }

    const axes: FontVariableAxis[] = fvar.axes

    return (
      <>
        {axes.map(axis => (
          <Slider
            className="variable-slider"
            onChange={value => onChange?.(axis.tag, value)}
            key={axis.tag}
            min={Math.trunc(axis.minValue)}
            max={Math.trunc(axis.maxValue)}
            value={fontVariationSettings[axis.tag]}
            title={axis.name.en}
          />
        ))}
      </>
    )
  }

  useEffect(() => {
    // fvar (which is only present on variable fonts) contains info
    // about the fonts axes, like weight and slant
    const axes: FontVariableAxis[] | null = font.tables?.fvar?.axes

    if (axes) {
      // If the font is a variable font, loop through the axes and
      // apply the default variation setting for each axis
      const fontVariations: FontVariation = {}

      axes.forEach(axis => {
        fontVariations[axis.tag] = Math.trunc(axis.defaultValue)
      })

      setFontVariationSettings(fontVariations)
    }
  }, [])

  useEffect(() => {
    if (variationSettings && Object.keys(variationSettings).length > 0) {
      setFontVariationSettings(variationSettings)
    }
  }, [variationSettings])

  return <div className="variable-axes">{renderVariableSliders()}</div>
}

export default VariableAxes
