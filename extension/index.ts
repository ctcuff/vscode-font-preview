import * as vscode from 'vscode'
import FontProvider from './font-provider'
import Logger from './logger'

export function activate(context: vscode.ExtensionContext): void {
  const version = context.extension.packageJSON.version
  const id = context.extension.id

  Logger.getInstance().info(`Activated ${id} version ${version}`)
  context.subscriptions.push(FontProvider.register(context))
}

export function deactivate(): void {}
