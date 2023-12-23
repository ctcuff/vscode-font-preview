import * as vscode from 'vscode'
import ConfigManager from './config-manager'
import GlobalStateManager from './global-state-manager'
import LoggingService from './logging-service'

const LOG_TAG = 'CommandHandler'

type CommandReturnValue = (...args: any[]) => any

export default class CommandHandler {
  public constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly logger: LoggingService,
    private readonly globalState: GlobalStateManager,
    private readonly workspaceConfig: ConfigManager
  ) {}

  public registerAllCommands(): void {
    const commandMap: Record<string, CommandReturnValue> = {
      'font-preview.createSampleYAMLFile': async () => this.openTextEditorWithSampleYML(),
      'font-preview.debug.resetGlobalState': async () => await this.resetGlobalState(),
      'font-preview.openSampleYAMLFile': async () => this.showSampleFileQuickPick()
    }

    for (const command in commandMap) {
      this.context.subscriptions.push(
        vscode.commands.registerCommand(command, commandMap[command])
      )
    }
  }

  public async openTextEditorWithSampleYML(): Promise<void> {
    const sampleYML = /* yml */ `
id: Sample
source: Example Source
rtl: false
paragraphs:
  - Hello, World!
`.trim()

    try {
      const document = await vscode.workspace.openTextDocument({
        language: 'yaml',
        content: sampleYML
      })

      await vscode.window.showTextDocument(document, {
        // Highlights the the text after "id:"
        selection: new vscode.Range(0, 4, 0, 10),
        preview: true
      })
    } catch (err) {
      vscode.window.showErrorMessage("Couldn't open text document")
      this.logger.error('Error opening YAML file ', LOG_TAG, err)
    }
  }

  public async resetGlobalState(): Promise<void> {
    await this.globalState.removeAll()
  }

  public async showSampleFileQuickPick(): Promise<void> {
    const sampleFiles = this.workspaceConfig.get('sampleTextPaths')
    const filePath = await vscode.window.showQuickPick(sampleFiles, {
      placeHolder: 'Path to sample YAML file'
    })

    if (!filePath) {
      return
    }

    try {
      await vscode.window.showTextDocument(vscode.Uri.file(filePath), {
        preview: false
      })
    } catch (err) {
      this.logger.error('Error opening file', LOG_TAG, err)
    }
  }
}
