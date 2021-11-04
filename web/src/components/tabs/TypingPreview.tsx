import '../../scss/typing-preview.scss'
import React, { useState, useCallback, useContext, useRef } from 'react'
import FontNameHeader from '../FontNameHeader'
import FeatureToggles from '../FeatureToggles'
import Slider from '../Slider'
import VariableAxes from '../VariableAxes'
import FontContext from '../../contexts/FontContext'
import { isTableEmpty } from '../../util'
import Chip from '../Chip'

type PinnedSection = 'features' | 'axes' | 'properties'

/**
 * Allows plain text to be pasted into a contentEditable element
 * without formatting/styling being applied to it
 */
const onPaste = (event: React.ClipboardEvent<HTMLParagraphElement>): void => {
  event.preventDefault()

  const range = document.getSelection()?.getRangeAt(0)
  const clipboardText = event.clipboardData.getData('text/plain')

  if (!range) {
    return
  }

  range.deleteContents()

  const textNode = document.createTextNode(clipboardText)

  range.insertNode(textNode)
  range.selectNodeContents(textNode)
  range.collapse(false)

  const selection = window.getSelection()

  selection?.removeAllRanges()
  selection?.addRange(range)
}

const starterText = 'Type your text here...'

const TypingPreview = (): JSX.Element => {
  const [fontSize, setFontSize] = useState(16)
  const [lineHeight, setLineHeight] = useState(1.2)
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [fontFeatureSettingsCSS, setFontFeatureSettingsCSS] = useState('normal')
  const [pageMarginTop, setPageMarginTop] = useState(0)
  const [variationCSS, setVariationCSS] = useState('')
  const { fontFeatures, font } = useContext(FontContext)
  const [pinnedSection, setPinnedSection] = useState<PinnedSection | null>(null)

  const refs: { [key in PinnedSection]: React.RefObject<HTMLElement> } = {
    features: useRef<HTMLElement>(null),
    axes: useRef<HTMLElement>(null),
    properties: useRef<HTMLElement>(null)
  }

  // When the paragraph element gets mounted, focus it and
  // move the user's caret to the end of the sentence
  const paragraphRef = useCallback((paragraphNode: HTMLParagraphElement | null): void => {
    if (!paragraphNode) {
      return
    }

    paragraphNode.focus()

    const range = document.createRange()
    const selection = window.getSelection()
    const childNodes = paragraphNode.childNodes

    range.setStart(childNodes[childNodes.length - 1], starterText.length)
    range.collapse(true)

    selection?.removeAllRanges()
    selection?.addRange(range)
  }, [])

  const togglePinnedSection = (sectionName: PinnedSection): void => {
    const currentSectionRef = refs[sectionName].current

    setPinnedSection(pinnedSection === sectionName ? null : sectionName)

    // In this case, the section is unpinned, remove the margin
    if (pinnedSection === sectionName) {
      setPageMarginTop(0)
    } else if (currentSectionRef) {
      setTimeout(() => {
        // Because the pinned element has a max-height, we need to
        // wrap this in a setTimeout so that the element has time
        // to calculate its size
        setPageMarginTop(currentSectionRef.offsetHeight + 52)
      }, 50)
    }
  }

  return (
    <div className="typing-preview" style={{ marginTop: pageMarginTop }}>
      <FontNameHeader />
      {fontFeatures.length > 0 && (
        <section
          className={pinnedSection === 'features' ? 'pinned' : ''}
          ref={refs.features}
        >
          <div className="row">
            <h2>Features</h2>
            <Chip
              title={pinnedSection === 'features' ? 'Unpin' : 'Pin'}
              onClick={() => togglePinnedSection('features')}
              selected={pinnedSection === 'features'}
            />
          </div>
          <FeatureToggles onFeatureToggle={css => setFontFeatureSettingsCSS(css)} />
        </section>
      )}
      {!isTableEmpty(font.tables.fvar) && (
        <section className={pinnedSection === 'axes' ? 'pinned' : ''} ref={refs.axes}>
          <div className="row">
            <h2>Axes</h2>
            <Chip
              title={pinnedSection === 'axes' ? 'Unpin' : 'Pin'}
              onClick={() => togglePinnedSection('axes')}
              selected={pinnedSection === 'axes'}
            />
          </div>
          <VariableAxes onVariationChange={setVariationCSS} />
        </section>
      )}
      <section
        className={pinnedSection === 'properties' ? 'pinned' : ''}
        ref={refs.properties}
      >
        <div className="row">
          <h2>Properties</h2>
          <Chip
            title={pinnedSection === 'properties' ? 'Unpin' : 'Pin'}
            onClick={() => togglePinnedSection('properties')}
            selected={pinnedSection === 'properties'}
          />
        </div>
        <Slider
          className="attribute-slider"
          min={8}
          max={128}
          value={fontSize}
          title="Font Size"
          unit="px"
          onChange={setFontSize}
        />
        <Slider
          className="attribute-slider"
          min={1}
          max={5}
          step={0.01}
          value={lineHeight}
          title="Line Height"
          onChange={setLineHeight}
        />
        <Slider
          className="attribute-slider"
          min={0}
          max={32}
          step={0.01}
          value={letterSpacing}
          title="Letter Spacing"
          unit="px"
          onChange={setLetterSpacing}
        />
      </section>
      <p
        contentEditable
        onPaste={onPaste}
        ref={paragraphRef}
        className="text-preview"
        style={{
          fontSize,
          lineHeight,
          letterSpacing,
          fontFeatureSettings: fontFeatureSettingsCSS,
          fontVariationSettings: variationCSS
        }}
      >
        {starterText}
      </p>
    </div>
  )
}

export default TypingPreview
