import { createContext } from 'react'
import { GlobalSavedState } from '../types'

// Ensures that only one instance of the vscode API exists across the app
const VscodeContext = createContext(window.acquireVsCodeApi<GlobalSavedState>())

export default VscodeContext
