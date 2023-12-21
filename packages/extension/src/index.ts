import * as vscode from 'vscode'
import FontProvider from './font-provider'
import LoggingService from './logging-service'
import { ConfigKeyMap, EXTENSION_ID, getConfig } from './util'

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const { defaultLogLevel } = getConfig()
  const logger = new LoggingService(defaultLogLevel)

  logger.startTimer('activate')

  const version = context.extension.packageJSON.version
  const id = context.extension.id

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration(`${EXTENSION_ID}.${ConfigKeyMap.defaultLogLevel}`)) {
        const { defaultLogLevel } = getConfig()
        logger.setOutputLevel(defaultLogLevel)
      }
    })
  )

  logger.info(
    `Activated ${id} version ${version} in ${logger.endTimer('activate').toFixed(2)} ms`
  )

  context.subscriptions.push(FontProvider.register(context, logger))
}

export function deactivate(): void {}
