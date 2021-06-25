import { createContext } from 'react'
import type { Font } from 'opentype.js'

type FontContextProps = {
  font: Font
  /**
   * Holds a reference to the filename of the font (without the extension)
   * in case the name of the font can be accessed through opentype
   */
  fileName: string
}

const FontContext = createContext<FontContextProps>({
  // A dummy object is provided here because the App component makes sure
  // that the context is never initialized with a null value. Because of
  // that, we need a fake Font object so TS doesn't complain
  font: {} as Font,
  fileName: ''
})

export default FontContext
