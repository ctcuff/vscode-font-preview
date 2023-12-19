import * as vscode from 'vscode'
import FontProvider from './font-provider'
import Logger from './logger'
import * as yamlLoader from './yaml-loader'
import YAMLValidationError from './yaml-validation-error'

const logger = Logger.getInstance()

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  logger.startTimer('activate')

  const version = context.extension.packageJSON.version
  const id = context.extension.id
  const { sampleTexts, errors } = await yamlLoader.loadSampleTexts()

  errors.forEach(error => {
    if (error.reason instanceof YAMLValidationError) {
      vscode.window.showErrorMessage(error.reason.message, 'Show Logs').then(action => {
        if (action) {
          logger.outputChannel.show()
        }
      })
    }
  })

  logger.info(
    `Activated ${id} version ${version} in ${logger.endTimer('activate').toFixed(2)} ms`
  )

  context.subscriptions.push(FontProvider.register(context, sampleTexts))
}

export function deactivate(): void {}
