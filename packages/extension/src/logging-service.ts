import { window } from 'vscode'
import { LogLevel, BaseLogger, WorkspaceConfig } from '@font-preview/shared'

class LoggingService extends BaseLogger {
  public readonly outputChannel = window.createOutputChannel('Font Preview')
  private logLevel: LogLevel = LogLevel.INFO

  public setOutputLevel(level: WorkspaceConfig['defaultLogLevel']): void {
    this.logLevel = this.configLevelToEnum(level)
  }

  private configLevelToEnum(level: WorkspaceConfig['defaultLogLevel']): LogLevel {
    switch (level) {
      case 'Debug':
        return LogLevel.DEBUG
      case 'Info':
        return LogLevel.INFO
      case 'Warn':
        return LogLevel.WARN
      case 'Error':
        return LogLevel.ERROR
      default:
        throw new Error(`Unexpected log level ${level}`)
    }
  }

  protected log(level: LogLevel, message: string, tag?: string): void {
    if (level < this.logLevel) {
      return
    }

    const time = new Date().toLocaleTimeString()
    // Will format messages as: [LEVEL - 12:00:00 AM] [Optional Tag] message
    this.outputChannel.appendLine(
      tag?.trim()
        ? `[${LogLevel[level]} - ${time}] [${tag.trim()}] ${message.trim()}`
        : `[${LogLevel[level]} - ${time}] ${message.trim()}`
    )
  }
}

export default LoggingService
