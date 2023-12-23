import { workspace, WorkspaceConfiguration } from 'vscode'
import { WorkspaceConfig } from '@font-preview/shared'
import { EXTENSION_ID } from './util'
import LoggingService from './logging-service'

const LOG_TAG = 'ConfigManager'

interface TypedWorkspaceConfiguration extends WorkspaceConfiguration {
  get<T extends keyof WorkspaceConfig>(section: T): WorkspaceConfig[T] | undefined
}

/**
 * A small wrapper around vscode's workspace config
 */
class ConfigManager {
  constructor(private readonly logger: LoggingService) {}

  public all(): WorkspaceConfig {
    const config = workspace.getConfiguration(EXTENSION_ID) as TypedWorkspaceConfiguration

    return {
      defaultTab: config.get('defaultTab')!,
      useWorker: config.get('useWorker')!,
      showGlyphWidth: config.get('showGlyphWidth')!,
      showGlyphIndex: config.get('showGlyphIndex')!,
      sampleTextPaths: config.get('sampleTextPaths')!,
      defaultLogLevel: config.get('defaultLogLevel')!,
      defaultSampleTextId: config.get('defaultSampleTextId')!,
      showSampleTextErrors: config.get('showSampleTextErrors')!,
      retainTabPosition: config.get('retainTabPosition')!
    }
  }

  public get<T extends keyof WorkspaceConfig>(key: T): WorkspaceConfig[T] {
    return this.all()[key]
  }

  public async set<T extends keyof WorkspaceConfig>(
    key: T,
    value: WorkspaceConfig[T]
  ): Promise<void> {
    try {
      const config = workspace.getConfiguration(EXTENSION_ID)
      await config.update(key, value)
    } catch (err) {
      this.logger.error(
        `Error updating setting ${JSON.stringify({ [key]: value })}`,
        LOG_TAG,
        err
      )
    }
  }
}

export default ConfigManager
