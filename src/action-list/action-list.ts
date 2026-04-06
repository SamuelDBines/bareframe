// @ts-nocheck
import BfComponent from '../_template/component';
class BfActionList extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		const cssUrl = new URL('./action-list.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = '<slot></slot>';

		this.shadowRoot.replaceChildren(link, root);
	}
}

customElements.define('bf-action-list', BfActionList);
