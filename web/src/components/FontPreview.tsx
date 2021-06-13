import '../scss/font-preview.scss'
import React, { useContext } from 'react'
import SampleText from './SampleText'
import { FontContext } from '../contexts/FontContext'

type FontPreviewProps = {
  fileName: string
}

const FontPreview = ({ fileName }: FontPreviewProps): JSX.Element | null => {
  const font = useContext(FontContext)

  return (
    <div className="font-preview">
      <h1 className="font-name">{font?.tables?.name?.fullName?.en || fileName}</h1>
      <SampleText className="text-preview" />
    </div>
  )
}

export default FontPreview
