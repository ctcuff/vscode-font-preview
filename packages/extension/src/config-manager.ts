import { workspace, WorkspaceConfiguration } from 'vscode';
import { WorkspaceConfig } from '@font-preview/shared';
import { EXTENSION_ID } from './util';
import Logger from './logger';

const LOG_TAG = 'ConfigManager';

interface TypedWorkspaceConfiguration extends WorkspaceConfiguration {
  get<T extends keyof WorkspaceConfig>(section: T): WorkspaceConfig[T] | undefined;
}

/**
 * A small wrapper around vscode's workspace config
 */
class ConfigManager {
  constructor(private logger: Logger) {}

  public getAll(): WorkspaceConfig {
    return {
      defaultTab: this.get('defaultTab')!,
      useWorker: this.get('useWorker')!,
      showGlyphWidth: this.get('showGlyphWidth')!,
      showGlyphIndex: this.get('showGlyphIndex')!,
      sampleTextPaths: this.get('sampleTextPaths')!,
      defaultLogLevel: this.get('defaultLogLevel')!,
      defaultSampleTextId: this.get('defaultSampleTextId')!,
      showSampleTextErrors: this.get('showSampleTextErrors')!,
      retainTabPosition: this.get('retainTabPosition')!
    };
  }

  public getWorkspaceConfiguration(): TypedWorkspaceConfiguration {
    return workspace.getConfiguration(EXTENSION_ID) as TypedWorkspaceConfiguration;
  }

  public get<T extends keyof WorkspaceConfig>(key: T): WorkspaceConfig[T] {
    const config = this.getWorkspaceConfiguration();
    return config.get(key)!;
  }

  public async set<T extends keyof WorkspaceConfig>(
    key: T,
    value: WorkspaceConfig[T]
  ): Promise<void> {
    try {
      const config = this.getWorkspaceConfiguration();
      await config.update(key, value);
    } catch (error) {
      this.logger.error({
        error,
        message: 'Error updating setting',
        data: { [key]: value },
        tag: LOG_TAG
      });
    }
  }
}

export default ConfigManager;
