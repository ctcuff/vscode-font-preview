import './scss/index.scss'
import './scss/toast.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import Modal from 'react-modal'
import App from './components/App'

Modal.setAppElement('#root')

ReactDOM.render(<App />, document.getElementById('root'))
