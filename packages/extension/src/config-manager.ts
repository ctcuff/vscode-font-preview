import { workspace, WorkspaceConfiguration } from 'vscode';
import { WorkspaceConfig } from '@font-preview/shared';
import { EXTENSION_ID } from './util';
import LoggingService from './logging-service';

const LOG_TAG = 'ConfigManager';

interface TypedWorkspaceConfiguration extends WorkspaceConfiguration {
  get<T extends keyof WorkspaceConfig>(section: T): WorkspaceConfig[T] | undefined;
}

/**
 * A small wrapper around vscode's workspace config
 */
class ConfigManager {
  private config: TypedWorkspaceConfiguration;

  constructor(private readonly logger: LoggingService) {
    this.config = workspace.getConfiguration(EXTENSION_ID) as TypedWorkspaceConfiguration;
  }

  public getAll(): WorkspaceConfig {
    return {
      defaultTab: this.config.get('defaultTab')!,
      useWorker: this.config.get('useWorker')!,
      showGlyphWidth: this.config.get('showGlyphWidth')!,
      showGlyphIndex: this.config.get('showGlyphIndex')!,
      sampleTextPaths: this.config.get('sampleTextPaths')!,
      defaultLogLevel: this.config.get('defaultLogLevel')!,
      defaultSampleTextId: this.config.get('defaultSampleTextId')!,
      showSampleTextErrors: this.config.get('showSampleTextErrors')!,
      retainTabPosition: this.config.get('retainTabPosition')!
    };
  }

  public get<T extends keyof WorkspaceConfig>(key: T): WorkspaceConfig[T] {
    return this.config.get(key)!;
  }

  public async set<T extends keyof WorkspaceConfig>(
    key: T,
    value: WorkspaceConfig[T]
  ): Promise<void> {
    try {
      await this.config.update(key, value);
    } catch (err) {
      this.logger.error(
        `Error updating setting ${JSON.stringify({ [key]: value })}`,
        LOG_TAG,
        err
      );
    }
  }
}

export default ConfigManager;
