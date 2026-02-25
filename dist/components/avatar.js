class BfAvatar extends HTMLElement {
	static get observedAttributes() {
		return ['name', 'src', 'alt', 'initials', 'size', 'status'];
	}

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this._initialized) {
			return;
		}
		this._initialized = true;
		this._render();
	}

	attributeChangedCallback() {
		if (!this._initialized) {
			return;
		}
		this._render();
	}

	_render() {
		const cssUrl = new URL('./avatar.css', import.meta.url);
		const name = this.getAttribute('name') || '';
		const src = this.getAttribute('src') || '';
		const alt = this.getAttribute('alt') || name || 'Avatar';
		const explicitInitials = this.getAttribute('initials');
		const initials = explicitInitials || this._buildInitials(name);
		const size = this.getAttribute('size') || 'md';
		const status = this.getAttribute('status') || '';
		const showStatus = status && ['online', 'away', 'busy', 'offline'].includes(status);

		this.shadowRoot.innerHTML = `
			<link rel="stylesheet" href="${cssUrl.href}" />
			<div class="root size-${size}" part="root">
				${src ? `<img class="image" part="image" src="${src}" alt="${alt.replace(/"/g, '&quot;')}" />` : ''}
				<div class="fallback ${src ? 'hidden' : ''}" part="fallback" aria-label="${alt.replace(/"/g, '&quot;')}">${initials || '?'}</div>
				${showStatus ? `<span class="status ${status}" part="status"></span>` : ''}
			</div>
		`;

		if (src) {
			const image = this.shadowRoot.querySelector('.image');
			const fallback = this.shadowRoot.querySelector('.fallback');
			image.addEventListener('error', () => {
				image.classList.add('hidden');
				fallback.classList.remove('hidden');
			});
		}
	}

	_buildInitials(name) {
		if (!name.trim()) {
			return '';
		}
		const parts = name
			.trim()
			.split(/\s+/)
			.slice(0, 2);
		return parts.map((part) => part.charAt(0).toUpperCase()).join('');
	}
}

customElements.define('bf-avatar', BfAvatar);
