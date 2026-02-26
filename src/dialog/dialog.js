class BfDialog extends HTMLElement {
	static observedAttributes = [
		'open',
		'variant',
		'position',
		'modal',
		'sheet',
		'bottom-sheet',
		'popover',
		'tooltip',
		'panel',
		'top',
		'bottom',
		'left',
		'right',
		'center',
		'label',
	];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onBackdropClick = this._onBackdropClick.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._sync();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./dialog.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = `
			<div class="backdrop" part="backdrop"></div>
			<div class="panel" part="panel"><slot></slot></div>
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._backdrop = root.querySelector('.backdrop');
		this._panel = root.querySelector('.panel');
		this._backdrop.addEventListener('click', this._onBackdropClick);


		this._sync();
	}

	attributeChangedCallback() {
		this._sync();
	}

	get openState() {
		return this.hasAttribute('open');
	}

	open() {
		this.setAttribute('open', '');
	}

	close() {
		this.removeAttribute('open');
	}

	toggle() {
		if (this.hasAttribute('open')) {
			this.close();
			return;
		}
		this.open();
	}

	_onBackdropClick() {
		const variant = this._variant();
		if (variant === 'tooltip' || variant === 'popover') {
			return;
		}
		if (this.hasAttribute('persistent')) {
			return;
		}
		this.close();
		this.dispatchEvent(
			new CustomEvent('bf-close', {
				bubbles: true,
				composed: true,
				detail: { id: this.id || '' },
			}),
		);
	}

	_variant() {
		const explicit = (this.getAttribute('variant') || '').toLowerCase();
		if (
			[
				'dialog',
				'sheet',
				'bottom-sheet',
				'popover',
				'tooltip',
				'panel',
			].includes(explicit)
		) {
			return explicit;
		}
		if (this.hasAttribute('sheet')) {
			return 'sheet';
		}
		if (this.hasAttribute('bottom-sheet')) {
			return 'bottom-sheet';
		}
		if (this.hasAttribute('popover')) {
			return 'popover';
		}
		if (this.hasAttribute('tooltip')) {
			return 'tooltip';
		}
		if (this.hasAttribute('panel')) {
			return 'panel';
		}
		return 'dialog';
	}

	_position() {
		const explicit = (this.getAttribute('position') || '').toLowerCase().replace(/\s+/g, '-');
		if (
			[
				'center',
				'left',
				'right',
				'top',
				'bottom',
				'top-left',
				'top-right',
				'bottom-left',
				'bottom-right',
			].includes(explicit)
		) {
			return explicit;
		}
		if (this.hasAttribute('left')) {
			return 'left';
		}
		if (this.hasAttribute('right')) {
			return 'right';
		}
		if (this.hasAttribute('top')) {
			return 'top';
		}
		if (this.hasAttribute('bottom')) {
			return 'bottom';
		}
		if (this.hasAttribute('center')) {
			return 'center';
		}
		return 'center';
	}

	_shouldOpenByDefault() {
		return !this.hasAttribute('id');
	}

	_sync() {
		if (!this._root || !this._panel) {
			return;
		}

		if (!this.hasAttribute('open') && this._shouldOpenByDefault()) {
			this.setAttribute('open', '');
			return;
		}

		const isOpen = this.hasAttribute('open');
		const variant = this._variant();
		const position = this._position();

		this._root.setAttribute('data-open', isOpen ? 'true' : 'false');
		this._root.setAttribute('data-variant', variant);
		this._root.setAttribute('data-position', position);

		this.hidden = !isOpen;
		this.setAttribute('aria-hidden', String(!isOpen));
		this.setAttribute('role', variant === 'tooltip' ? 'tooltip' : 'dialog');
		if (this.getAttribute('label')) {
			this.setAttribute('aria-label', this.getAttribute('label'));
		}
	}
}

customElements.define('bf-dialog', BfDialog);
