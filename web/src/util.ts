import type { Table } from 'opentype.js'

/**
 * Takes an object of font variations and creates the `font-variation-settings`
 * CSS string. For example:
 * ```
 * createVariationCSS({ wght: 400, slnt: 0 }) === '"wght" 400, "slnt" 0'
 * ```
 */
const createVariationCSS = (variations: { [key: string]: number }): string => {
  return Object.entries(variations)
    .map(([variation, value]) => `"${variation}" ${value}`)
    .join(', ')
}

const getCSSVar = (cssVar: string, fallback = ''): string => {
  const computedStyle = getComputedStyle(document.documentElement)

  return (
    computedStyle.getPropertyValue(cssVar).trim() ||
    computedStyle.getPropertyValue(fallback).trim()
  )
}

const isTableEmpty = (table: Table): boolean => {
  if (!table) {
    return true
  }

  return Object.values(table)
    .filter(value => Array.isArray(value))
    .every(value => value.length === 0)
}

// Because the file content coming from the font-provider postMessage is already
// pretty large, we don't want to send another large string for the base64
// content. This means we have to do the conversion on the web extension side.
// https://gist.github.com/jonleighton/958841
const base64ArrayBuffer = (buffer: number[]): string => {
  let base64 = ''
  const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  const bytes = new Uint8Array(buffer)
  const byteLength = bytes.byteLength
  const byteRemainder = byteLength % 3
  const mainLength = byteLength - byteRemainder

  let a
  let b
  let c
  let d
  let chunk

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i += 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12 // 258048 = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6 // 4032 = (2^6 - 1) << 6
    d = chunk & 63 // 63 = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder === 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4 // 3 = 2^2 - 1

    base64 += `${encodings[a] + encodings[b]}==`
  } else if (byteRemainder === 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4 // 1008 = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2 // 15 = 2^4 - 1

    base64 += `${encodings[a] + encodings[b] + encodings[c]}=`
  }

  return base64
}

export { createVariationCSS, isTableEmpty, base64ArrayBuffer, getCSSVar }
