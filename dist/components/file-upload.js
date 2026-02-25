class BfFileUpload extends HTMLElement {
	static observedAttributes = [
		'variant',
		'dropzone',
		'multiple',
		'accept',
		'dotted',
		'dashed',
		'disabled',
	];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onRootClick = this._onRootClick.bind(this);
		this._onInputChange = this._onInputChange.bind(this);
		this._onDragOver = this._onDragOver.bind(this);
		this._onDragLeave = this._onDragLeave.bind(this);
		this._onDrop = this._onDrop.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._sync();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./file-upload.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = `
			<input class="native" type="file" />
			<div class="label" part="label"></div>
			<div class="meta" part="meta"></div>
			<div class="files" part="files"></div>
			<slot></slot>
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._input = root.querySelector('.native');
		this._label = root.querySelector('.label');
		this._meta = root.querySelector('.meta');
		this._files = root.querySelector('.files');

		root.addEventListener('click', this._onRootClick);
		this._input.addEventListener('change', this._onInputChange);
		root.addEventListener('dragover', this._onDragOver);
		root.addEventListener('dragleave', this._onDragLeave);
		root.addEventListener('drop', this._onDrop);

		this._sync();
	}

	disconnectedCallback() {
		if (!this._root || !this._input) {
			return;
		}
		this._root.removeEventListener('click', this._onRootClick);
		this._root.removeEventListener('dragover', this._onDragOver);
		this._root.removeEventListener('dragleave', this._onDragLeave);
		this._root.removeEventListener('drop', this._onDrop);
		this._input.removeEventListener('change', this._onInputChange);
	}

	attributeChangedCallback() {
		this._sync();
	}

	_variant() {
		const explicit = (this.getAttribute('variant') || '').toLowerCase();
		if (explicit === 'dropzone' || this.hasAttribute('dropzone')) {
			return 'dropzone';
		}
		return 'input';
	}

	_sync() {
		if (!this._root || !this._input || !this._label || !this._meta || !this._files) {
			return;
		}

		const variant = this._variant();
		this._root.dataset.variant = variant;
		this._root.dataset.border = this.hasAttribute('dotted')
			? 'dotted'
			: this.hasAttribute('dashed')
				? 'dashed'
				: 'solid';

		const disabled = this.hasAttribute('disabled');
		this._root.dataset.disabled = disabled ? 'true' : 'false';
		this._input.disabled = disabled;

		if (this.hasAttribute('multiple')) {
			this._input.multiple = true;
			this._root.dataset.multiple = 'true';
		} else {
			this._input.multiple = false;
			this._root.dataset.multiple = 'false';
		}

		const accept = this.getAttribute('accept') || '';
		if (accept) {
			this._input.setAttribute('accept', accept);
		} else {
			this._input.removeAttribute('accept');
		}

		this._label.textContent =
			this.getAttribute('label') ||
			(variant === 'dropzone'
				? 'Drop files here or click to browse'
				: 'Choose file');

		if (!this._selectedFiles || this._selectedFiles.length === 0) {
			this._meta.textContent = this._input.multiple
				? 'No files selected'
				: 'No file selected';
			this._files.replaceChildren();
		}
	}

	_onRootClick(event) {
		if (this.hasAttribute('disabled')) {
			return;
		}
		if (event.target instanceof Element && event.target.tagName.toLowerCase() === 'a') {
			return;
		}
		this._input.click();
	}

	_onInputChange() {
		this._setFiles(this._input.files);
	}

	_onDragOver(event) {
		if (this._variant() !== 'dropzone' || this.hasAttribute('disabled')) {
			return;
		}
		event.preventDefault();
		this._root.dataset.drag = 'over';
	}

	_onDragLeave() {
		if (!this._root) {
			return;
		}
		this._root.dataset.drag = 'off';
	}

	_onDrop(event) {
		if (this._variant() !== 'dropzone' || this.hasAttribute('disabled')) {
			return;
		}
		event.preventDefault();
		this._root.dataset.drag = 'off';
		const list = event.dataTransfer?.files;
		if (!list || list.length === 0) {
			return;
		}
		this._setFiles(list);
	}

	_setFiles(fileList) {
		const all = Array.from(fileList || []);
		this._selectedFiles = this._input.multiple ? all : all.slice(0, 1);

		this._meta.textContent = this._selectedFiles.length
			? `${this._selectedFiles.length} file${this._selectedFiles.length === 1 ? '' : 's'} selected`
			: this._input.multiple
				? 'No files selected'
				: 'No file selected';

		const chips = this._selectedFiles.slice(0, 3).map((file) => {
			const item = document.createElement('span');
			item.className = 'file';
			item.textContent = file.name;
			return item;
		});
		if (this._selectedFiles.length > 3) {
			const more = document.createElement('span');
			more.className = 'file';
			more.textContent = `+${this._selectedFiles.length - 3} more`;
			chips.push(more);
		}
		this._files.replaceChildren(...chips);

		this.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: {
					count: this._selectedFiles.length,
					files: this._selectedFiles.map((file) => ({
						name: file.name,
						size: file.size,
						type: file.type,
					})),
				},
			}),
		);
	}
}

customElements.define('bf-file-upload', BfFileUpload);
