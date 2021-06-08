/* eslint-disable */
import '../scss/app.scss'
import React, { useContext, useEffect, useState } from 'react'
import opentype from 'opentype.js'
import VscodeContext from '../contexts/VscodeContext'
import { WebviewMessage } from '../../../shared/webview-message'

const App = (): JSX.Element => {
  const [fileContent, setFileContent] = useState<number[] | null>(null)
  const vscode = useContext(VscodeContext)
  const prevState = vscode.getState()

  const loadFont = (fileData: number[]) => {
    try {
      const font = opentype.parse(new Uint8Array(fileData).buffer)
      if (font.supported) {
        console.log(font.tables)
      } else {
        console.warn('Font is not supported or cannot be displayed')
      }
    } catch (err) {
      console.warn(err)
    }
  }

  const onMessage = (message: MessageEvent<WebviewMessage>) => {
    if (message.data.type === 'INIT') {
      loadFont(message.data.payload.fileContent)
    }
  }

  useEffect(() => {
    if (prevState && prevState.content) {
      console.log('prev state')
      setFileContent(prevState.content as number[])
    }

    window.addEventListener('message', onMessage)

    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [])

  useEffect(() => {
    if (fileContent) {
      console.log('fileContent has been initialized')
    }
  }, [fileContent])

  return (
    <div className="app">
      <h1>Font Preview</h1>
    </div>
  )
}

export default App
