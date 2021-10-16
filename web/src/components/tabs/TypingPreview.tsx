import '../../scss/typing-preview.scss'
import React, { useState, useCallback } from 'react'
import FontNameHeader from '../FontNameHeader'
import FeatureToggles from '../FeatureToggles'
import Slider from '../Slider'

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
  const [fontFeatureSettingsCSS, setFontFeatureSettingsCSS] = useState('normal')

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

  return (
    <div className="typing-preview">
      <section>
        <FontNameHeader />
        <h2>Features</h2>
        <FeatureToggles onFeatureToggle={css => setFontFeatureSettingsCSS(css)} />
      </section>
      <section>
        <Slider
          className="attribute-slider"
          min={8}
          max={96}
          value={fontSize}
          title="Font Size"
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
      </section>
      <p
        contentEditable
        onPaste={onPaste}
        ref={paragraphRef}
        className="text-preview"
        style={{
          fontSize,
          lineHeight,
          fontFeatureSettings: fontFeatureSettingsCSS
        }}
      >
        {starterText}
      </p>
    </div>
  )
}

export default TypingPreview
