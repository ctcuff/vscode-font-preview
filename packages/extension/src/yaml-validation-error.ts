class YAMLValidationError extends Error {
  public readonly name = 'YAMLValidationError'

  constructor(message: string, public readonly filePath: string) {
    super(message)
  }
}

export default YAMLValidationError
