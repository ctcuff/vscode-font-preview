/* eslint-disable */
import '../scss/app.scss'
import React, { useEffect, useState } from 'react'
import opentype from 'opentype.js'
import { WebviewMessage } from '../../../shared/webview-message'
import SampleText from './SampleText'

type FontExtension = 'ttf' | 'otf' | 'woff' | ''

type SavedState = {
  base64Content: string
  fileContent: number[]
  fontExtension: FontExtension
}

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

const vscode = window.acquireVsCodeApi<SavedState>()

const App = (): JSX.Element => {
  const [font, setFont] = useState<opentype.Font | null>(null)
  const [fileName, setFileName] = useState('')
  const savedState = vscode.getState()

  const createStyle = (base64Font: string, fontExtension: FontExtension): void => {
    const style = document.createElement('style')
    const mimeType = getFontMimeType(fontExtension)

    style.id = 'font-preview'
    style.innerHTML = /* css */ `
      @font-face {
        font-family: "Font-Preview";
        src:
          url("data:font/${mimeType};base64,${base64Font}")
          format("${mimeType}");
      }`

    document.head.insertAdjacentElement('beforeend', style)
  }

  const loadFont = (fileData: number[]): void => {
    try {
      const data = new Uint8Array(fileData)
      const fontData = opentype.parse(data.buffer)

      if (!fontData.supported) {
        console.warn('Font is not supported or cannot be displayed')
        return
      }
      console.log(fontData.tables)

      setFont(fontData)
    } catch (err) {
      console.warn(err)
    }
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

  return (
    <div className="app">
      {font && (
        <>
          <h1 className="font-preview">{font.tables?.name?.fullName?.en || fileName}</h1>
          <SampleText />
        </>
      )}
    </div>
  )
}

export default App
