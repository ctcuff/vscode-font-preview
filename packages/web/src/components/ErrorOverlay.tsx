import '../scss/error-overlay.scss'
import React from 'react'
import { VscWarning } from 'react-icons/vsc'

type ErrorOverlayProps = {
  errorMessage: string
}

const ErrorOverlay = (props: ErrorOverlayProps): JSX.Element => (
  <div className="error-overlay">
    <VscWarning />
    <p className="error-msg">{props.errorMessage}</p>
  </div>
)

export default ErrorOverlay
