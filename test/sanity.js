const test = require('tape').test
const { rollup } = require('rollup')
const wcbuilder = require('../dist/rollup-plugin-wcbuilder.cjs.js')
const path = require('path')

test('rollup-plugin-wcbuilder', t => {
  rollup({
    input: path.resolve('./test/data/tag.js'),
    plugins: [
      wcbuilder()
    ]
  })
  .then(async bundle => {
    let generated = await bundle.generate({ format: 'cjs' })

    generated = generated.output ? generated.output[0] : generated

    console.log(generated.code)

    t.end()
  })
  .catch(e => { console.log(e.message); console.log(e.stack); t.end() })
})
