import type { ColorThemeKind } from 'vscode'

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
    fileName: string
    fileUrl: string
    /**
     * VSCode can't post a UIntArray or ArrayBuffer so the file content needs to
     * be transferred as an array of numbers. This field will *only* be populated
     * if the font being read is a WOFF2 file. This is because decompression happens
     * on the extension side rather than the webview side.
     */
    fileContent: number[]
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

export type InfoEvent = {
  type: 'INFO'
  payload: string
}

export type ConfigRequestEvent = {
  type: 'GET_CONFIG'
}

export type ColorThemeChangeEvent = {
  type: 'COLOR_THEME_CHANGE'
  payload: ColorThemeKind
}

export type WebviewMessage =
  | FontLoadEvent
  | ConfigLoadEvent
  | ErrorEvent
  | WarningEvent
  | InfoEvent
  | ConfigRequestEvent
  | ColorThemeChangeEvent
