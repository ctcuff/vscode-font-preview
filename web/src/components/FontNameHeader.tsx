import '../scss/font-name-header.scss'
import React, { useContext } from 'react'
import FontContext from '../contexts/FontContext'

type FontNameHeaderProps = {
  style?: React.CSSProperties
}

const FontNameHeader = ({ style }: FontNameHeaderProps): JSX.Element => {
  const { font, fileName } = useContext(FontContext)

  return (
    <h1 className="font-name-header" style={style}>
      {font.names.fullName?.en || fileName}
    </h1>
  )
}

export default FontNameHeader
