import * as vscode from 'vscode';
import ConfigManager from './config-manager';
import GlobalStateManager from './global-state-manager';
import Logger from './logger';

const LOG_TAG = 'CommandHandler';

type CommandFunction = (...args: any[]) => Promise<any>;

export default class CommandHandler {
  public constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly logger: Logger,
    private readonly globalState: GlobalStateManager,
    private readonly workspaceConfig: ConfigManager
  ) {}

  public registerAllCommands(): void {
    const commandMap: Record<string, CommandFunction> = {
      'font-preview.createSampleYAMLFile': async () => this.openTextEditorWithSampleYML(),
      'font-preview.debug.resetGlobalState': async () => await this.resetGlobalState(),
      'font-preview.openSampleYAMLFile': async () => this.showSampleFileQuickPick()
    };

    for (const command in commandMap) {
      this.context.subscriptions.push(
        vscode.commands.registerCommand(command, commandMap[command])
      );
    }
  }

  public async openTextEditorWithSampleYML(): Promise<void> {
    const sampleYML = /* yml */ `
id: Sample
source: Example Source
rtl: false
paragraphs:
  - Hello, World!
`.trim();

    try {
      const document = await vscode.workspace.openTextDocument({
        language: 'yaml',
        content: sampleYML
      });

      await vscode.window.showTextDocument(document, {
        // Highlights the the text after "id:"
        selection: new vscode.Range(0, 4, 0, 10),
        preview: true
      });
    } catch (error) {
      vscode.window.showErrorMessage("Couldn't open text document");
      this.logger.error({
        error,
        message: 'Error opening YAML file',
        tag: LOG_TAG
      });
    }
  }

  public async resetGlobalState(): Promise<void> {
    await this.globalState.removeAll();
  }

  public async showSampleFileQuickPick(): Promise<void> {
    const sampleFiles = this.workspaceConfig.get('sampleTextPaths');

    try {
      const filePath = await vscode.window.showQuickPick(sampleFiles, {
        placeHolder: 'Path to sample YAML file'
      });

      if (!filePath) {
        this.logger.error({
          message: 'Undefined file path',
          data: { sampleFiles },
          tag: LOG_TAG
        });
        return;
      }

      await vscode.window.showTextDocument(vscode.Uri.file(filePath), {
        preview: false
      });
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error in showSampleFileQuickPick',
        tag: LOG_TAG
      });
      return;
    }
  }
}
