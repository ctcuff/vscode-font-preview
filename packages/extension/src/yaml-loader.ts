import * as vscode from 'vscode'
import { PreviewSample } from '@font-preview/shared'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import Logger from './logger'
import { z, ZodError } from 'zod'
import { TypedWorkspaceConfiguration } from './types/overrides'
import YAMLValidationError from './yaml-validation-error'

const LOG_TAG = 'yaml-loader'
const logger = Logger.getInstance()

const schema = z.object({
  id: z.string(),
  paragraphs: z.string().array(),
  source: z.string().trim().optional(),
  rtl: z.boolean().optional()
})

const loadYamlFile = async (path: string): Promise<PreviewSample | null> => {
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
        logger.error(
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
      throw new YAMLValidationError(`Invalid YAML file: ${path}`)
    }

    logger.error('Error reading YML file', LOG_TAG, e)

    throw e
  }
}

const loadSampleTexts = async (): Promise<SampleTextLoadResult> => {
  const config = vscode.workspace.getConfiguration(
    'font-preview'
  ) as TypedWorkspaceConfiguration
  const sampleTextFilePaths = Array.from(new Set(config.get('sampleTextPaths')))

  logger.info(`Found ${sampleTextFilePaths.length} example files to load`)

  const promises = await Promise.allSettled(
    sampleTextFilePaths.map(filePath => loadYamlFile(filePath))
  )

  const sampleTexts = promises
    .filter(promise => promise.status === 'fulfilled' && promise.value)
    .map(promise => (promise as PromiseFulfilledResult<PreviewSample>).value)

  const errors = promises.filter(
    promise => promise.status === 'rejected'
  ) as PromiseRejectedResult[]

  return { sampleTexts, errors }
}

type SampleTextLoadResult = {
  sampleTexts: PreviewSample[]
  errors: PromiseRejectedResult[]
}

export { loadSampleTexts }
