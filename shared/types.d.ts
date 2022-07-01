export type FontExtension = 'otf' | 'ttc' | 'ttf' | 'woff' | 'woff2' | ''

export type Config = {
  defaultTab:
    | 'Preview'
    | 'Features'
    | 'Glyphs'
    | 'Waterfall'
    | 'Type Yourself'
    | 'License'
}

export type FontLoadEvent = {
  type: 'FONT_LOADED'
  payload: {
    fileExtension: FontExtension
    /**
     * VSCode can't post a UIntArray or ArrayBuffer so the file content needs to
     * be transferred as an array of numbers
     */
    fileContent: number[]
    fileName: string
  }
}

export type ConfigLoadEvent = {
  type: 'CONFIG_LOADED'
  payload: Config
}

export type ErrorEvent = {
  type: 'ERROR'
  payload: string
}

export type WarningEvent = {
  type: 'WARNING'
  payload: string
}

export type ConfigRequestEvent = {
  type: 'GET_CONFIG'
}

export type WebviewMessage =
  | FontLoadEvent
  | ConfigLoadEvent
  | ErrorEvent
  | WarningEvent
  | ConfigRequestEvent
