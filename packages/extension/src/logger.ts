import { window } from 'vscode';
import { LogLevel, BaseLogger, WorkspaceConfig, LogOptions } from '@font-preview/shared';

class Logger extends BaseLogger {
  public readonly outputChannel = window.createOutputChannel('Font Preview');
  private logLevel: LogLevel = LogLevel.INFO;

  public setOutputLevel(level: WorkspaceConfig['defaultLogLevel']): void {
    this.logLevel = this.configLevelToEnum(level);
  }

  private configLevelToEnum(level: WorkspaceConfig['defaultLogLevel']): LogLevel {
    switch (level) {
      case 'Debug':
        return LogLevel.DEBUG;
      case 'Info':
        return LogLevel.INFO;
      case 'Warn':
        return LogLevel.WARN;
      case 'Error':
        return LogLevel.ERROR;
      default:
        throw new Error(`Unexpected log level ${level}`);
    }
  }

  protected log({ level, tag, message, data }: LogOptions): void {
    if (level < this.logLevel) {
      return;
    }

    const time = new Date().toLocaleTimeString();

    // Will format messages as: [LEVEL - 12:00:00 AM] [TAG] message
    let logMessage = `[${LogLevel[level]} - ${time}] [${tag.trim()}] ${message.trim()}`;

    if (data && Object.keys(data).length > 0) {
      logMessage += ` ${JSON.stringify(data)}`;
    }

    this.outputChannel.appendLine(logMessage);
  }
}

export default Logger;
