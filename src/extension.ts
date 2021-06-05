import * as vscode from 'vscode'
import * as path from 'path'
import html from './index.html'

/**
 * Takes an HTML file as a string and replaces any occurrence of
 * `{{ variable }}` with the value of `data[variable]`
 *
 * @param content The content of the HTML file
 * @param data Key value pairs. These must match the names of the variables in the HTML file
 * @returns The HTML file with all variables replaced
 */
function template(
  content: string,
  data: Readonly<{ [key: string]: string | number }>
): string {
  let template = content

  Object.entries(data).forEach(([key, value]) => {
    template = template.replace(`{{ ${key} }}`, `${value}`)
  })

  return template
}

function getWebviewContent(context: vscode.ExtensionContext): string {
  const webDistPath = vscode.Uri.file(
    path.join(context.extensionPath, 'web-dist', 'index.js')
  )

  const reactAppUri = webDistPath.with({ scheme: 'vscode-resource' }).toString()

  return template(html, { reactAppUri })
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  context.subscriptions.push(
    vscode.commands.registerCommand('font-preview.open', () => {
      const panel = vscode.window.createWebviewPanel(
        'fontPreview',
        'Font Preview',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, 'web-dist'))
          ]
        }
      )

      panel.webview.html = getWebviewContent(context)
    })
  )
}

export function deactivate(): void {}
