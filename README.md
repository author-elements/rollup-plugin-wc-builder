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

## Build Options

There are two possible build options:

**requiresBaseElement** | boolean (_true_ by default)

This will inject a warning into the web component code if the base class is required and not loaded/present at runtime. This almost never needs to be set, since all <author-&ast;> elements require the base element (except the base element itself).

```
import wcbuilder from '@author.io/rollup-plugin-wcbuilder'

export default {
	input: 'src/tag.js',
	plugins: [
		wcbuilder({
			requiresBaseElement: true  // (default)
		})
	],
	output: [
		{ file: 'myfile.cjs.js', format: 'cjs' },
		{ file: 'myfile.es.js', format: 'es' }
	]
}
```

**dependencies** | array

Sometimes custom elements are built with or upon other <author-&ast;> elements. These "nested" elements are considered dependencies, since they are required for the primary element to function correctly. Similar to the `requiresBaseElement` attribute above, `dependencies` will inject a warning/help message if one of the dependencies in the list is missing.

Take the `<author-select>` tag as an example. This is an advanced tag that uses `<author-option>`, `<author-options>`, `<author-optgroup>`, `<author-optgroup-label>` and `<author-selected-options>` under the hood. The build configuration for `<author-select>` may therefore look like:

```
import wcbuilder from '@author.io/rollup-plugin-wcbuilder'

export default {
	input: 'src/tag.js',
	plugins: [
		wcbuilder({
			dependencies: [
				'author-option',
				'author-options',
				'author-optgroup',
				'author-optgroup-label',
				'author-selected-options'
			]
		})
	],
	output: [
		{ file: 'myfile.cjs.js', format: 'cjs' },
		{ file: 'myfile.es.js', format: 'es' }
	]
}
```

If any of the dependencies are missing, an error will be thrown. A help message will also provide a URL where each missing dependency can be acquired.
