/* eslint-disable */
import { base64ArrayBuffer } from './util'

self.onmessage = (message: MessageEvent<ArrayBuffer>) => {
  self.postMessage(base64ArrayBuffer(message.data))
}
