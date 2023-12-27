import '../scss/app.scss'
import React, { useContext, useEffect, useState } from 'react'
import { Font, Glyph } from 'opentype.js'
import { ToastContainer } from 'react-toastify'
import {
  WorkspaceConfig,
  FontLoadEvent,
  WebviewMessage,
  PreviewSample
} from '@font-preview/shared/'
import TabView, { Tab } from './TabView'
import FontPreview from './tabs/FontPreview'
import Glyphs from './tabs/Glyphs'
import FontContext, { GlyphDataCache } from '../contexts/FontContext'
import VscodeContext from '../contexts/VscodeContext'
import Features from './tabs/Features'
import Waterfall from './tabs/Waterfall'
import License from './tabs/License'
import TypingPreview from './tabs/TypingPreview'
import { isTableEmpty } from '../util'
import FontLoader from '../font-loader'
import useLogger from '../hooks/use-logger'
import ErrorOverlay from './ErrorOverlay'
import { calculateNumPoints } from '../util/glyph-util'

const LOG_TAG = 'App'

const App = (): JSX.Element | null => {
  const [font, setFont] = useState<Font | null>(null)
  const [glyphs, setGlyphs] = useState<Glyph[]>([])
  const [glyphDataCache, setGlyphDataCache] = useState<GlyphDataCache[]>([])
  const [fileName, setFileName] = useState('')
  const [isFontSupported, setIsFontSupported] = useState(false)
  const [fontFeatures, setFontFeatures] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<WorkspaceConfig | null>(null)
  const [sampleTexts, setSampleTexts] = useState<PreviewSample[]>([])
  const vscode = useContext(VscodeContext)
  const logger = useLogger()

  const loadFont = async (payload: FontLoadEvent['payload']) => {
    try {
      const fontLoader = new FontLoader(logger, {
        ...payload,
        onBeforeCreateStyle: () =>
          vscode.postMessage({ type: 'TOGGLE_PROGRESS', payload: true }),
        onStyleCreated: () =>
          vscode.postMessage({ type: 'TOGGLE_PROGRESS', payload: false }),
        onLoadError: () => {
          vscode.postMessage({ type: 'TOGGLE_PROGRESS', payload: false })
          vscode.postMessage({
            type: 'SHOW_MESSAGE',
            payload: {
              message:
                "Couldn't render font preview. Some font information may still be available.",
              messageType: 'ERROR'
            }
          })
        }
      })

      const { font: fontData, features } = await fontLoader.loadFont()

      setIsFontSupported(fontLoader.isSupported)
      setFontFeatures(features)
      setFileName(payload.fileName)

      if (fontData) {
        const allGlyphs: Glyph[] = []
        const dataCache: GlyphDataCache[] = []

        for (let i = 0; i < fontData.glyphs.length; i++) {
          const glyph = fontData.glyphs.get(i)

          // Need to call glyph.getPath() before accessing the contours array, otherwise
          // it will always return an empty array because the points property will be undefined
          // https://github.com/opentypejs/opentype.js/blob/9225ad6a88927394805d1be04ced66221c899840/src/glyphset.js#L134
          // https://github.com/opentypejs/opentype.js/blob/9225ad6a88927394805d1be04ced66221c899840/src/tables/glyf.js#L106
          // https://github.com/opentypejs/opentype.js/blob/9225ad6a88927394805d1be04ced66221c899840/src/glyph.js#L203
          const path = glyph.getPath()

          allGlyphs.push(glyph)
          dataCache.push({
            index: i,
            contours: glyph.getContours().flat(),
            metrics: glyph.getMetrics(),
            numPoints: calculateNumPoints(path)
          })
        }

        setGlyphDataCache(dataCache)
        setGlyphs(allGlyphs)
      }

      setFont(fontData)
    } catch (err: unknown) {
      logger.error('Failed to load font', LOG_TAG, err)
      vscode.postMessage({ type: 'TOGGLE_PROGRESS', payload: true })
      setError(`An error occurred while parsing this font: ${(err as Error).message}`)
    }
  }

  const onMessage = (message: MessageEvent<WebviewMessage>): void => {
    logger.debug(`Received message from extension: ${message.data.type}`, LOG_TAG)

    switch (message.data.type) {
      case 'FONT_LOADED': {
        loadFont(message.data.payload)
        break
      }
      case 'CONFIG_LOADED': {
        setConfig(message.data.payload)
        break
      }
      case 'SAMPLE_TEXT_LOADED':
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
    logger.debug('Webview initialized', LOG_TAG)
    window.addEventListener('message', onMessage)

    vscode.postMessage({ type: 'GET_FONT' })
    vscode.postMessage({ type: 'GET_CONFIG' })
    vscode.postMessage({ type: 'GET_SAMPLE_TEXT' })

    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [])

  if (error) {
    return <ErrorOverlay errorMessage={error} />
  }

  if (!font || !config) {
    return null
  }

  return (
    <FontContext.Provider
      value={{ font, fileName, fontFeatures, glyphs, glyphDataCache }}
    >
      <ToastContainer limit={1} />
      <TabView panelClassName="app" defaultTabId={config.defaultTab || 'Preview'}>
        <Tab title="Preview" id="Preview" forceRender>
          <FontPreview
            sampleTexts={sampleTexts}
            defaultSampleTextId={config.defaultSampleTextId}
          />
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
        <Tab title="Glyphs" id="Glyphs" visible={isFontSupported || glyphs.length > 0}>
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
