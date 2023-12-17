/**
 * Takes an HTML file as a string and replaces any occurrence of
 * `{{ variable }}` with the value of `data[variable]`
 *
 * @param content The content of the HTML file
 * @param data Key value pairs. These must match the names of the variables in the HTML file
 * @returns The HTML file with all variables replaced
 */
const template = (content: string, data: Readonly<Record<string, string>>): string => {
  let html = content

  Object.entries(data).forEach(([key, value]) => {
    html = html.replace(`{{ ${key} }}`, `${value}`)
  })

  return html
}

export { template }
