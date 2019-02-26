class AuthorTestElement extends AuthorElement(HTMLElement) {
  constructor () {
    super(`{{TEMPLATE-STRING}}`)
  }
}

customElements.define('author-test', AuthorTestElement)
