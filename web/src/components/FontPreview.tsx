import '../scss/font-preview.scss'
import React, { useState } from 'react'
import FontNameHeader from './FontNameHeader'
import Chip from './Chip'
import sampleLA from '../assets/sample-text/la.sample.yml'
import sampleZH from '../assets/sample-text/zh.sample.yml'
import sampleJA from '../assets/sample-text/ja.sample.yml'
import sampleAR from '../assets/sample-text/ar.sample.yml'

const languages = [sampleLA, sampleZH, sampleJA, sampleAR].sort((first, second) => {
  return first.id.localeCompare(second.id)
})

const FontPreview = (): JSX.Element => {
  const [preview, setPreview] = useState(sampleLA)

  return (
    <div className="font-preview">
      <FontNameHeader />
      <div className="languages">
        {languages.map(lang => (
          <Chip
            title={lang.id}
            key={lang.id}
            selected={preview.id === lang.id}
            onClick={() => setPreview(lang)}
          />
        ))}
      </div>
      <div className="text-preview" style={{ direction: preview.rtl ? 'rtl' : 'ltr' }}>
        {preview.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        <p className="extended-text--author">{preview.source}</p>
      </div>
    </div>
  )
}

export default FontPreview
