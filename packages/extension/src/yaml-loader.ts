import { PreviewSample } from '@font-preview/shared'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import LoggingService from './logging-service'
import { z, ZodError } from 'zod'
import YAMLValidationError from './yaml-validation-error'
import ConfigManager from './config-manager'

const LOG_TAG = 'YAMLLoader'

const schema = z.object({
  id: z.string(),
  paragraphs: z.string().array(),
  source: z.string().trim().optional(),
  rtl: z.boolean().optional()
})

class YAMLLoader {
  constructor(
    private readonly logger: LoggingService,
    private readonly workspaceConfig: ConfigManager
  ) {}

  public async loadSampleTextsFromConfig(): Promise<SampleTextLoadResult> {
    const sampleTextFilePaths = Array.from(
      new Set(this.workspaceConfig.get('sampleTextPaths'))
    )

    this.logger.info(`Found ${sampleTextFilePaths.length} example files to load`, LOG_TAG)

    const promises = await Promise.allSettled(
      sampleTextFilePaths.map(filePath => this.loadYamlFile(filePath))
    )

    const sampleTexts = promises
      .filter(promise => promise.status === 'fulfilled' && promise.value)
      .map(promise => (promise as PromiseFulfilledResult<PreviewSample>).value)

    const errors = promises.filter(
      promise => promise.status === 'rejected'
    ) as PromiseRejectedResult[]

    return { sampleTexts, errors }
  }

  private async loadYamlFile(path: string): Promise<PreviewSample | null> {
    try {
      const content = await fs.promises.readFile(path, { encoding: 'utf8' })
      const sample = yaml.load(content) as PreviewSample
      schema.parse(sample)
      return sample
    } catch (e) {
      // The errors in the catch statement are still thrown so that they can
      // propagate upwards and be handled by the calling function
      if (e instanceof ZodError) {
        e.errors.forEach(error => {
          this.logger.error(
            'Error during YAML validation',
            LOG_TAG,
            JSON.stringify(
              {
                parameter: error.path[0],
                message: error.message,
                file: path
              },
              null,
              4
            )
          )
        })
        throw new YAMLValidationError(`Invalid YAML file: ${path}`, path)
      }

      this.logger.error('Error reading YML file', LOG_TAG, e)

      throw e
    }
  }
}

type SampleTextLoadResult = {
  sampleTexts: PreviewSample[]
  errors: PromiseRejectedResult[]
}

export default YAMLLoader
