import '../scss/font-preview.scss'
import React, { useState } from 'react'
import FontNameHeader from './FontNameHeader'
import Chip from './Chip'
import sampleEN from '../assets/sample-text/en.sample.yml'
import sampleZH from '../assets/sample-text/zh.sample.yml'
import sampleJA from '../assets/sample-text/ja.sample.yml'

type Preview = {
  paragraphs: string[]
  source: string
}

const languages = [sampleEN, sampleZH, sampleJA]

const FontPreview = (): JSX.Element => {
  const [preview, setPreview] = useState<Preview>({
    paragraphs: sampleEN.paragraphs,
    source: sampleEN.source
  })

  return (
    <div className="font-preview">
      <FontNameHeader />
      <div className="languages">
        {languages.map(({ language, paragraphs, source }) => (
          <Chip
            title={language}
            key={language}
            onClick={() => setPreview({ paragraphs, source })}
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
