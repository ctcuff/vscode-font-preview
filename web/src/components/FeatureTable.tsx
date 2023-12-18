import '../scss/feature-table.scss'
import React, { useContext } from 'react'
import FontContext from '../contexts/FontContext'
import featureTable from '../assets/feature-tags.json'
import useLogger from '../hooks/use-logger'

type FeatureTableProps = {
  activeFeatures: string[]
}

const LOG_TAG = 'FeatureTable'

/**
 * Matches cv00 - cv99
 */
const characterVariantRegex = /^[cv]{2}\d{2}/
/**
 * Matches sv00 - sv99
 */
const stylisticVariantRegex = /^[s]{2}\d{2}/

const FeatureTable = ({ activeFeatures }: FeatureTableProps): JSX.Element => {
  const { fontFeatures } = useContext(FontContext)
  const logger = useLogger()

  // Keep track of whether we've seen "cv01" to "cv99" or
  // "ss01" to "ss20" so that it's only included once in the table
  let hasCharacterVariant = false
  let hasStylisticSet = false

  const renderTableBody = (feature: string): JSX.Element | null => {
    let key = feature as keyof typeof featureTable
    let tag: string = feature
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
      logger.warn(`Feature: ${key} not found in table`, LOG_TAG)
      return null
    }

    for (let i = 0; i < activeFeatures.length; i++) {
      const activeFeature: string = activeFeatures[i]

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
          <a href={featureTable[key].href} title="Open documentation in browser">
            {tag}
          </a>
        </td>
        <td>{featureTable[key].friendlyName}</td>
        <td>{featureTable[key].description}</td>
      </tr>
    )
  }

  return (
    <table className="feature-table">
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
  )
}

export default FeatureTable
