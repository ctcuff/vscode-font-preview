import * as vscode from 'vscode'
import { PreviewSample } from '../shared/types'
import * as fs from 'fs'
import * as yaml from 'js-yaml'
import Logger from './logger'
import { ErrorMapCtx, z, ZodError, ZodErrorMap, ZodIssueOptionalMessage } from 'zod'
import { TypedWorkspaceConfiguration } from './types/overrides'
import YAMLValidationError from './yaml-validation-error'

const LOG_TAG = 'yaml-loader'
const logger = Logger.getInstance()

const errorMap = (
  issue: ZodIssueOptionalMessage,
  context: ErrorMapCtx
): ReturnType<ZodErrorMap> => {
  let message = context.defaultError

  if (issue.code === 'invalid_type') {
    message =
      `Error validating '${issue.path[0]}'. ` +
      `Expected ${issue.expected} but got ${issue.received} instead`
  }

  return { message }
}

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
    schema.parse(sample, { errorMap })
    return sample
  } catch (e) {
    if (e instanceof ZodError) {
      e.errors.forEach(error => {
        logger.error(
          'Error during YAML validation',
          LOG_TAG,
          JSON.stringify({ message: error.message, file: path }, null, 4)
        )
      })
      throw new YAMLValidationError(`Error validating YAML file: ${path}`)
    } else {
      logger.error('Error reading YML file', LOG_TAG, e)
    }
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
