class MyNav extends HTMLElement {
  static style = `
    .nav-style {
      padding: 1em;
      color: blueviolet;
    }
    nav {
      display: flex;
    }
    nav>.nav-style:nth-child(odd) {
      flex: none;
      width: 200px;
    }
    nav>.nav-style:nth-child(even) {
      flex: auto;
      text-align:right;
    }
  `;
  //建構式：畫面初始
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.styling();
    this.render();
  }
  styling() {
    this.stylesheet = document.createElement('style');
    this.stylesheet.textContent = this.constructor.style;
    this.shadowRoot.appendChild(this.stylesheet);
  }
  render() {
    const nav = document.createElement('nav');
    const title = document.createElement('div');
    const menu = document.createElement('div');
    title.className = 'nav-style';
    title.textContent = 'title'
    menu.className = 'nav-style';
    menu.textContent = 'menu';
    nav.appendChild(title);
    nav.appendChild(menu);
    this.shadowRoot.appendChild(nav);
  }
}
export default MyNav;