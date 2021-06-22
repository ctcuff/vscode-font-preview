import '../scss/font-preview.scss'
import React from 'react'
import SampleText from './SampleText'
import FontNameHeader from './FontNameHeader'

const FontPreview = (): JSX.Element => (
  <div className="font-preview">
    <FontNameHeader />
    <SampleText className="text-preview" />
  </div>
)

export default FontPreview
