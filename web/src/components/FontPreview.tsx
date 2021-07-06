import '../scss/font-preview.scss'
import React, { useState } from 'react'
import FontNameHeader from './FontNameHeader'
import Chip from './Chip'
import sampleEN from '../assets/sample-text/en.sample.yml'
import sampleZH from '../assets/sample-text/zh.sample.yml'

const languages = [
  {
    displayName: 'English',
    iso: 'en',
    preview: sampleEN
  },
  {
    displayName: 'Chinese',
    iso: 'zh',
    preview: sampleZH
  }
]

const FontPreview = (): JSX.Element => {
  const [preview, setPreview] = useState(sampleEN)

  return (
    <div className="font-preview">
      <FontNameHeader />
      <div className="languages">
        {languages.map(lang => (
          <Chip
            title={lang.displayName}
            key={lang.iso}
            onClick={() => setPreview(lang.preview)}
          />
        ))}
      </div>
      <div className="text-preview">
        {preview.paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
        <p className="extended-text--author">{preview.source}</p>
      </div>
    </div>
  )
}

export default FontPreview
