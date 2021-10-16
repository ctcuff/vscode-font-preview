import '../scss/feature-toggles.scss'
import React, { useState, useContext } from 'react'
import FontContext from '../contexts/FontContext'
import Switch from './Switch'

type FeatureTogglesProps = {
  onFeatureToggle?: (css: string, activeFeatures: string[]) => void
}

/**
 * Matches cv00 - cv99
 */
const characterVariantRegex = /^[cv]{2}\d{2}/
/**
 * Matches sv00 - sv99
 */
const stylisticVariantRegex = /^[s]{2}\d{2}/

const FeatureToggles = ({ onFeatureToggle }: FeatureTogglesProps): JSX.Element => {
  const [activeFeatures, setActiveFeatures] = useState<string[]>([])
  const { fontFeatures } = useContext(FontContext)

  const toggleFeature = (feature: string, enabled: boolean): void => {
    const features: string[] = [...activeFeatures]

    if (enabled) {
      features.push(feature)
    } else {
      const index = activeFeatures.indexOf(feature)
      if (index !== -1) {
        features.splice(index, 1)
      }
    }

    const css = features.length === 0 ? 'normal' : `"${features.join('", "')}"`

    setActiveFeatures(features)
    onFeatureToggle?.(css, features)
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

  return (
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
  )
}

export default FeatureToggles
