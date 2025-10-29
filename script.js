class PortfolioCallout extends HTMLElement {
  constructor() {
    super();
  }
}

customElements.define("portfolio-callout", PortfolioCallout);

// Custom element that logs to console when connected to the DOM
class HelloWorld extends HTMLElement {
    connectedCallback() {
      console.log("Hello world! — from <hello-world>");
    }
  }
  customElements.define("hello-world", HelloWorld);
  
