export interface WebviewMessage {
  type: string
  payload?: any
}

export interface Config {
  defaultTab: 'features' | 'glyphs' | 'waterfall' | 'licence'
}
