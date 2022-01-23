export interface WebviewMessage {
  type: string
  payload?: any
}

export interface Config {
  defaultTab:
    | 'Preview'
    | 'Features'
    | 'Glyphs'
    | 'Waterfall'
    | 'Type Yourself'
    | 'License'
}
