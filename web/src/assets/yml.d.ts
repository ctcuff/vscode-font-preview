declare module '*sample.yml' {
  const content: {
    id: string
    source: string
    paragraphs: string[]
    rtl?: boolean
  }

  export default content
}
