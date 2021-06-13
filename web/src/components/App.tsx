/* eslint-disable no-console */
import '../scss/app.scss'
import React, { useContext, useEffect, useState } from 'react'
import opentype, { Font } from 'opentype.js'
import TabView, { Tab } from './TabView'
import FontPreview from './FontPreview'
import Glyphs from './Glyphs'
import { FontProvider } from '../contexts/FontContext'
import { WebviewMessage } from '../../../shared/webview-message'
import VscodeContext from '../contexts/VscodeContext'
import { FontExtension } from '../types'
import LoadingOverlay from './LoadingOverlay'

const getFontMimeType = (fontName: FontExtension): string => {
  switch (fontName) {
    case 'otf':
      return 'opentype'
    case 'ttf':
      return 'truetype'
    case 'woff':
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
  const vscode = useContext(VscodeContext)
  const savedState = vscode.getState()

  const loadFont = (fileData: number[]): void => {
    const errorMessage: WebviewMessage = {
      type: 'FONT_LOAD_ERROR'
    }

    try {
      const fontData = opentype.parse(new Uint8Array(fileData).buffer)

      if (!fontData.supported) {
        console.log('NOT SUPPORTED')
        errorMessage.payload = 'This font is not supported or cannot be displayed.'
        vscode.postMessage(errorMessage)
        return
      }

      console.log(fontData.tables)

      setFont(fontData)
    } catch (err) {
      console.log(err)
      errorMessage.payload = err.message
      vscode.postMessage(errorMessage)
    }

    setLoading(false)
  }

  const onMessage = (message: MessageEvent<WebviewMessage>): void => {
    // CMD/CTRL + Shift + T reopens the most recently closed tab. This
    // causes vscode to read in the saved state but also fire the init
    // message. Returning here prevents the font from being loaded twice.
    if (savedState || message.data.type !== 'LOAD') {
      return
    }

    const { payload } = message.data

    loadFont(payload.fileContent)
    createStyle(payload.base64Content, payload.extension)
    setFileName(payload.fileName)

    vscode.setState({
      base64Content: payload.base64Content,
      fileContent: payload.fileContent,
      fontExtension: payload.extension
    })
  }

  useEffect(() => {
    if (savedState) {
      createStyle(savedState.base64Content, savedState.fontExtension)
      loadFont(savedState.fileContent)
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
    <FontProvider value={font}>
      <TabView>
        <Tab title="Preview">
          <FontPreview fileName={fileName} />
        </Tab>
        <Tab title="Glyphs">
          <Glyphs />
        </Tab>
      </TabView>
    </FontProvider>
  )
}

export default App
