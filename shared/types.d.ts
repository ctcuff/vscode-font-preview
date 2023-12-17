import type { ColorThemeKind } from 'vscode'

/**
 * Font types that can be rendered by this extension.
 */
export type FontExtension = 'otf' | 'ttc' | 'ttf' | 'woff' | 'woff2'

/**
 * Represents settings taken from `Configuration` object in
 * package.json. The keys of this object should always match
 * the ID of the setting
 */
export type WorkspaceConfig = {
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
  /**
   * If enabled, VS Code will try to use a worker when loading the font.
   */
  useWorker: boolean
  /**
   * Show the glyph's width in the cell.
   */
  showGlyphWidth: boolean
  /**
   * Show the index of the glyph in the left corner of the cell.
   */
  showGlyphIndex: boolean
}

/**
 * Dispatched from the extension when the font has loaded
 */
export type FontLoadEvent = {
  type: 'FONT_LOADED'
  payload: {
    config: WorkspaceConfig
    fileSize: number
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
 * extension settings as a {@link WorkspaceConfig} object
 */
export type ConfigLoadEvent = {
  type: 'CONFIG_LOADED'
  payload: WorkspaceConfig
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

/**
 * Dispatched from the webview to start the loading notification that appears
 * in VS Code's status bar
 */
export type StartProgressNotificationEvent = {
  type: 'PROGRESS_START'
}

/**
 * Dispatched from the webview to dismiss the loading notification that appears
 * in VS Code's status bar
 */
export type StopProgressNotificationEvent = {
  type: 'PROGRESS_STOP'
}

export type WebviewMessage =
  | FontLoadEvent
  | ConfigLoadEvent
  | ErrorEvent
  | WarningEvent
  | InfoEvent
  | ConfigRequestEvent
  | ColorThemeChangeEvent
  | StartProgressNotificationEvent
  | StopProgressNotificationEvent
