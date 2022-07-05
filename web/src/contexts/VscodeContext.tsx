import { Context, createContext } from 'react'
import { GlobalSavedState, TypedWebviewApi } from '../types'

// Ensures that only one instance of the vscode API exists across the app
const VscodeContext: Context<TypedWebviewApi> = createContext(
  window.acquireVsCodeApi<GlobalSavedState>()
)

export default VscodeContext
