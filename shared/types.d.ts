import type { ColorThemeKind } from 'vscode'

/**
 * Font types that can be rendered by this extension.
 */
export type FontExtension = 'otf' | 'ttc' | 'ttf' | 'woff' | 'woff2'

/**
 * Represents settings taken from `Configuration` object in
 * package.json
 */
export type Config = {
  /**
   * Controls the starting tab of the preview.
   */
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
    /**
     * The URL of the file to be parsed. This should be in the form:
     * https://file+.vscode-resource.vscode-cdn.net/path/to/font.ttf
     * This allows the webview to make a request to retrieve the file
     * contents using `fetch`
     */
    fileUrl: string
    /**
     * VS Code can't post a UIntArray or ArrayBuffer so the file content needs to
     * be transferred as an array of numbers. This field will *only* be populated
     * if the font being read is a WOFF2 file. This is because decompression happens
     * on the extension side rather than the webview side. In all other cases, this
     * will just be an empty array
     */
    fileContent: number[]
  }
}

/**
 * Dispatched from the webview to get the user settings for this extension
 */
 export type ConfigRequestEvent = {
  type: 'GET_CONFIG'
}

/**
 * Dispatched by the extension to the webview. Contains the current
 * extension settings as a {@link Config} object
 */
export type ConfigLoadEvent = {
  type: 'CONFIG_LOADED'
  payload: Config
}

/**
 * Dispatched through the webview to display an error notification
 * in VS Code
 */
export type ErrorEvent = {
  type: 'ERROR'
  payload: string
}
/**
 * Dispatched through the webview to display a error warning
 * in VS Code
 */
export type WarningEvent = {
  type: 'WARNING'
  payload: string
}

/**
 * Dispatched through the webview to display an info notification
 * in VS Code
 */
export type InfoEvent = {
  type: 'INFO'
  payload: string
}

/**
 * Dispatched by the extension to the webview when the user changes
 * the color scheme of the editor
 */
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
