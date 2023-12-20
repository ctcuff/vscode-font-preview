declare module '*sample.yml' {
  const content: {
    /**
     * The name of the sample
     */
    id: string
    /**
     * Where the sample came from
     */
    source?: string
    /**
     * An array of strings to display. Each item will be displayed as a paragraph element
     */
    paragraphs: string[]
    /**
     * (Optional) `true` if this is sample is written right-to-left
     */
    rtl?: boolean
  }

  export default content
}
