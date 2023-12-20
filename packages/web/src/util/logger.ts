import { LogLevel } from '@font-preview/shared'
import { TypedWebviewApi } from '../types'

class Logger {
  private static instance: Logger | null = null
  private readonly vscode: TypedWebviewApi
  private timers: Record<string, number> = {}

  private constructor(vscode: TypedWebviewApi) {
    this.vscode = vscode
  }

  public static getInstance(vscode: TypedWebviewApi): Logger {
    if (!this.instance) {
      this.instance = new Logger(vscode)
    }

    return this.instance
  }

  public startTimer(id: string): void {
    if (this.timers[id]) {
      this.warn(`Timer with ID ${id} was already set`)
    }
    this.timers[id] = performance.now()
  }

  public endTimer(id: string): number {
    if (!this.timers[id]) {
      this.warn(`No timer with ID ${id} was found`)
      return 0
    }

    if (this.timers[id] === 0) {
      this.warn('Did you forget to call logger.startTimer()?')
      return 0
    }

    const totalTime = performance.now() - this.timers[id]
    delete this.timers[id]

    return totalTime
  }

  public debug(message: string, tag?: string): void {
    this.log('DEBUG', message, tag)
  }

  public info(message: string, tag?: string): void {
    this.log('INFO', message, tag)
  }

  public warn(message: string, tag?: string): void {
    this.log('WARN', message, tag)
  }

  public error(message: string, tag?: string, error?: unknown): void {
    if (error instanceof Error) {
      if (error?.message) {
        this.log('ERROR', `${message} ${error.message}`, tag)
      } else if (error?.stack) {
        this.log('ERROR', error.stack, tag)
      }
    } else if (error) {
      this.log('ERROR', `${message} ${error}`, tag)
    } else {
      this.log('ERROR', message, tag)
    }
  }

  private log(level: LogLevel, message: string, tag?: string): void {
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
