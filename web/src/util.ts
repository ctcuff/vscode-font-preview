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

const isTableEmpty = (table: Table): boolean => {
  if (!table) {
    return true
  }

  return Object.values(table)
    .filter(value => Array.isArray(value))
    .every(value => value.length === 0)
}

export { createVariationCSS, isTableEmpty }
