import { BaseLogger, LogLevel } from '@font-preview/shared'
import { TypedWebviewApi } from '../types'

class Logger extends BaseLogger {
  private static instance: Logger | null = null
  private readonly vscode: TypedWebviewApi

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
