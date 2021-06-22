import React, { createContext } from 'react'
import { Font } from 'opentype.js'

// A dummy object is provided here because the App component makes sure
// that the context is never initialized with a null value. Because of
// that, we need a fake Font object so TS doesn't complain
const FontContext = createContext<Font>({} as Font)

type FontProviderProps = {
  value: Font
  children: React.ReactNode
}

const FontProvider = ({ value, children }: FontProviderProps): JSX.Element => (
  <FontContext.Provider value={value}>{children}</FontContext.Provider>
)

export { FontProvider, FontContext }
