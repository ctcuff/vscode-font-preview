import React, { createContext } from 'react'
import { Font } from 'opentype.js'

const FontContext = createContext<Font | null>(null)

type FontProviderProps = {
  value: Font | null
  children: React.ReactNode
}

const FontProvider = ({ value, children }: FontProviderProps): JSX.Element => {
  return <FontContext.Provider value={value}>{children}</FontContext.Provider>
}

export { FontProvider, FontContext }
