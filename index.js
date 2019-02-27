// rollup-plugin-wc-bulder
import { createFilter } from 'rollup-pluginutils'
const MagicString = require('magic-string')
const fs = require('fs')
const path = require('path')
const postcss = require('postcss')
const cleanCSS = new (require('clean-css'))()
const minifyHTML = require('html-minifier').minify
const localPkg = require(path.join(process.cwd(), 'package.json'))

export default function wcbuilder (options = {}) {
  const filter = createFilter(options.include, options.exclude)

  if (!localPkg.hasOwnProperty('repository')) {
    throw new Error(`The local package.json must have a repository attribute with a url sub-attribute, such as:\n${JSON.stringify({
      repository: {
        type: 'git',
        url: 'git+https://github.com/owner/repo.git'
      }
    }, null, 2)}\n`)
  }

  const build = {
    css: null,
    js: null,
    template: null,
    tagName: null,

    processCSS (filepath) {
      build.css = postcss.parse(fs.readFileSync(path.join(path.dirname(filepath), 'style.css')).toString())

      let newRules = []

      build.css.walkRules(rule => newRules.push(
        rule.clone({
          selector: build.transformSelector(rule.selector)
        })
      ))

      build.css.append(newRules)
      build.css = cleanCSS.minify(build.css.toString()).styles
    },

    processJS (code) {
      build.js = code

      let regex = /customElements\.define\([\'|\"](.*)[\'|\"]\,/i
      let tagName = regex.exec(build.js)

      if (tagName === null) {
        console.error('ERROR: tag.js must include a Custom Element Definition as follows:')
        console.info(`customElements.define('tag-name', ClassIdentifier)`)
        return console.error('Aborting...')
      }

      tagName = tagName[1]

      if (!tagName || !tagName.includes('-')) {
        return console.error(`ERROR: Custom element must have a tag name with at least one hyphen! Aborting...`)
      }

      build.tagName = tagName
    },

    processTemplate (filepath) {
      build.template = fs.readFileSync(path.join(path.dirname(filepath), 'template.html')).toString()
    },

    transformSelector (selector) {
      if (!this.tagName) {
        return console.error(`ERROR ${this.filename}: Valid tag name not found. Aborting...`)
      }

      let regex = {
        host: /\:host\((.*?)\)\s?/i,
        hostContext: /\:host-context\((.*?)\)\s?/i,
        slotted: /\:{2}slotted\((.*?)\)\s?/i
      }

      // STEP 1: Replace :host() instances
      let result = regex.host.exec(selector)
      selector = result === null ? selector : selector.replace(result[0].trim(), `${this.tagName}${result[1]}`)

      // STEP 2: Replace host-context() instances
      result = regex.hostContext.exec(selector)
      selector = result === null ? selector : selector.replace(result[0].trim(), `${result[1]} ${this.tagName}`)

      // STEP 3: Replace ::slotted() instances
      result = regex.slotted.exec(selector)
      selector = result === null ? selector : selector.replace(result[0].trim(), `${result[1]}`)

      // STEP 4: Replace remaining :host instances
      return selector.replace(/\:host/gi, this.tagName)
    }
  }

  return {
    name: 'wcbuilder',
    transform (code, filepath) {
      if (!filter(filepath)) {
        return null
      }

      const magicString = new MagicString(code)

      // Process Files
      build.processJS(code)
      build.processCSS(filepath)
      build.processTemplate(filepath)

      // Provide a base element check in each webcomponent file.
      options.requiresBaseElement = options.hasOwnProperty('requiresBaseElement') ? options.requiresBaseElement : true

      if (options.hasOwnProperty('dependencies')) {
        let dependencyCheck = `(function () {
          let missingDependencies = Array.from(new Set([${options.dependencies.map(dep => '\'' + dep + '\'')}])).filter(dep => !customElements.get(dep))
          if (missingDependencies.length > 0) {
            console.error(\`[ERROR] <${build.tagName}> Required dependenc\${missingDependencies.length !== 1 ? 'ies' : 'y'} not found: \${missingDependencies.map(d => \`<\${d}>\`).join(', ').replace(', ' + missingDependencies[missingDependencies.length - 1], ' and ' + missingDependencies[missingDependencies.length - 1])}\`)
            missingDependencies.forEach((dep, i) => console.info(\`\${i+1}. <\${dep}> is available at \${'${localPkg.repository.url.replace(/git\+|\.git/i, '')}'.replace('${build.tagName.replace('author-', '')}', dep.replace('author-', ''))}\`))
          }
        })();
        `
        magicString.prependLeft(0, dependencyCheck)
      }

      if (options.requiresBaseElement === true) {
        let baseClassCheck = `
          if (!window.hasOwnProperty('AuthorBaseElement')) {
            console.error('[ERROR] <${build.tagName}> Required dependency "AuthorBaseElement" not found.')
            console.info('AuthorBaseElement is available at ${localPkg.repository.url.replace(/git\+|\.git/gi, '').replace(build.tagName.replace('author-', ''), 'base')}')
          }
        `
        magicString.prependLeft(0, baseClassCheck)
      }

      // Concatenate results
      let token = '{{TEMPLATE-STRING}}'
      let start = build.js.indexOf(token)
      let end = start + token.length
      let injectedCode = minifyHTML(`<template><style>@charset "UTF-8"; ${build.css}</style>${build.template}</template>`, {
        collapseWhitespace: true,
        removeComments: true
      })

      magicString.overwrite(start, end, injectedCode)

      let result = {
        code: magicString.toString()
      }

      if (options.sourceMap !== false && options.sourcemap !== false) {
				result.map = magicString.generateMap({ hires: true })
      }

      return result
    }
  }
}
