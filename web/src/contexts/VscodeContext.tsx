import { createContext } from 'react'
import { GlobalSavedState } from '../types'

const VscodeContext = createContext(window.acquireVsCodeApi<GlobalSavedState>())

export default VscodeContext
