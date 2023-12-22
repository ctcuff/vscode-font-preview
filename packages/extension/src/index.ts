import * as vscode from 'vscode'
import CommandHandler from './command-handler'
import ConfigManager from './config-manager'
import FontProvider from './font-provider'
import GlobalStateManager from './global-state-manager'
import LoggingService from './logging-service'
import { EXTENSION_ID } from './util'

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const version = context.extension.packageJSON.version
  const id = context.extension.id
  const logger = new LoggingService()
  const configManager = new ConfigManager(logger)
  const globalState = new GlobalStateManager(context, logger)
  const commandHandler = new CommandHandler(context, logger, globalState)
  const fontProvider = new FontProvider(context, logger, globalState, configManager)

  logger.startTimer('activate')
  logger.setOutputLevel(configManager.get('defaultLogLevel'))

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration(`${EXTENSION_ID}.defaultLogLevel`)) {
        logger.setOutputLevel(configManager.get('defaultLogLevel'))
      }

      if (event.affectsConfiguration(`${EXTENSION_ID}.syncTabs`)) {
        globalState.update('previewTab', undefined)
      }
    })
  )

  logger.info(
    `Activated ${id} version ${version} in ${logger.endTimer('activate').toFixed(2)} ms`
  )

  commandHandler.registerAllCommands()
  fontProvider.register()
}

export function deactivate(): void {}
