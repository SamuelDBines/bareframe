class BfEditor extends HTMLElement {
	static observedAttributes = ['variant', 'code', 'richtext', 'placeholder', 'value', 'disabled'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onInput = this._onInput.bind(this);
		this._onToolbarClick = this._onToolbarClick.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._sync();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./editor.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = `
			<div class="toolbar" part="toolbar">
				<button type="button" data-cmd="bold" title="Bold"><b>B</b></button>
				<button type="button" data-cmd="italic" title="Italic"><i>I</i></button>
				<button type="button" data-cmd="underline" title="Underline"><u>U</u></button>
				<button type="button" data-cmd="insertUnorderedList" title="Bullet List">• List</button>
				<button type="button" data-cmd="insertOrderedList" title="Numbered List">1. List</button>
			</div>
			<div class="code-wrap" part="code-wrap">
				<div class="line-numbers" part="line-numbers"></div>
				<textarea class="code" part="code"></textarea>
			</div>
			<div class="rich" part="rich" contenteditable="true"></div>
		</div>
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._toolbar = root.querySelector('.toolbar');
		this._codeWrap = root.querySelector('.code-wrap');
		this._lineNumbers = root.querySelector('.line-numbers');
		this._code = root.querySelector('.code');
		this._rich = root.querySelector('.rich');

		this._code.addEventListener('input', this._onInput);
		this._rich.addEventListener('input', this._onInput);
		this._toolbar.addEventListener('click', this._onToolbarClick);

		this._sync();
	}

	disconnectedCallback() {
		if (!this._code || !this._rich || !this._toolbar) {
			return;
		}
		this._code.removeEventListener('input', this._onInput);
		this._rich.removeEventListener('input', this._onInput);
		this._toolbar.removeEventListener('click', this._onToolbarClick);
	}

	attributeChangedCallback() {
		this._sync();
	}

	_variant() {
		const explicit = (this.getAttribute('variant') || '').toLowerCase();
		if (explicit === 'richtext' || this.hasAttribute('richtext')) {
			return 'richtext';
		}
		if (explicit === 'code' || this.hasAttribute('code')) {
			return 'code';
		}
		return 'code';
	}

	_sync() {
		if (!this._root || !this._code || !this._rich || !this._toolbar) {
			return;
		}

		const variant = this._variant();
		this._root.dataset.variant = variant;

		const disabled = this.hasAttribute('disabled');
		this._code.disabled = disabled;
		this._rich.setAttribute('contenteditable', disabled ? 'false' : 'true');

		const placeholder = this.getAttribute('placeholder') ||
			(variant === 'richtext' ? 'Write rich content…' : 'Write code…');
		this._code.placeholder = placeholder;
		this._rich.dataset.placeholder = placeholder;

		const value = this.getAttribute('value');
		if (value != null && this._lastSyncedValue !== value) {
			if (variant === 'richtext') {
				this._rich.innerHTML = value;
			} else {
				this._code.value = value;
				this._renderLineNumbers();
			}
			this._lastSyncedValue = value;
		} else if (value == null && !this._hasUserInput) {
			const initial = this.textContent.trim();
			if (initial) {
				if (variant === 'richtext') {
					this._rich.innerHTML = initial;
				} else {
					this._code.value = initial;
					this._renderLineNumbers();
				}
				this._hasUserInput = true;
			}
		}

		if (variant === 'code') {
			this._renderLineNumbers();
		}
	}

	_onInput() {
		const variant = this._variant();
		this._hasUserInput = true;
		if (variant === 'code') {
			this._renderLineNumbers();
			this.setAttribute('value', this._code.value);
			this._lastSyncedValue = this._code.value;
			this._emitChange(this._code.value, 'code');
			return;
		}
		this.setAttribute('value', this._rich.innerHTML);
		this._lastSyncedValue = this._rich.innerHTML;
		this._emitChange(this._rich.innerHTML, 'richtext');
	}

	_renderLineNumbers() {
		const lineCount = Math.max(1, this._code.value.split('\n').length);
		const text = Array.from({ length: lineCount }, (_, i) => String(i + 1)).join('\n');
		this._lineNumbers.textContent = text;
	}

	_onToolbarClick(event) {
		const button = event.target instanceof Element
			? event.target.closest('button[data-cmd]')
			: null;
		if (!button || this._variant() !== 'richtext' || this.hasAttribute('disabled')) {
			return;
		}
		const command = button.getAttribute('data-cmd');
		if (!command) {
			return;
		}
		this._rich.focus();
		document.execCommand(command, false);
		this._onInput();
	}

	_emitChange(value, mode) {
		this.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: { value, mode },
			}),
		);
	}
}

customElements.define('bf-editor', BfEditor);
