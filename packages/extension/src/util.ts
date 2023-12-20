import { WorkspaceConfig } from '@font-preview/shared'
import { workspace } from 'vscode'
import Logger from './logger'
import { TypedWorkspaceConfiguration } from './types/overrides'

const logger = Logger.getInstance()
const LOG_TAG = 'util'

export type ValueOf<T> = T[keyof T]

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

export const getConfig = (): WorkspaceConfig => {
  const config = workspace.getConfiguration('font-preview') as TypedWorkspaceConfiguration

  return {
    defaultTab: config.get('defaultTab'),
    useWorker: config.get('useWorker'),
    showGlyphWidth: config.get('showGlyphWidth'),
    showGlyphIndex: config.get('showGlyphIndex'),
    sampleTextPaths: config.get('sampleTextPaths')
  }
}

export function updateConfigValue(
  key: keyof WorkspaceConfig,
  value: ValueOf<WorkspaceConfig>
): void {
  try {
    const config = workspace.getConfiguration(
      'font-preview'
    ) as TypedWorkspaceConfiguration
    config.update(key, value)
  } catch (err) {
    logger.error(`Error updating config, path: ${key}, value: ${value}`, LOG_TAG, err)
  }
}
