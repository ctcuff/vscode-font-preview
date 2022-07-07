/* eslint-disable */
import { base64ArrayBuffer } from './util'

self.onmessage = ({ data }: MessageEvent<ArrayBuffer>) => {
  self.postMessage(base64ArrayBuffer(data))
}
