import * as vscode from 'vscode'
import CommandHandler from './command-handler'
import FontProvider from './font-provider'
import GlobalStateManager from './global-state-manager'
import LoggingService from './logging-service'
import { ConfigKeyMap, EXTENSION_ID, getConfig } from './util'

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const { defaultLogLevel } = getConfig()
  const logger = new LoggingService(defaultLogLevel)
  const globalState = new GlobalStateManager(context, logger)
  const commandHandler = new CommandHandler(logger, globalState)
  const fontProvider = new FontProvider(context, logger, globalState)
  const version = context.extension.packageJSON.version
  const id = context.extension.id

  logger.startTimer('activate')

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

  context.subscriptions.push(fontProvider.register())
  context.subscriptions.push(...commandHandler.registerAllCommands())
}

export function deactivate(): void {}
