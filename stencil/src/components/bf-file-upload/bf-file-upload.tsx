import { Component, Element, Host, h } from '@stencil/core';

type FileMeta = { name: string; size: number; type: string };

@Component({
	tag: 'bf-file-upload',
	styleUrl: 'bf-file-upload.css',
	shadow: true,
})
export class BfFileUpload {
	@Element() el!: HTMLElement;
	private observer?: MutationObserver;
	private _selectedFiles: File[] = [];

	connectedCallback() {
		this.observer = new MutationObserver(() => this.sync());
		this.observer.observe(this.el, { attributes: true });
	}

	private variant(): string {
		const explicit = (this.el.getAttribute('variant') || '').toLowerCase();
		if (explicit === 'dropzone' || this.el.hasAttribute('dropzone')) {
			return 'dropzone';
		}
		return 'input';
	}

	private onRootClick = (event: Event) => {
		const mx = event as MouseEvent;
		if (this.el.hasAttribute('disabled')) {
			return;
		}
		const t = mx.target;
		if (!t || (t as Node).nodeType !== Node.ELEMENT_NODE) {
			return;
		}
		if ((t as HTMLElement).tagName.toLowerCase() === 'a') {
			return;
		}
		const input = this.el.shadowRoot?.querySelector('.native');
		if (input instanceof HTMLInputElement) {
			input.click();
		}
	};

	private onInputChange = () => {
		const input = this.el.shadowRoot?.querySelector('.native');
		if (input instanceof HTMLInputElement) {
			this.setFiles(input.files);
		}
	};

	private onDragOver = (event: Event) => {
		const dx = event as DragEvent;
		if (this.variant() !== 'dropzone' || this.el.hasAttribute('disabled')) {
			return;
		}
		dx.preventDefault();
		const root = this.el.shadowRoot?.querySelector('.root');
		if (root instanceof HTMLElement) {
			root.dataset.drag = 'over';
		}
	};

	private onDragLeave = () => {
		const root = this.el.shadowRoot?.querySelector('.root');
		if (root instanceof HTMLElement) {
			root.dataset.drag = 'off';
		}
	};

	private onDrop = (event: Event) => {
		const dx = event as DragEvent;
		if (this.variant() !== 'dropzone' || this.el.hasAttribute('disabled')) {
			return;
		}
		dx.preventDefault();
		const root = this.el.shadowRoot?.querySelector('.root');
		if (root instanceof HTMLElement) {
			root.dataset.drag = 'off';
		}
		const list = dx.dataTransfer?.files;
		if (!list || list.length === 0) {
			return;
		}
		this.setFiles(list);
	};

	private emitChange(payload: { count: number; files: FileMeta[] }) {
		this.el.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: payload,
			}),
		);
	}

	private setFiles(fileList: FileList | null) {
		const input = this.el.shadowRoot?.querySelector('.native');
		if (!(input instanceof HTMLInputElement)) {
			return;
		}
		const all = Array.from(fileList || []);
		this._selectedFiles = input.multiple ? all : all.slice(0, 1);

		const meta = this.el.shadowRoot?.querySelector('.meta');
		const filesWrap = this.el.shadowRoot?.querySelector('.files');
		if (!(meta instanceof HTMLElement) || !(filesWrap instanceof HTMLElement)) {
			return;
		}

		meta.textContent = this._selectedFiles.length
			? `${this._selectedFiles.length} file${this._selectedFiles.length === 1 ? '' : 's'} selected`
			: input.multiple
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
		filesWrap.replaceChildren(...chips);

		this.emitChange({
			count: this._selectedFiles.length,
			files: this._selectedFiles.map((file) => ({
				name: file.name,
				size: file.size,
				type: file.type,
			})),
		});
	}

	private sync() {
		const root = this.el.shadowRoot?.querySelector('.root');
		const input = this.el.shadowRoot?.querySelector('.native');
		const labelEl = this.el.shadowRoot?.querySelector('.label');
		const meta = this.el.shadowRoot?.querySelector('.meta');
		const filesWrap = this.el.shadowRoot?.querySelector('.files');
		if (
			!(root instanceof HTMLElement) ||
			!(input instanceof HTMLInputElement) ||
			!(labelEl instanceof HTMLElement) ||
			!(meta instanceof HTMLElement) ||
			!(filesWrap instanceof HTMLElement)
		) {
			return;
		}

		const variant = this.variant();
		root.dataset.variant = variant;
		root.dataset.border = this.el.hasAttribute('dotted')
			? 'dotted'
			: this.el.hasAttribute('dashed')
				? 'dashed'
				: 'solid';

		const disabled = this.el.hasAttribute('disabled');
		root.dataset.disabled = disabled ? 'true' : 'false';
		input.disabled = disabled;

		if (this.el.hasAttribute('multiple')) {
			input.multiple = true;
			root.dataset.multiple = 'true';
		} else {
			input.multiple = false;
			root.dataset.multiple = 'false';
		}

		const accept = this.el.getAttribute('accept') || '';
		if (accept) {
			input.setAttribute('accept', accept);
		} else {
			input.removeAttribute('accept');
		}

		labelEl.textContent =
			this.el.getAttribute('label') ||
			(variant === 'dropzone'
				? 'Drop files here or click to browse'
				: 'Choose file');

		if (!this._selectedFiles || this._selectedFiles.length === 0) {
			meta.textContent = input.multiple ? 'No files selected' : 'No file selected';
			filesWrap.replaceChildren();
		}
	}

	componentDidRender() {
		const root = this.el.shadowRoot?.querySelector('.root');
		const input = this.el.shadowRoot?.querySelector('.native');
		if (root && input instanceof HTMLInputElement && input.dataset.bfBound !== 'true') {
			input.dataset.bfBound = 'true';
			root.addEventListener('click', this.onRootClick);
			input.addEventListener('change', this.onInputChange);
			root.addEventListener('dragover', this.onDragOver);
			root.addEventListener('dragleave', this.onDragLeave);
			root.addEventListener('drop', this.onDrop);
		}
		this.sync();
	}

	disconnectedCallback() {
		const root = this.el.shadowRoot?.querySelector('.root');
		const input = this.el.shadowRoot?.querySelector('.native');
		root?.removeEventListener('click', this.onRootClick);
		root?.removeEventListener('dragover', this.onDragOver);
		root?.removeEventListener('dragleave', this.onDragLeave);
		root?.removeEventListener('drop', this.onDrop);
		input?.removeEventListener('change', this.onInputChange);
		this.observer?.disconnect();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root">
					<input class="native" type="file" />
					<div class="label" part="label"></div>
					<div class="meta" part="meta"></div>
					<div class="files" part="files"></div>
					<slot />
				</div>
			</Host>
		);
	}
}
