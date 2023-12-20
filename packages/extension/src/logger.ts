import { window } from 'vscode'
import { LogLevel, BaseLogger } from '@font-preview/shared'

class Logger extends BaseLogger {
  private static instance: Logger | null = null
  public readonly outputChannel = window.createOutputChannel('Font Preview')

  public static getInstance(): Logger {
    if (!this.instance) {
      this.instance = new Logger()
    }

    return this.instance
  }

  protected log(level: LogLevel, message: string, tag?: string): void {
    const time = new Date().toLocaleTimeString()
    // Will format messages as: [LEVEL - 12:00:00 AM] [Optional Tag] message
    this.outputChannel.appendLine(
      tag?.trim()
        ? `[${level} - ${time}] [${tag.trim()}] ${message.trim()}`
        : `[${level} - ${time}] ${message.trim()}`
    )
  }
}

export default Logger
