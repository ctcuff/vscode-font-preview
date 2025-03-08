import * as vscode from 'vscode'
import CommandHandler from './command-handler'
import ConfigManager from './config-manager'
import FontProvider from './font-provider'
import GlobalStateManager from './global-state-manager'
import LoggingService from './logging-service'
import { EXTENSION_ID } from './util'
import { WorkspaceConfig } from '@font-preview/shared'

const getConfigName = (name: keyof WorkspaceConfig): string => `${EXTENSION_ID}.${name}`

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const version = context.extension.packageJSON.version
  const id = context.extension.id
  const logger = new LoggingService()
  const configManager = new ConfigManager(logger)
  const globalState = new GlobalStateManager(context, logger)
  const commandHandler = new CommandHandler(context, logger, globalState, configManager)
  const fontProvider = new FontProvider(context, logger, globalState, configManager)

  logger.startTimer('activate')
  logger.setOutputLevel(configManager.get('defaultLogLevel'))
  logger.setEnabled(configManager.get('enableLogging'))

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (event.affectsConfiguration(getConfigName('defaultLogLevel'))) {
        logger.setOutputLevel(configManager.get('defaultLogLevel'))
      }

      if (event.affectsConfiguration(getConfigName('enableLogging'))) {
        logger.setEnabled(configManager.get('enableLogging'))
      }

      if (event.affectsConfiguration(getConfigName('retainTabPosition'))) {
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
