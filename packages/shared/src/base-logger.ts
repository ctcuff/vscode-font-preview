import { LogLevel } from './types';

export type LogOptions = {
  level: LogLevel;
  message: string;
  tag: string;
  error?: unknown;
  data?: Record<string, unknown>;
};

/**
 * A logger shared between the extension and the webview. The extension's implementation
 * handles outputting the logs to the extension's task window, while the webview's
 * implementation handles sending messages via `vscode.postMessage`
 */
export abstract class BaseLogger {
  private readonly timers: Record<string, number> = {};

  protected abstract log(opts: LogOptions): void;

  /**
   * Starts a timer using the `performance` module.
   * The timer is saved in a map under the provided id
   * @param id The id used to store this timer (must be unique)
   */
  public startTimer(id: string): void {
    if (this.timers[id]) {
      this.warn({
        tag: 'startTimer',
        message: `Timer with ID ${id} was already set`
      });
    }
    this.timers[id] = performance.now();
  }

  /**
   * End a timer previously set by {@link startTimer}
   *
   * @param id The id of the timer to end (must be unique)
   * @returns The total duration in milliseconds
   */
  public endTimer(id: string): number {
    if (!this.timers[id]) {
      this.warn({
        tag: 'endTimer',
        message: `No timer with ID ${id} was found`
      });
      return 0;
    }

    if (this.timers[id] === 0) {
      this.warn({
        tag: 'endTimer',
        message: 'Did you forget to call startTimer()?'
      });
      return 0;
    }

    const totalTime = performance.now() - this.timers[id];
    delete this.timers[id];

    return totalTime;
  }

  public debug(opts: Omit<LogOptions, 'level'>): void {
    this.log({
      ...opts,
      level: LogLevel.DEBUG
    });
  }

  public info(opts: Omit<LogOptions, 'level'>): void {
    this.log({
      ...opts,
      level: LogLevel.INFO
    });
  }

  public warn(opts: Omit<LogOptions, 'level'>): void {
    this.log({
      ...opts,
      level: LogLevel.WARN
    });
  }

  public error(opts: Omit<LogOptions, 'level'>): void {
    const error = this.serializeError(opts.error);

    this.log({
      ...opts,
      level: LogLevel.ERROR,
      data: {
        ...opts.data,
        ...(error ? { error } : {})
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public serializeError(error?: any): string {
    if (!error) {
      return '';
    }

    if (error instanceof Error) {
      if (error.message) {
        return error.message;
      }

      if (error.stack) {
        return error.stack;
      }
    }

    try {
      return error?.toString() || '';
    } catch {
      return `${error}`;
    }
  }
}
