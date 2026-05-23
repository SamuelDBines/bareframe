console.log('select.ts');   
class BfSelect extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.innerHTML = '<select><option value="1">1</option><option value="2">2</option><option value="3">3</option></select>';

        if (this.shadowRoot) {
            this.shadowRoot.appendChild(document.createElement('select'));
            // this.shadowRoot.appendChild(this.createStyleLink());
        }
        console.log('bf-select constructor');
    }

    connectedCallback() {
        console.log('bf-select connectedCallback');
    }

    disconnectedCallback() {
        console.log('bf-select disconnectedCallback');
    }
}

customElements.define('bf-select', BfSelect);
export default BfSelect;

const Select = document.createElement('select');

const selects = document.getElementsByTagName('bff-select');
for (const select of selects) {
    select.appendChild(Select);
    console.log(select.options);
}

