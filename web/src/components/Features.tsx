import '../scss/features.scss'
import React, { useContext, useEffect, useState } from 'react'
import FontContext from '../contexts/FontContext'
import Switch from './Switch'
import Slider from './Slider'
import FontNameHeader from './FontNameHeader'
import Chip from './Chip'
import featureTable from '../assets/feature-tags.json'

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

/**
 * Matches cv00 - cv99
 */
const characterVariantRegex = /^[cv]{2}\d{2}/
/**
 * Matches sv00 - sv99
 */
const stylisticVariantRegex = /^[s]{2}\d{2}/

const Features = (): JSX.Element => {
  const [fontFeatures, setFontFeatures] = useState<string[]>([])
  const [activeFeatures, setActiveFeatures] = useState<string[]>([])
  const [fontFeatureSettings, setFontFeatureSettings] = useState('normal')
  const [fontVariationSettings, setFontVariationSettings] = useState<FontVariation>({})
  const [variationCSS, setVariationCSS] = useState('')
  const [selectedSetting, setSelectedSetting] = useState('')
  const { font } = useContext(FontContext)

  // Keep track of whether we've seen "cv01" to "cv99" or
  // "ss01" to "ss20" so that it's only included once in the table
  let hasCharacterVariant = false
  let hasStylisticSet = false

  const toggleFeature = (feature: string, enabled: boolean): void => {
    const features = [...activeFeatures]

    if (enabled) {
      features.push(feature)
    } else {
      const index = activeFeatures.indexOf(feature)
      if (index !== -1) {
        features.splice(index, 1)
      }
    }

    setActiveFeatures(features)
    setFontFeatureSettings(
      features.length === 0 ? 'normal' : `"${features.join('", "')}"`
    )
  }

  const renderTableBody = (feature: string): JSX.Element | null => {
    let key = feature as keyof typeof featureTable
    let tag = feature
    let isActive = false

    // The features "cv01" to "cv99" (Character Variant) and
    // "ss01" to "ss20" (Stylistic Set) need to be checked since
    // these all have the same friendly name and description
    if (characterVariantRegex.test(feature)) {
      if (hasCharacterVariant) {
        return null
      }

      key = 'cv01 - cv99'
      hasCharacterVariant = true
    }

    if (stylisticVariantRegex.test(feature)) {
      if (hasStylisticSet) {
        return null
      }
      key = 'ss01 - ss20'
      hasStylisticSet = true
    }

    if (key === 'ss01 - ss20' || key === 'cv01 - cv99') {
      tag = key
    }

    if (!featureTable[key]) {
      // eslint-disable-next-line no-console
      console.warn(`Feature: ${key} not found in table`)
      return null
    }

    for (let i = 0; i < activeFeatures.length; i++) {
      const activeFeature = activeFeatures[i]

      // Because cv## and ss## only show up once in the table but multiple times in
      // switch components, we need to check for any occurrence of those features
      if (
        activeFeature === feature ||
        (stylisticVariantRegex.test(activeFeature) &&
          stylisticVariantRegex.test(feature)) ||
        (characterVariantRegex.test(activeFeature) && characterVariantRegex.test(feature))
      ) {
        isActive = true
        break
      }
    }

    return (
      <tr key={feature} data-active={isActive} id={key.replaceAll(' ', '')}>
        <td>
          <a href={featureTable[key].href}>{tag}</a>
        </td>
        <td>{featureTable[key].friendlyName}</td>
        <td>{featureTable[key].description}</td>
      </tr>
    )
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
      [variant]: value
    }
    setFontVariationSettings(modifiedVariation)
    createVariationCSS(modifiedVariation)
  }

  const renderVariableSliders = (): JSX.Element | null => {
    const fvar = font.tables.fvar

    if (!fvar) {
      return null
    }

    const axes: FontVariableAxis[] = fvar.axes

    return (
      <>
        {axes.map(axis => (
          <Slider
            className="variable-slider"
            onChange={value => onVariationChange(axis.tag, value)}
            key={axis.tag}
            min={axis.minValue}
            max={axis.maxValue}
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
        <p>Predefined Settings</p>
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

  const renderSwitchTitle = (feature: string): JSX.Element => {
    let id = `#${feature}`

    if (characterVariantRegex.test(feature)) {
      id = '#cv01-cv99'
    }

    if (stylisticVariantRegex.test(feature)) {
      id = '#ss01-ss20'
    }

    return (
      <a className="switch-title" href={id} title="Jump to definition">
        {feature}
      </a>
    )
  }

  useEffect(() => {
    // gpos and gsub contain information about the different features available
    // for the font (kern, tnum, sups, etc). fvar (which is only present on variable
    // fonts) contains info about the fonts axes, like weight and slant
    const { gpos, gsub, fvar } = font.tables

    const axes: FontVariableAxis[] | null = fvar?.axes
    const gposFeatures: string[] =
      gpos?.features?.map((feature: any) => feature.tag) || []
    const gsubFeatures: string[] =
      gsub?.features?.map((feature: any) => feature.tag) || []

    const features = new Set<string>(
      [...gposFeatures, ...gsubFeatures]
        .sort((a, b) => a.localeCompare(b))
        .filter(str => !!str.trim())
    )

    setFontFeatures(Array.from(features))

    if (axes) {
      // If the font is a variable font, loop through the axes and
      // apply the default variation setting for each axis
      const fontVariations: FontVariation = {}

      axes.forEach(axis => {
        fontVariations[axis.tag] = axis.defaultValue
      })

      createVariationCSS(fontVariations)
      setFontVariationSettings(fontVariations)
    }
  }, [])

  return (
    <div className="features">
      <FontNameHeader
        style={{
          fontFeatureSettings,
          fontVariationSettings: variationCSS
        }}
      />
      <div className="feature-toggles">
        {fontFeatures.map(feature => (
          <Switch
            className="feature-toggle"
            title={renderSwitchTitle(feature)}
            key={feature}
            onChange={checked => toggleFeature(feature, checked)}
          />
        ))}
      </div>
      {renderFontInstances()}
      {renderVariableSliders()}
      <p
        className="text"
        style={{
          fontFeatureSettings,
          fontVariationSettings: variationCSS
        }}
      >
        Toggling different feature settings may cause numbers and letters to display
        differently. In which case, you may see a difference in the following characters:{' '}
        {characters} {numbers}
      </p>
      <p
        className="text"
        style={{
          fontFeatureSettings,
          fontVariationSettings: variationCSS
        }}
      >
        {`Apparently motionless to her passengers and crew, the Interplanetary
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
        mean?`}
      </p>
      <h1 className="feature-table-heading">Feature Table</h1>
      <table>
        <colgroup>
          <col style={{ width: '10%' }} />
          <col style={{ width: '25%' }} />
          <col style={{ width: '65%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Tag</th>
            <th>Friendly Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>{fontFeatures.map(renderTableBody)}</tbody>
      </table>
    </div>
  )
}

export default Features
