// src/components/select/select.ts
console.log("select.ts");
var BfSelect = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.innerHTML = '<select><option value="1">1</option><option value="2">2</option><option value="3">3</option></select>';
    if (this.shadowRoot) {
      this.shadowRoot.appendChild(document.createElement("select"));
    }
    console.log("bf-select constructor");
  }
  connectedCallback() {
    console.log("bf-select connectedCallback");
  }
  disconnectedCallback() {
    console.log("bf-select disconnectedCallback");
  }
};
customElements.define("bf-select", BfSelect);
var select_default = BfSelect;
var Select = document.createElement("select");
var selects = document.getElementsByTagName("bff-select");
for (const select of selects) {
  select.appendChild(Select);
  console.log(select.options);
}
export {
  select_default as BfSelect
};
