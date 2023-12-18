import { performance } from 'perf_hooks'
import { window } from 'vscode'
import { LogLevel } from '../shared/types'

class Logger {
  private static instance: Logger | null = null
  private timers: Record<string, number> = {}
  private outputChannel = window.createOutputChannel('Font Preview')

  private constructor() {}

  public static getInstance(): Logger {
    if (!this.instance) {
      this.instance = new Logger()
    }

    return this.instance
  }

  public startTimer(id: string): void {
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
      }
      if (error?.stack) {
        this.log('ERROR', error.stack, tag)
      }
    } else {
      this.log('ERROR', message, tag)
    }
  }

  private log(level: LogLevel, message: string, tag?: string): void {
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
