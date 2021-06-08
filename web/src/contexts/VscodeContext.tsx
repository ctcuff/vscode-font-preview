import { createContext } from 'react'
import { VSCodeAPI } from '../types'

const VscodeContext = createContext<VSCodeAPI>(window.acquireVsCodeApi())

export default VscodeContext
