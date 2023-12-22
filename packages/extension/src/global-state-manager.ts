import { PreviewTab } from '@font-preview/shared'
import { ExtensionContext } from 'vscode'
import LoggingService from './logging-service'

type State = {
  previewTab: PreviewTab
}

const LOG_TAG = 'GlobalState'

/**
 * A wrapper around the global state API that handles type casting and error handling
 */
class GlobalStateManager {
  constructor(
    private readonly context: ExtensionContext,
    private readonly logger: LoggingService
  ) {}

  public async update<T extends keyof State>(
    key: T,
    value: State[T] | undefined
  ): Promise<void> {
    try {
      await this.context.globalState.update(key, value)
    } catch (err) {
      this.logger.error('Error updating state', LOG_TAG, err)
    }
  }

  public get<T extends keyof State>(key: T, defaultValue: State[T]): State[T] {
    return this.context.globalState.get(key, defaultValue)
  }

  public keys(): ReadonlyArray<keyof State> {
    return this.context.globalState.keys() as ReadonlyArray<keyof State>
  }

  public async removeAll(): Promise<void> {
    for await (const key of this.keys()) {
      try {
        await this.update(key, undefined)
      } catch (err) {
        this.logger.error('Error resetting state', LOG_TAG, err)
      }
    }
  }
}

export default GlobalStateManager
