// Tells TypeScript that HTML files are imported as a string
declare module '*.html' {
  const content: string
  export default content
}
