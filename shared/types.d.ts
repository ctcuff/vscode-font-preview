export interface WebviewMessage {
  type: string
  payload?: any
}

export interface Config {
  defaultTab: 'preview' | 'features' | 'glyphs' | 'waterfall' | 'licence'
}
