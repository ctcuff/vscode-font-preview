import '../../scss/features.scss'
import React, { useContext, useState } from 'react'
import FontContext from '../../contexts/FontContext'
import FeatureToggles from '../FeatureToggles'
import FontNameHeader from '../FontNameHeader'
import Chip from '../Chip'
import FeatureTable from '../FeatureTable'
import VariableAxes from '../VariableAxes'
import { createVariationCSS, isTableEmpty } from '../../util'

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

  const onInstanceClick = (instance: FontVariableAxisInstance): void => {
    const coordinates = instance.coordinates
    const settingName = instance.name.en?.trim() || 'Unknown'

    Object.entries(coordinates).forEach(([key, value]) => {
      coordinates[key] = Math.trunc(value)
    })

    const css = createVariationCSS(coordinates)

    setSelectedSetting(settingName)
    setFontVariationSettings(coordinates)
    setVariationCSS(css)
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

  return (
    <div className="features">
      <FontNameHeader
        style={{
          fontFeatureSettings: fontFeatureSettingsCSS,
          fontVariationSettings: variationCSS
        }}
      />
      <section>
        <h2>Features</h2>
        <FeatureToggles onFeatureToggle={onFeatureToggle} />
      </section>
      <section>{renderFontInstances()}</section>
      {!isTableEmpty(font.tables.fvar) && (
        <section>
          <h2>Axes</h2>
          <VariableAxes
            onVariationChange={setVariationCSS}
            // Need to pass this component's variation settings down so that
            // the sliders can update when font instances are clicked
            variationSettings={fontVariationSettings}
          />
        </section>
      )}
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
