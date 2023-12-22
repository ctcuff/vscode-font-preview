import { LogLevel } from './types'

/**
 * A logger shared between the extension and the webview. The extension's implementation
 * handles outputting the logs to the extension's task window, while the webview's
 * implementation handles sending messages via `vscode.postMessage`
 */
export abstract class BaseLogger {
  private timers: Record<string, number> = {}

  protected abstract log(level: LogLevel, message: string, tag?: string): void

  /**
   * Starts a timer using the `performance` module.
   * The timer is saved in a map under the provided id
   * @param id The id used to store this timer (must be unique)
   */
  public startTimer(id: string): void {
    if (this.timers[id]) {
      this.warn(`Timer with ID ${id} was already set`)
    }
    this.timers[id] = performance.now()
  }

  /**
   * End a timer previously set by {@link startTimer}
   *
   * @param id The id of the timer to end (must be unique)
   * @returns The total duration in milliseconds
   */
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
    this.log(LogLevel.DEBUG, message, tag)
  }

  public info(message: string, tag?: string): void {
    this.log(LogLevel.INFO, message, tag)
  }

  public warn(message: string, tag?: string): void {
    this.log(LogLevel.WARN, message, tag)
  }

  public error(message: string, tag?: string, error?: unknown): void {
    if (error instanceof Error) {
      if (error?.message) {
        this.log(LogLevel.ERROR, `${message} ${error.message}`, tag)
      } else if (error?.stack) {
        this.log(LogLevel.ERROR, error.stack, tag)
      }
    } else if (error) {
      this.log(LogLevel.ERROR, `${message} ${error}`, tag)
    } else {
      this.log(LogLevel.ERROR, message, tag)
    }
  }
}
