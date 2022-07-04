import '../scss/app.scss'
import React, { useContext, useEffect, useState } from 'react'
import { Font } from 'opentype.js'
import TabView, { Tab } from './TabView'
import FontPreview from './tabs/FontPreview'
import Glyphs from './tabs/Glyphs'
import FontContext from '../contexts/FontContext'
import { Config, WebviewMessage, FontLoadEvent } from '../../../shared/types'
import VscodeContext from '../contexts/VscodeContext'
import Features from './tabs/Features'
import Waterfall from './tabs/Waterfall'
import License from './tabs/License'
import TypingPreview from './tabs/TypingPreview'
import { isTableEmpty } from '../util'
import FontLoader from '../font-loader'

const App = (): JSX.Element | null => {
  // When set to null, the tab view won't render. This is so that we can
  // wait for the postMessage event to determine the default tab
  const [defaultTabId, setDefaultTabId] = useState<Config['defaultTab'] | null>(null)
  const [font, setFont] = useState<Font | null>(null)
  const [fileName, setFileName] = useState('')
  const [isFontSupported, setIsFontSupported] = useState(false)
  const [fontFeatures, setFontFeatures] = useState<string[]>([])
  const vscode = useContext(VscodeContext)
  const savedState = vscode.getState()

  const postMessage = (message: WebviewMessage): void => {
    vscode.postMessage(message)
  }

  const loadFont = async (payload: FontLoadEvent['payload']) => {
    try {
      const fontLoader = new FontLoader({
        fileExtension: payload.fileExtension,
        fileName: payload.fileName,
        fileUrl: payload.fileUrl,
        fileContent: payload.fileContent
      })

      const { font: fontData, features } = await fontLoader.loadFont()

      setIsFontSupported(fontLoader.supported)
      setFont(fontData)
      setFontFeatures(features)
      setFileName(payload.fileName)
    } catch (err: unknown) {
      postMessage({
        type: 'ERROR',
        payload: (err as Error).message
      })
    }
  }

  const onMessage = (message: MessageEvent<WebviewMessage>): void => {
    // Reopening the the most recently closed tab (CMD/CTRL + Shift + T )
    // causes vscode to read in the saved state but also fire the FONT_LOADED
    // event. Returning here prevents the font from being loaded twice.
    if (savedState?.fileUrl && message.data.type === 'FONT_LOADED') {
      return
    }

    switch (message.data.type) {
      case 'FONT_LOADED': {
        const { payload } = message.data

        loadFont(payload)

        vscode.setState({
          fileExtension: payload.fileExtension,
          fileName: payload.fileName,
          fileUrl: payload.fileUrl,
          fileContent: payload.fileContent
        })
        break
      }
      case 'CONFIG_LOADED': {
        setDefaultTabId(message.data.payload.defaultTab)
        break
      }
      default:
        break
    }
  }

  const shouldShowFeatureTab = (): boolean => {
    if (!font || !font.tables) {
      return false
    }

    const { gpos, gsub, fvar } = font.tables

    if (!isFontSupported) {
      return false
    }

    if (!gpos && !gsub && !fvar) {
      return false
    }

    // In this case the font might have gpos, gsub, or fvar tables, but
    // all of them might be empty. No point in showing the tab
    if (isTableEmpty(gpos) && isTableEmpty(gsub) && isTableEmpty(fvar)) {
      return false
    }

    return true
  }

  useEffect(() => {
    window.addEventListener('message', onMessage)
    postMessage({ type: 'GET_CONFIG' })

    if (savedState?.fileUrl) {
      loadFont({
        fileExtension: savedState.fileExtension,
        fileName: savedState.fileName,
        fileUrl: savedState.fileUrl,
        fileContent: savedState.fileContent
      })
    }

    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [])

  if (!font) {
    return null
  }

  return (
    <FontContext.Provider value={{ font, fileName, fontFeatures }}>
      <TabView panelClassName="app" defaultTabId={defaultTabId}>
        <Tab title="Preview" id="Preview">
          <FontPreview />
        </Tab>
        <Tab
          title="Features"
          id="Features"
          visible={
            // Hide this tab if the current font doesn't have
            // any variable font features or feature tags
            shouldShowFeatureTab()
          }
        >
          <Features />
        </Tab>
        <Tab title="Glyphs" id="Glyphs" visible={isFontSupported}>
          <Glyphs />
        </Tab>
        <Tab title="Waterfall" id="Waterfall">
          <Waterfall />
        </Tab>
        <Tab title="Type Yourself" id="Type Yourself">
          <TypingPreview />
        </Tab>
        <Tab title="License" id="License" visible={isFontSupported}>
          <License />
        </Tab>
      </TabView>
    </FontContext.Provider>
  )
}

export default App
