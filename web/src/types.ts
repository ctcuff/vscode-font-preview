export type FontExtension = 'otf' | 'ttc' | 'ttf' | 'woff' | 'woff2' | ''

export type GlobalSavedState = {
  base64Content: string
  fileContent: number[]
  fontExtension: FontExtension
  fileName: string
}
