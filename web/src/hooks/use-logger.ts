import { useContext, useRef } from 'react'
import Logger from '../logger'
import VscodeContext from '../contexts/VscodeContext'

const useLogger = (): Logger => {
  const vscode = useContext(VscodeContext)
  const logger = useRef(Logger.getInstance(vscode))
  return logger.current
}

export default useLogger
