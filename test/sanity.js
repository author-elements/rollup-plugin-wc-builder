const test = require('tape').test
const { rollup } = require('rollup')
const wcbuilder = require('../dist/rollup-plugin-wc-builder.cjs.js')
const path = require('path')

test('rollup-plugin-wc-builder', t => {
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
  .catch(e => { console.log(e.message); t.end() })
})

// async function getCodeFromBundle(bundle, customOptions = {}) {
// 	const options = Object.assign({ format: 'cjs' }, customOptions);
// 	return getOutputFromGenerated(bundle.generate(options)).code;
// }
//
// const getOutputFromGenerated = generated => (generated.output ? generated.output[0] : generated)
