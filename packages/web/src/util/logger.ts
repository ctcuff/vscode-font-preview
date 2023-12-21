import { BaseLogger, LogLevel } from '@font-preview/shared'
import { TypedWebviewApi } from '../types'

class Logger extends BaseLogger {
  private static instance: Logger | null = null
  private readonly vscode: TypedWebviewApi
  // Setting this to info by default because this value isn't used on the webview side.
  // The log level is managed by the logging service on the extension side
  protected logLevel: LogLevel = LogLevel.INFO

  private constructor(vscode: TypedWebviewApi) {
    super()
    this.vscode = vscode
  }

  public static getInstance(vscode: TypedWebviewApi): Logger {
    if (!this.instance) {
      this.instance = new Logger(vscode)
    }

    return this.instance
  }

  protected log(level: LogLevel, message: string, tag?: string): void {
    this.vscode.postMessage({
      type: 'LOG',
      payload: {
        level,
        message,
        tag
      }
    })
  }
}

export default Logger
