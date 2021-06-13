export type FontExtension = 'ttf' | 'otf' | 'woff' | ''

export type GlobalSavedState = {
  base64Content: string
  fileContent: number[]
  fontExtension: FontExtension
}
