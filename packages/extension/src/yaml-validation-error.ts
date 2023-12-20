class YAMLValidationError extends Error {
  public filePath: string
  public name = 'YAMLValidationError'

  constructor(message: string, filePath: string) {
    super(message)
    this.filePath = filePath
  }
}

export default YAMLValidationError
