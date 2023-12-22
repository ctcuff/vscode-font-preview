import { WorkspaceConfig } from '@font-preview/shared'
import { workspace } from 'vscode'
import { TypedWorkspaceConfiguration } from './types/overrides'

export const EXTENSION_ID = 'font-preview'

/**
 * Takes an HTML file as a string and replaces any occurrence of
 * `{{ variable }}` with the value of `data[variable]`
 *
 * @param content The content of the HTML file
 * @param data Key value pairs. These must match the names of the variables in the HTML file
 * @returns The HTML file with all variables replaced
 */
export const template = (content: string, data: Record<string, string>): string => {
  let html = content

  Object.entries(data).forEach(([key, value]) => {
    html = html.replace(`{{ ${key} }}`, `${value}`)
  })

  return html
}

export const ConfigKeyMap: Readonly<
  Record<keyof WorkspaceConfig, keyof WorkspaceConfig>
> = {
  defaultTab: 'defaultTab',
  useWorker: 'useWorker',
  showGlyphWidth: 'showGlyphWidth',
  showGlyphIndex: 'showGlyphIndex',
  sampleTextPaths: 'sampleTextPaths',
  defaultLogLevel: 'defaultLogLevel',
  defaultSampleTextId: 'defaultSampleTextId',
  showSampleTextErrors: 'showSampleTextErrors',
  syncTabs: 'syncTabs'
}

export const getConfig = (): WorkspaceConfig => {
  const config = workspace.getConfiguration(EXTENSION_ID) as TypedWorkspaceConfiguration

  return {
    defaultTab: config.get('defaultTab'),
    useWorker: config.get('useWorker'),
    showGlyphWidth: config.get('showGlyphWidth'),
    showGlyphIndex: config.get('showGlyphIndex'),
    sampleTextPaths: config.get('sampleTextPaths'),
    defaultLogLevel: config.get('defaultLogLevel'),
    defaultSampleTextId: config.get('defaultSampleTextId'),
    showSampleTextErrors: config.get('showSampleTextErrors'),
    syncTabs: config.get('syncTabs')
  }
}

export function updateConfigValue<T extends keyof WorkspaceConfig>(
  key: T,
  value: WorkspaceConfig[T]
): Thenable<void> {
  const config = workspace.getConfiguration(EXTENSION_ID) as TypedWorkspaceConfiguration
  return config.update(key, value)
}
