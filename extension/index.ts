import * as vscode from 'vscode'
import FontProvider from './font-provider'
import Logger from './logger'

const logger = Logger.getInstance()

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  logger.startTimer('activate')

  const version = context.extension.packageJSON.version
  const id = context.extension.id

  logger.info(
    `Activated ${id} version ${version} in ${logger.endTimer('activate').toFixed(2)} ms`
  )

  context.subscriptions.push(FontProvider.register(context))
}

export function deactivate(): void {}
