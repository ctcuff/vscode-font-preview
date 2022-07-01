class FontLoadError extends Error {
  constructor() {
    super("This font isn't supported by opentype")
    this.name = 'FontLoadError'
  }
}

export default FontLoadError
