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

    t.ok(generated.code.indexOf('if (!AuthorBaseElement)') >= 0, 'Base element detection exists.')

    t.end()
  })
  .catch(e => { console.log(e.message); console.log(e.stack); t.end() })
})


test('rollup-plugin-wcbuilder', t => {
  rollup({
    input: path.resolve('./test/data/tag.js'),
    plugins: [
      wcbuilder({
        requiresBaseElement: false
      })
    ]
  })
  .then(async bundle => {
    let generated = await bundle.generate({ format: 'cjs' })

    generated = generated.output ? generated.output[0] : generated

    t.ok(generated.code.indexOf('if (!AuthorBaseElement)') < 0, 'Base element detection does not exist.')

    t.end()
  })
  .catch(e => { console.log(e.message); console.log(e.stack); t.end() })
})

test('rollup-plugin-wcbuilder w/ dependencies', t => {
  rollup({
    input: path.resolve('./test/data/tag.js'),
    plugins: [
      wcbuilder({
        dependencies: [
          'author-test',
          'author-more-test'
        ]
      })
    ]
  })
  .then(async bundle => {
    let generated = await bundle.generate({ format: 'cjs' })

    generated = generated.output ? generated.output[0] : generated

    t.ok(generated.code.indexOf('let missingDependencies = Array.from(new Set([\'author-test\',\'author-more-test\']))') >= 0, 'Dependency check exists.')

    t.end()
  })
  .catch(e => { console.log(e.message); console.log(e.stack); t.end() })
})
