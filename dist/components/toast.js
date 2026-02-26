class BfToast extends HTMLElement {
	static observedAttributes = [
		'variant',
		'position',
		'type',
		'duration',
		'open',
		'alert',
		'notification',
		'snackbar',
		'banner',
		'top',
		'bottom',
		'left',
		'right',
		'center',
		'success',
		'warning',
		'error',
		'info',
	];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onCloseClick = this._onCloseClick.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._syncState();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./toast.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = `
			<span class="icon" part="icon" aria-hidden="true"></span>
			<div class="content" part="content"><slot></slot></div>
			<button class="close" part="close" type="button" aria-label="Close">&times;</button>
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._icon = root.querySelector('.icon');
		this._close = root.querySelector('.close');
		this._close.addEventListener('click', this._onCloseClick);

		this._syncState();
	}

	disconnectedCallback() {
		this._clearDurationTimer();
	}

	attributeChangedCallback() {
		this._syncState();
	}

	get open() {
		return this.hasAttribute('open');
	}

	set open(next) {
		if (next) {
			this.setAttribute('open', '');
			return;
		}
		this.removeAttribute('open');
	}

	show() {
		this.open = true;
	}

	hide() {
		this.open = false;
	}

	_onCloseClick() {
		this.hide();
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
		if (['toast', 'alert', 'notification', 'snackbar', 'banner'].includes(explicit)) {
			return explicit;
		}
		if (this.hasAttribute('alert')) {
			return 'alert';
		}
		if (this.hasAttribute('notification')) {
			return 'notification';
		}
		if (this.hasAttribute('snackbar')) {
			return 'snackbar';
		}
		if (this.hasAttribute('banner')) {
			return 'banner';
		}
		return 'toast';
	}

	_type() {
		const explicit = (this.getAttribute('type') || '').toLowerCase();
		if (['success', 'warning', 'error', 'info'].includes(explicit)) {
			return explicit;
		}
		if (this.hasAttribute('success')) {
			return 'success';
		}
		if (this.hasAttribute('warning')) {
			return 'warning';
		}
		if (this.hasAttribute('error')) {
			return 'error';
		}
		return 'info';
	}

	_position() {
		const variant = this._variant();
		const explicit = (this.getAttribute('position') || '').toLowerCase().replace(/\s+/g, '-');
		if (explicit && this._isValidPosition(explicit)) {
			return explicit;
		}
		if (
			variant === 'snackbar'
			&& !this.hasAttribute('top')
			&& !this.hasAttribute('bottom')
			&& !this.hasAttribute('left')
			&& !this.hasAttribute('right')
			&& !this.hasAttribute('center')
			&& !this.hasAttribute('position')
		) {
			return 'bottom-center';
		}
		if (
			variant === 'banner'
			&& !this.hasAttribute('top')
			&& !this.hasAttribute('bottom')
			&& !this.hasAttribute('left')
			&& !this.hasAttribute('right')
			&& !this.hasAttribute('center')
			&& !this.hasAttribute('position')
		) {
			return 'top-center';
		}
		const y = this.hasAttribute('bottom') ? 'bottom' : 'top';
		let x = 'right';
		if (this.hasAttribute('left')) {
			x = 'left';
		}
		if (this.hasAttribute('center')) {
			x = 'center';
		}
		if (this.hasAttribute('right')) {
			x = 'right';
		}
		return `${y}-${x}`;
	}

	_isValidPosition(position) {
		return [
			'top-left',
			'top-center',
			'top-right',
			'bottom-left',
			'bottom-center',
			'bottom-right',
		].includes(position);
	}

	_duration() {
		const parsed = Number.parseInt(this.getAttribute('duration') || '', 10);
		return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
	}

	_iconSymbol() {
		const type = this._type();
		if (type === 'success') {
			return '✓';
		}
		if (type === 'warning') {
			return '!';
		}
		if (type === 'error') {
			return 'x';
		}
		return 'i';
	}

	_clearDurationTimer() {
		if (!this._durationTimer) {
			return;
		}
		clearTimeout(this._durationTimer);
		this._durationTimer = null;
	}

	_scheduleAutoHide() {
		this._clearDurationTimer();
		const ms = this._duration();
		if (!this.open || ms <= 0) {
			return;
		}
		this._durationTimer = setTimeout(() => {
			this.hide();
		}, ms);
	}

	_syncState() {
		if (!this._root) {
			return;
		}

		const variant = this._variant();
		const type = this._type();
		const position = this._position();
		if (!this.hasAttribute('open')) {
			this.setAttribute('open', '');
		}

		this._root.setAttribute('data-variant', variant);
		this._root.setAttribute('data-type', type);
		this._root.setAttribute('data-position', position);
		this._root.setAttribute('data-open', this.open ? 'true' : 'false');
		this._icon.textContent = this._iconSymbol();
		this._applyPosition(position);

		this.setAttribute('role', variant === 'alert' ? 'alert' : 'status');
		this.setAttribute('aria-live', variant === 'alert' ? 'assertive' : 'polite');

		this._scheduleAutoHide();
	}

	_applyPosition(position) {
		const anchored = this.hasAttribute('position')
			|| this.hasAttribute('top')
			|| this.hasAttribute('bottom')
			|| this.hasAttribute('left')
			|| this.hasAttribute('right')
			|| this.hasAttribute('center');
		if (!anchored) {
			this.style.position = '';
			this.style.top = '';
			this.style.bottom = '';
			this.style.left = '';
			this.style.right = '';
			this.style.transform = '';
			return;
		}

		this.style.position = 'fixed';
		this.style.zIndex = '1000';
		this.style.top = '';
		this.style.bottom = '';
		this.style.left = '';
		this.style.right = '';
		this.style.transform = '';

		const [y, x] = position.split('-');
		this.style[y] = '1rem';
		if (x === 'left') {
			this.style.left = '1rem';
		} else if (x === 'right') {
			this.style.right = '1rem';
		} else {
			this.style.left = '50%';
			this.style.transform = 'translateX(-50%)';
		}
	}
}

customElements.define('bf-toast', BfToast);
