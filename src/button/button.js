class BfButton extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		const label = this.getAttribute('label') || 'Button';
		const variant = this.getAttribute('variant') || 'primary';
		const cssUrl = new URL('./button.css', import.meta.url);

		this.shadowRoot.innerHTML = '';

		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const button = document.createElement('button');
		button.className = variant;
		button.type = 'button';
		button.textContent = label;
		button.append(document.createElement('slot'));

		this.shadowRoot.append(link, button);

		button.addEventListener('click', () => {
			this.dispatchEvent(
				new CustomEvent('bf-click', {
					bubbles: true,
					composed: true,
					detail: {
						label,
						variant,
						at: new Date().toISOString(),
					},
				}),
			);
		});
	}
}

customElements.define('bf-button', BfButton);
