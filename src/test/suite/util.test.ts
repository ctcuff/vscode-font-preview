import * as assert from 'assert'
import * as util from '../../util'

suite('Util', () => {
  test('template should replace all variables', () => {
    let html = '<script src="{{ src }}"><script>'
    let expected = '<script src="index.js"><script>'
    let content = util.template(html, { src: 'index.js' })

    assert.strictEqual(content, expected)

    html = '<script src="{{src}}"><script>'
    expected = html
    content = util.template(html, { src: 'index.js' })

    assert.strictEqual(content, expected)
  })
})
