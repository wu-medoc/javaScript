class MyMain extends HTMLElement {
  static style = `
    .main-style {
      height:200px;
      line-height:200px;
      text-align:center;
      font-size:1.2rem;
      font-weight:bold;
      background:#ddd;
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
    const app = document.querySelector('#myApp');
    const main = document.createElement('main');
    main.className = 'main-style';
    main.textContent = app.getAttribute('text');
    this.shadowRoot.appendChild(main);
  }
}
export default MyMain;