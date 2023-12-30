import type { ColorThemeKind } from 'vscode'

/**
 * Font types that can be rendered by this extension.
 */
export type FontExtension = 'otf' | 'ttc' | 'ttf' | 'woff' | 'woff2'

/**
 * Represents the different tabs of the webview
 */
export type PreviewTab =
  | 'Preview'
  | 'Features'
  | 'Glyphs'
  | 'Waterfall'
  | 'Type Yourself'
  | 'License'

/**
 * Represents settings taken from `Configuration` object in
 * package.json. The keys of this object should always match
 * the ID of the setting
 */
export type WorkspaceConfig = {
  /**
   * Controls the starting tab of the preview.
   */
  defaultTab: PreviewTab
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
  /**
   * A list of paths to custom example text files. Each file **must** be yaml file.
   */
  sampleTextPaths: string[]
  /**
   * The default logging level for the output window
   */
  defaultLogLevel: 'Debug' | 'Info' | 'Warn' | 'Error'
  /**
   * The ID of the sample text to load by default
   */
  defaultSampleTextId: string
  /**
   * If true, an error notification will be shown when a sample text file fails validation
   */
  showSampleTextErrors: boolean
  /**
   * If true, the newly opened font file will start on the same tab in
   * the webview as the previous active tab
   */
  retainTabPosition: boolean
}

// TODO: See if we can load the font before the webview requests it
/**
 * Dispatched from the webview in order to load the font
 */
export type RequestFontEvent = {
  type: 'GET_FONT'
}

export type FontLoadEvent = {
  /**
   * Dispatched from the extension when the font has loaded
   */
  type: 'FONT_LOADED'
  payload: {
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
    config: WorkspaceConfig
  }
}

export type ConfigRequestEvent = {
  /**
   * Dispatched from the webview to get the user settings for this extension
   */
  type: 'GET_CONFIG'
}

export type ConfigLoadEvent = {
  /**
   * Dispatched by the extension to the webview. Contains the current
   * extension settings as a {@link WorkspaceConfig} object
   */
  type: 'CONFIG_LOADED'
  payload: WorkspaceConfig
}

export type ColorThemeChangeEvent = {
  /**
   * Dispatched by the extension to the webview when the user changes
   * the color scheme of the editor
   */
  type: 'COLOR_THEME_CHANGE'
  payload: ColorThemeKind
}

export type ShowMessageEvent = {
  /**
   * Dispatched from the webview to show a message in vscode
   */
  type: 'SHOW_MESSAGE'
  payload: {
    messageType: 'ERROR' | 'WARNING' | 'INFO'
    message: string
  }
}

export type ToggleProgressNotificationEvent = {
  /**
   * Dispatched from the webview to show or dismiss the loading notification that appears
   * in VS Code's status bar
   */
  type: 'TOGGLE_PROGRESS'
  /**
   * True to show the loading indicator, false to hide it
   */
  payload: boolean
}

export type SampleTextRequestEvent = {
  /**
   * Sent from the webview to the extension to request the user-defined sample text.
   * The sample text was loaded once during extension activation
   */
  type: 'GET_SAMPLE_TEXT'
}

export type SampleTextLoadEvent = {
  /**
   * Sent from the extension to the webview so the webview can display the sample texts
   * that were loaded from the extension side
   */
  type: 'SAMPLE_TEXT_LOADED'
  payload: PreviewSample[]
}

export type LogEvent = {
  /**
   * Dispatched from the webview in order to log events to VS Code's output channel
   */
  type: 'LOG'
  payload: {
    level: LogLevel
    message: string
    tag?: string
  }
}

export type PreviewTabChangeEvent = {
  /**
   * Dispatched from the webview when the current tab changes
   */
  type: 'PREVIEW_TAB_CHANGE'
  payload: {
    tab: PreviewTab
    previousTab: PreviewTab
  }
}

/**
 * Represents an event that's either dispatched from the webview to the extension,
 * or, from the extension to the webview
 */
export type WebviewMessage =
  | RequestFontEvent
  | FontLoadEvent
  | ConfigLoadEvent
  | ConfigRequestEvent
  | ColorThemeChangeEvent
  | ToggleProgressNotificationEvent
  | LogEvent
  | SampleTextRequestEvent
  | SampleTextLoadEvent
  | ShowMessageEvent
  | PreviewTabChangeEvent

export enum LogLevel {
  DEBUG = 0,
  INFO,
  WARN,
  ERROR
}

/**
 * Represents the structure of the YAML file used to display preview text
 */
export type PreviewSample = {
  /**
   * The name of the sample
   */
  id: string
  /**
   * An array of strings to display. Each item will be displayed as a paragraph element
   */
  paragraphs: string[]
  /**
   * Where the sample text came from
   */
  source?: string
  /**
   * (Optional) `true` if this is sample is written right-to-left
   */
  rtl?: boolean
}
