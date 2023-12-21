import { workspace, window, Range } from 'vscode'
import LoggingService from './logging-service'

const LOG_TAG = 'CommandHandler'

export const Commands = {
  createSampleYAMLFile: 'font-preview.createSampleYAMLFile'
}

export default class CommandHandler {
  public constructor(private readonly logger: LoggingService) {}

  public async openTextEditorWithSampleYML(): Promise<void> {
    this.logger.debug(`Executing command: ${Commands.createSampleYAMLFile}`, LOG_TAG)

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
      const document = await workspace.openTextDocument({
        language: 'yaml',
        content: sampleYML
      })

      await window.showTextDocument(document, {
        // Highlights the the text after id:
        selection: new Range(0, 4, 0, 10),
        preview: true
      })
    } catch (err) {
      window.showErrorMessage("Couldn't open text document")
      this.logger.error('Error opening text document', LOG_TAG, err)
    }
  }
}
