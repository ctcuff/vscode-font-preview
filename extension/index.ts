import * as vscode from 'vscode'
import FontProvider from './font-provider'

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(FontProvider.register(context))
}

export function deactivate(): void {}
