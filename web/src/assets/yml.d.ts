declare module '*sample.yml' {
  const content: {
    /**
     * The name of the language
     */
    id: string
    /**
     * Where the sample text came from
     */
    source: string
    /**
     * An array of sample text
     */
    paragraphs: string[]
    /**
     * (Optional) `true` if this is language is written right-to-left
     */
    rtl?: boolean
  }

  export default content
}
