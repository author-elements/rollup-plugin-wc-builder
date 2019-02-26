# rollup-plugin-wcbuilder

`npm install @author.io/rollup-plugin-wcbbuilder`

This rollup plugin will build an `<author-element>` custom element, outputting a single JavaScript module.

An example `rollup.config.js` file might look like this:

```
import wcbuilder from '@author.io/rollup-plugin-wcbuilder'

export default {
	input: 'src/tag.js',
	plugins: [ wcbuilder() ],
	output: [
		{ file: 'myfile.cjs.js', format: 'cjs' },
		{ file: 'myfile.es.js', format: 'es' }
	]
}
```
