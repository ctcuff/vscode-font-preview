/**
 * Takes an HTML file as a string and replaces any occurrence of
 * `{{ variable }}` with the value of `data[variable]`
 *
 * @param content The content of the HTML file
 * @param data Key value pairs. These must match the names of the variables in the HTML file
 * @returns The HTML file with all variables replaced
 */
function template(
  content: string,
  data: Readonly<{ [key: string]: string | number }>
): string {
  let template = content

  Object.entries(data).forEach(([key, value]) => {
    template = template.replace(`{{ ${key} }}`, `${value}`)
  })

  return template
}

export { template }
