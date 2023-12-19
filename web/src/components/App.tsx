import '../scss/app.scss'
import React, { useContext, useEffect, useState } from 'react'
import { Font } from 'opentype.js'
import { ToastContainer } from 'react-toastify'
import { VscWarning } from 'react-icons/vsc'
import TabView, { Tab } from './TabView'
import FontPreview from './tabs/FontPreview'
import Glyphs from './tabs/Glyphs'
import FontContext from '../contexts/FontContext'
import {
  WorkspaceConfig,
  FontLoadEvent,
  WebviewMessage,
  PreviewSample
} from '../../../shared/types'
import VscodeContext from '../contexts/VscodeContext'
import Features from './tabs/Features'
import Waterfall from './tabs/Waterfall'
import License from './tabs/License'
import TypingPreview from './tabs/TypingPreview'
import { isTableEmpty } from '../util'
import FontLoader from '../font-loader'
import useLogger from '../hooks/use-logger'

const LOG_TAG = 'App'

const App = (): JSX.Element | null => {
  const [font, setFont] = useState<Font | null>(null)
  const [fileName, setFileName] = useState('')
  const [isFontSupported, setIsFontSupported] = useState(false)
  const [fontFeatures, setFontFeatures] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<WorkspaceConfig | null>(null)
  const [sampleTexts, setSampleTexts] = useState<PreviewSample[]>([])
  const vscode = useContext(VscodeContext)
  const logger = useLogger()
  const savedState = vscode.getState()

  const loadFont = async (payload: FontLoadEvent['payload']) => {
    try {
      const fontLoader = new FontLoader(logger, {
        ...payload,
        onBeforeCreateStyle: () => vscode.postMessage({ type: 'PROGRESS_START' }),
        onStyleCreated: () => vscode.postMessage({ type: 'PROGRESS_STOP' }),
        onLoadError: () => {
          vscode.postMessage({
            type: 'ERROR',
            payload: `Parsing Error: Couldn't render font preview.
              Font information will still be available.`
          })
        }
      })

      const { font: fontData, features } = await fontLoader.loadFont()

      setIsFontSupported(fontLoader.isSupported)
      setFont(fontData)
      setFontFeatures(features)
      setFileName(payload.fileName)
    } catch (err: unknown) {
      logger.error('Failed to load font', LOG_TAG, err)
      vscode.postMessage({ type: 'PROGRESS_STOP' })
      setError(`An error occurred while parsing this font: ${(err as Error).message}`)
    }
  }

  const onMessage = (message: MessageEvent<WebviewMessage>): void => {
    logger.info(`Received message from extension: ${message.data.type}`, LOG_TAG)

    switch (message.data.type) {
      case 'FONT_LOADED': {
        if (savedState?.fileUrl) {
          // Reopening the the most recently closed tab (CMD/CTRL + Shift + T )
          // causes vscode to read in the saved state but also fire the FONT_LOADED
          // event. Returning here prevents the font from being loaded twice.
          // TLDR: Ignore the FONT_LOADED event if there's a saved state
          break
        }
        const { payload } = message.data
        loadFont(payload)
        setConfig(payload.config)
        vscode.setState(payload)
        break
      }
      case 'CONFIG_LOADED': {
        // If the config changed, we'll need to load the font again
        const { payload } = message.data

        setConfig(payload)

        if (savedState) {
          const updatedState = {
            ...savedState,
            config: payload
          }

          loadFont(updatedState)
          vscode.setState(updatedState)
        }
        break
      }
      case 'LOAD_SAMPLE_TEXT':
        setSampleTexts(message.data.payload)
        break
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
    logger.info('Webview initialized', LOG_TAG)
    window.addEventListener('message', onMessage)

    // If we're loading from the saved state, we need to fetch the config
    // again just in case it changed while the webview was hidden
    if (savedState?.fileUrl) {
      logger.info('Loading from saved state', LOG_TAG)
      vscode.postMessage({ type: 'GET_CONFIG' })
      vscode.postMessage({ type: 'GET_SAMPLE_TEXT' })
    }

    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [])

  if (error) {
    return (
      <div className="app error-container">
        <VscWarning />
        <p className="error-msg">{error}</p>
      </div>
    )
  }

  if (!font || !config) {
    return null
  }

  return (
    <FontContext.Provider value={{ font, fileName, fontFeatures }}>
      <ToastContainer limit={1} />
      <TabView panelClassName="app" defaultTabId={config?.defaultTab || 'Preview'}>
        <Tab title="Preview" id="Preview" forceRender>
          <FontPreview sampleTexts={sampleTexts} />
        </Tab>
        <Tab
          // Hide this tab if the current font doesn't have
          // any variable font features or feature tags
          visible={shouldShowFeatureTab()}
          title="Features"
          id="Features"
        >
          <Features />
        </Tab>
        <Tab title="Glyphs" id="Glyphs" visible={isFontSupported}>
          <Glyphs config={config} />
        </Tab>
        <Tab title="Waterfall" id="Waterfall" forceRender>
          <Waterfall />
        </Tab>
        <Tab title="Type Yourself" id="Type Yourself" forceRender>
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
