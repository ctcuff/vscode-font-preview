import { PreviewSample } from '@font-preview/shared';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import Logger from './logger';
import { z, ZodError } from 'zod';
import YAMLValidationError from './yaml-validation-error';
import ConfigManager from './config-manager';

const LOG_TAG = 'YAMLLoader';

const schema = z.object({
  id: z.string(),
  paragraphs: z.string().array(),
  source: z.string().trim().optional(),
  rtl: z.boolean().optional()
});

class YAMLLoader {
  constructor(
    private readonly logger: Logger,
    private readonly workspaceConfig: ConfigManager
  ) {}

  public async loadSampleTextsFromConfig(): Promise<SampleTextLoadResult> {
    const sampleTextFilePaths = Array.from(
      new Set(this.workspaceConfig.get('sampleTextPaths'))
    );

    const promises = await Promise.allSettled(
      sampleTextFilePaths.map(filePath => this.loadYamlFile(filePath))
    );

    const sampleTexts = promises
      .filter(promise => promise.status === 'fulfilled' && promise.value)
      .map(promise => (promise as PromiseFulfilledResult<PreviewSample>).value);

    const errors = promises.filter(
      promise => promise.status === 'rejected'
    ) as PromiseRejectedResult[];

    return { sampleTexts, errors };
  }

  private async loadYamlFile(path: string): Promise<PreviewSample | null> {
    try {
      const content = await fs.promises.readFile(path, { encoding: 'utf8' });
      const sample = yaml.load(content) as PreviewSample;
      schema.parse(sample);
      return sample;
    } catch (error) {
      // The errors in the catch statement are still thrown so that they can
      // propagate upwards and be handled by the calling function
      if (error instanceof ZodError) {
        error.errors.forEach(error => {
          this.logger.error({
            message: 'Error during YAML validation',
            tag: LOG_TAG,
            data: {
              parameter: error.path[0],
              message: error.message,
              file: path
            }
          });
        });
        throw new YAMLValidationError(`Invalid YAML file: ${path}`, path);
      }

      this.logger.error({
        message: 'Error reading YML file',
        tag: LOG_TAG,
        error
      });

      throw error;
    }
  }
}

type SampleTextLoadResult = {
  sampleTexts: PreviewSample[];
  errors: PromiseRejectedResult[];
};

export default YAMLLoader;
