import * as assert from 'assert'
import * as path from 'path'
import * as vscode from 'vscode'
import FontDocument from '../../font-document'

const fontsFolderPath = '../../../fonts'

suite('Custom font document', () => {
  vscode.window.showInformationMessage('Start all tests.')

  test('should be able to read a font file', async () => {
    const uri = vscode.Uri.file(
      path.join(__dirname, fontsFolderPath, 'Inter/static/Inter-Bold.ttf')
    )
    const document = new FontDocument(uri)
    const size = await document.size()
    const content = await document.read()

    assert.strictEqual(document.uri.toString(), uri.toString())
    assert.strictEqual(document.fileName, 'Inter-Bold')
    assert.strictEqual(document.extension, 'ttf')
    assert.strictEqual(size > 0, true)
    assert.strictEqual(content!.length > 0, true)
  })

  test('should fail on invalid font', async () => {
    const uri = vscode.Uri.file(
      path.join(__dirname, fontsFolderPath, fontsFolderPath, 'Invalid/BadFont.ttf')
    )
    const document = new FontDocument(uri)
    const content = await document.read()

    assert.strictEqual(content, null)
  })
})
