import '../../scss/features.scss'
import React, { useContext, useEffect, useState } from 'react'
import type { Table } from 'opentype.js'
import FontContext from '../../contexts/FontContext'
import FeatureToggles from '../FeatureToggles'
import Slider from '../Slider'
import FontNameHeader from '../FontNameHeader'
import Chip from '../Chip'
import FeatureTable from '../FeatureTable'

type FontVariableAxis = {
  defaultValue: number
  maxValue: number
  minValue: number
  name: { [key: string]: string }
  tag: string
}

type FontVariableAxisInstance = {
  coordinates: { [key: string]: number }
  name: { [key: string]: string }
}

type FontVariation = {
  [key: string]: number
}

const numbers = Array(101)
  .fill(0)
  .map((_, index) => index)
  .join(', ')

const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  .split('')
  .join(', ')

const Features = (): JSX.Element => {
  const [activeFeatures, setActiveFeatures] = useState<string[]>([])
  const [fontVariationSettings, setFontVariationSettings] = useState<FontVariation>({})
  const [variationCSS, setVariationCSS] = useState('')
  const [fontFeatureSettingsCSS, setFontFeatureSettingsCSS] = useState('normal')
  const [selectedSetting, setSelectedSetting] = useState('')
  const { font } = useContext(FontContext)

  const onFeatureToggle = (css: string, currentActiveFeatures: string[]): void => {
    setActiveFeatures(currentActiveFeatures)
    setFontFeatureSettingsCSS(css)
  }

  /**
   * Takes an object of font variations and creates the `font-variation-settings`
   * CSS string. For example:
   * ```
   * createVariationCSS({ wght: 400, slnt: 0 }) === '"wght" 400, "slnt" 0'
   * ```
   */
  const createVariationCSS = (variations: FontVariation): void => {
    const css = Object.entries(variations)
      .map(([variation, value]) => `"${variation}" ${value}`)
      .join(', ')

    setVariationCSS(css)
  }

  const onVariationChange = (variant: string, value: number) => {
    const modifiedVariation = {
      ...fontVariationSettings,
      [variant]: Math.trunc(value)
    }

    setFontVariationSettings(modifiedVariation)
    createVariationCSS(modifiedVariation)
  }

  const renderVariableSliders = (): JSX.Element | null => {
    const fvar: Table = font.tables.fvar

    if (!fvar) {
      return null
    }

    const axes: FontVariableAxis[] = fvar.axes

    return (
      <>
        <h2>Axes</h2>
        {axes.map(axis => (
          <Slider
            className="variable-slider"
            onChange={value => onVariationChange(axis.tag, value)}
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

  const onInstanceClick = (instance: FontVariableAxisInstance): void => {
    const { coordinates } = instance
    const settingName = instance.name.en?.trim() || 'Unknown'

    Object.entries(coordinates).forEach(([key, value]) => {
      coordinates[key] = Math.trunc(value)
    })

    setSelectedSetting(settingName)
    setFontVariationSettings(coordinates)
    createVariationCSS(coordinates)
  }

  const renderFontInstances = (): JSX.Element | null => {
    const fvar = font.tables.fvar

    if (!fvar) {
      return null
    }

    const instances: FontVariableAxisInstance[] = fvar.instances

    return (
      <div className="font-instances">
        <h2>Predefined Settings</h2>
        {instances.map((instance, index) => {
          const settingName = instance.name.en?.trim() || 'Unknown'

          return (
            <Chip
              key={index}
              title={settingName}
              selected={settingName === selectedSetting}
              onClick={() => onInstanceClick(instance)}
            />
          )
        })}
      </div>
    )
  }

  useEffect(() => {
    // fvar (which is only present on variable fonts) contains info
    // about the fonts axes, like weight and slant
    const { fvar } = font.tables
    const axes: FontVariableAxis[] | null = fvar?.axes

    if (axes) {
      // If the font is a variable font, loop through the axes and
      // apply the default variation setting for each axis
      const fontVariations: FontVariation = {}

      axes.forEach(axis => {
        fontVariations[axis.tag] = Math.trunc(axis.defaultValue)
      })

      createVariationCSS(fontVariations)
      setFontVariationSettings(fontVariations)
    }
  }, [])

  return (
    <div className="features">
      <FontNameHeader
        style={{
          fontFeatureSettings: fontFeatureSettingsCSS,
          fontVariationSettings: variationCSS
        }}
      />
      <section>
        <h2>Font Features</h2>
        <FeatureToggles onFeatureToggle={onFeatureToggle} />
      </section>
      <section>{renderFontInstances()}</section>
      <section>{renderVariableSliders()}</section>
      <section>
        <h2>Preview</h2>
        <p
          className="text"
          style={{
            fontFeatureSettings: fontFeatureSettingsCSS,
            fontVariationSettings: variationCSS
          }}
        >
          Toggling different feature settings may cause numbers and letters to display
          differently. In which case, you may see a difference in the following
          characters: {characters} {numbers}
        </p>
      </section>
      <section>
        <p
          className="text"
          style={{
            fontFeatureSettings: fontFeatureSettingsCSS,
            fontVariationSettings: variationCSS
          }}
        >
          {`
            Apparently motionless to her passengers and crew, the Interplanetary
            liner Hyperion bored serenely onward through space at normal
            acceleration. In the railed-off sanctum in one corner of the control
            room a bell tinkled, a smothered whirr was heard, and Captain Bradley
            frowned as he studied the brief message upon the tape of the recorder--a
            message flashed to his desk from the operator's panel. He beckoned, and
            the second officer, whose watch it now was, read aloud: "Reports of
            scout patrols still negative." "Still negative." The officer scowled in
            thought. "They've already searched beyond the widest possible location
            of the wreckage, too. Two unexplained disappearances inside a
            month--first the Dione, then the Rhea--and not a plate nor a lifeboat
            recovered. Looks bad, sir. One might be an accident; two might possibly
            be a coincidence...." His voice died away. What might that coincidence
            mean?
          `}
        </p>
      </section>
      <section>
        <h2>Feature Table</h2>
        <FeatureTable activeFeatures={activeFeatures} />
      </section>
    </div>
  )
}

export default Features
