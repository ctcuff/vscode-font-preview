import '../scss/font-preview.scss'
import React from 'react'
import SampleText from './SampleText'

type FontPreviewProps = {
  fontName: string
}

const FontPreview = ({ fontName }: FontPreviewProps): JSX.Element => (
  <div className="font-preview">
    <h1 className="font-name">{fontName}</h1>
    <SampleText className="text-preview" />
  </div>
)

export default FontPreview
