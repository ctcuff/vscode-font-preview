import { Context, createContext } from 'react'
import { TypedWebviewApi, VSCodeSavedState } from '../types'

// Ensures that only one instance of the vscode API exists across the app
const VscodeContext: Context<TypedWebviewApi> = createContext(
  window.acquireVsCodeApi<VSCodeSavedState>()
)

export default VscodeContext
