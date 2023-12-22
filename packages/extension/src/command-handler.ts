import * as vscode from 'vscode'
import GlobalStateManager from './global-state-manager'
import LoggingService from './logging-service'

const LOG_TAG = 'CommandHandler'

type CommandReturnValue = (...args: any[]) => any

export default class CommandHandler {
  public constructor(
    private readonly logger: LoggingService,
    private readonly globalState: GlobalStateManager
  ) {}

  public registerAllCommands(): vscode.Disposable[] {
    const commandMap: Record<string, CommandReturnValue> = {
      'font-preview.createSampleYAMLFile': () => this.openTextEditorWithSampleYML(),
      'font-preview.debug.resetGlobalState': async () => await this.resetGlobalState()
    }

    const disposables: vscode.Disposable[] = []

    Object.entries(commandMap).forEach(([command, callback]) => {
      try {
        disposables.push(vscode.commands.registerCommand(command, callback))
      } catch (err) {
        this.logger.error(`Error registering command ${command}`, LOG_TAG, err)
      }
    })

    return disposables
  }

  public async openTextEditorWithSampleYML(): Promise<void> {
    const sampleYML = /* yml */ `
id: Sample
source: Example Source
rtl: false
paragraphs:
  - >-
    Minim ut voluptate sunt labore eu exercitation.
    Deserunt sint eiusmod in eu. Sit ullamco mollit mollit
    tempor nostrud anim ut anim quis veniam. Ullamco magna
    aliqua sint tempor do cillum non ullamco. Excepteur nisi
    occaecat ad exercitation proident veniam adipisicing aute
    dolore consectetur cillum Lorem tempor. Esse commodo enim
    incididunt aliquip. Aute enim ut adipisicing ad deserunt
    sint anim labore culpa.
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
}
