import '../scss/app.scss'
import React, { useContext, useEffect, useState } from 'react'
import opentype, { Font } from 'opentype.js'
import TabView, { Tab } from './TabView'
import FontPreview from './tabs/FontPreview'
import Glyphs from './tabs/Glyphs'
import FontContext from '../contexts/FontContext'
import { Config, WebviewMessage } from '../../../shared/types'
import VscodeContext from '../contexts/VscodeContext'
import { FontExtension } from '../types'
import LoadingOverlay from './LoadingOverlay'
import Features from './tabs/Features'
import Waterfall from './tabs/Waterfall'
import Licence from './tabs/Licence'

/**
 * Extensions that can be parsed by opentype
 */
const opentypeExtensions: ReadonlySet<FontExtension> = new Set<FontExtension>([
  'otf',
  'ttf',
  'woff'
])

const getFontMimeType = (fontName: FontExtension): string => {
  switch (fontName) {
    case 'otf':
      return 'opentype'
    case 'ttf':
    case 'ttc':
      return 'truetype'
    case 'woff':
    case 'woff2':
      return 'woff'
    default:
      return ''
  }
}

/**
 * Creates and inserts a <style> element with the loaded font. This allows
 * the font to be accessed anywhere in a stylesheet.
 */
const createStyle = (base64Font: string, fontExtension: FontExtension): void => {
  const style = document.createElement('style')
  const mimeType = getFontMimeType(fontExtension)

  // Using var() in the template string doesn't load the font family
  // so it has to be grabbed from the root element
  const fontFamilyName = getComputedStyle(document.documentElement).getPropertyValue(
    '--font-family-name'
  )

  style.id = 'font-preview'
  style.innerHTML = /* css */ `
    @font-face {
      font-family: ${fontFamilyName};
      src:
        url("data:font/${mimeType};base64,${base64Font}")
        format("${mimeType}");
    }`

  document.head.insertAdjacentElement('beforeend', style)
}

const App = (): JSX.Element | null => {
  const [font, setFont] = useState<Font | null>(null)
  const [fileName, setFileName] = useState('')
  const [isLoading, setLoading] = useState(true)
  const [isFontSupported, setIsFontSupported] = useState(false)
  const [fontFeatures, setFontFeatures] = useState<string[]>([])
  // When set to null, the tab view won't render. This is so that we can
  // wait for the postMessage event to determine the default tab
  const [defaultTabId, setDefaultTabId] = useState<Config['defaultTab'] | null>(null)
  const vscode = useContext(VscodeContext)
  const savedState = vscode.getState()

  const postMessage = (message: WebviewMessage): void => {
    vscode.postMessage(message)
  }

  const loadFont = (fileExtension: FontExtension, fileData: number[]): void => {
    if (!opentypeExtensions.has(fileExtension)) {
      setIsFontSupported(false)
      setFont({} as Font)
      setLoading(false)
      return
    }

    try {
      const fontData = opentype.parse(new Uint8Array(fileData).buffer)

      if (!fontData.supported) {
        setLoading(false)
        return
      }

      // gpos and gsub contain information about the different features available
      // for the font (kern, tnum, sups, etc). fvar (which is only present on variable
      // fonts) contains info about the fonts axes, like weight and slant
      const { gpos, gsub } = fontData.tables

      const gposFeatures: string[] =
        gpos?.features?.map((feature: any) => feature.tag) || []
      const gsubFeatures: string[] =
        gsub?.features?.map((feature: any) => feature.tag) || []

      const features = new Set<string>(
        [...gposFeatures, ...gsubFeatures]
          .sort((a, b) => a.localeCompare(b))
          .filter(str => !!str.trim())
      )

      setFontFeatures(Array.from(features))
      setFont(fontData)
    } catch (err) {
      postMessage({
        type: 'ERROR',
        payload: `Error loading font: ${err.message}`
      })
    }

    setIsFontSupported(true)
    setLoading(false)
  }

  const onMessage = (message: MessageEvent<WebviewMessage>): void => {
    // Reopening the the most recently closed tab (CMD/CTRL + Shift + T )
    // causes vscode to read in the saved state but also fire the init
    // message. Returning here prevents the font from being loaded twice.
    if (savedState && message.data.type === 'LOAD') {
      return
    }

    const { payload } = message.data

    // eslint-disable-next-line default-case
    switch (message.data.type) {
      case 'LOAD':
        loadFont(payload.extension, payload.fileContent)
        createStyle(payload.base64Content, payload.extension)
        setFileName(payload.fileName)

        vscode.setState({
          base64Content: payload.base64Content,
          fileContent: payload.fileContent,
          fontExtension: payload.extension,
          fileName: payload.fileName
        })
        break

      case 'LOAD_CONFIG': {
        setDefaultTabId(payload.defaultTab)
        break
      }
    }
  }

  useEffect(() => {
    postMessage({ type: 'GET_CONFIG' })

    if (savedState) {
      createStyle(savedState.base64Content, savedState.fontExtension)
      loadFont(savedState.fontExtension, savedState.fileContent)
      setFileName(savedState.fileName)
    }

    window.addEventListener('message', onMessage)

    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [])

  if (isLoading) {
    return <LoadingOverlay />
  }

  if (!font) {
    return null
  }

  return (
    <FontContext.Provider value={{ font, fileName, fontFeatures }}>
      <TabView panelClassName="app" defaultTabId={defaultTabId}>
        <Tab title="Preview" id="preview">
          <FontPreview />
        </Tab>
        <Tab
          title="Features"
          id="features"
          visible={
            // Hide this tab if the current font doesn't have
            // any variable font features or feature tags
            isFontSupported && !!(font.tables.gpos || font.tables.gsub)
          }
        >
          <Features />
        </Tab>
        <Tab title="Glyphs" id="glyphs" visible={isFontSupported}>
          <Glyphs />
        </Tab>
        <Tab title="Waterfall" id="waterfall">
          <Waterfall />
        </Tab>
        <Tab title="Licence" id="licence" visible={isFontSupported}>
          <Licence />
        </Tab>
      </TabView>
    </FontContext.Provider>
  )
}

export default App
