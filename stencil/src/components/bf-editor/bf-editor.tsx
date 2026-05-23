import { Component, Element, Host, h } from '@stencil/core';

@Component({
	tag: 'bf-editor',
	styleUrl: 'bf-editor.css',
	shadow: true,
})
export class BfEditor {
	@Element() el!: HTMLElement;

	private observer?: MutationObserver;

	private root?: HTMLElement | null;

	private toolbar?: HTMLElement | null;

	private lineNumbers?: HTMLElement | null;

	private code?: HTMLTextAreaElement | null;

	private rich?: HTMLElement | null;

	private _lastSyncedValue: string | null = null;

	private _hasUserInput = false;

	connectedCallback() {
		this.observer = new MutationObserver(() => this.sync());
		this.observer.observe(this.el, { attributes: true });
	}

	disconnectedCallback() {
		this.observer?.disconnect();
		const sr = this.el.shadowRoot;
		sr?.querySelector('.code')?.removeEventListener('input', this.onInput);
		sr?.querySelector('.rich')?.removeEventListener('input', this.onInput);
		sr?.querySelector('.toolbar')?.removeEventListener('click', this.onToolbarClick);
	}

	private variant(): string {
		const explicit = (this.el.getAttribute('variant') || '').toLowerCase();
		if (explicit === 'richtext' || this.el.hasAttribute('richtext')) {
			return 'richtext';
		}
		if (explicit === 'code' || this.el.hasAttribute('code')) {
			return 'code';
		}
		return 'code';
	}

	private onInput = () => {
		const variant = this.variant();
		this._hasUserInput = true;
		if (variant === 'code') {
			this.renderLineNumbers();
			this.el.setAttribute('value', this.code!.value);
			this._lastSyncedValue = this.code!.value;
			this.emitChange(this.code!.value, 'code');
			return;
		}
		this.el.setAttribute('value', this.rich!.innerHTML);
		this._lastSyncedValue = this.rich!.innerHTML;
		this.emitChange(this.rich!.innerHTML, 'richtext');
	};

	private renderLineNumbers() {
		if (!this.lineNumbers || !this.code) {
			return;
		}
		const lineCount = Math.max(1, this.code.value.split('\n').length);
		const text = Array.from({ length: lineCount }, (_, i) => String(i + 1)).join('\n');
		this.lineNumbers.textContent = text;
	}

	private onToolbarClick = (event: Event) => {
		const mx = event as MouseEvent;
		const tgt = mx.target;
		if (!tgt || (tgt as Node).nodeType !== Node.ELEMENT_NODE) {
			return;
		}
		const button = (tgt as Element).closest('button[data-cmd]');
		if (!button || this.variant() !== 'richtext' || this.el.hasAttribute('disabled')) {
			return;
		}
		const command = button.getAttribute('data-cmd');
		if (!command) {
			return;
		}
		this.rich!.focus();
		document.execCommand(command, false);
		this.onInput();
	};

	private emitChange(value: string, mode: string) {
		this.el.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: { value, mode },
			}),
		);
	}

	private bindOnce() {
		const sr = this.el.shadowRoot;
		if (!sr) {
			return;
		}
		this.root = sr.querySelector('.root');
		this.toolbar = sr.querySelector('.toolbar');
		this.lineNumbers = sr.querySelector('.line-numbers');
		this.code = sr.querySelector('.code');
		this.rich = sr.querySelector('.rich');
		if (!this.code || !this.rich || !this.toolbar) {
			return;
		}
		if (this.code.dataset.bfBound !== 'true') {
			this.code.dataset.bfBound = 'true';
			this.code.addEventListener('input', this.onInput);
		}
		if (this.rich.dataset.bfBound !== 'true') {
			this.rich.dataset.bfBound = 'true';
			this.rich.addEventListener('input', this.onInput);
		}
		if (this.toolbar.dataset.bfBound !== 'true') {
			this.toolbar.dataset.bfBound = 'true';
			this.toolbar.addEventListener('click', this.onToolbarClick);
		}
	}

	private sync() {
		this.bindOnce();
		if (!this.root || !this.code || !this.rich || !this.toolbar) {
			return;
		}

		const variant = this.variant();
		this.root.dataset.variant = variant;

		const disabled = this.el.hasAttribute('disabled');
		this.code.disabled = disabled;
		this.rich.setAttribute('contenteditable', disabled ? 'false' : 'true');

		const placeholder =
			this.el.getAttribute('placeholder') ||
			(variant === 'richtext' ? 'Write rich content…' : 'Write code…');
		this.code.placeholder = placeholder;
		this.rich.dataset.placeholder = placeholder;

		const value = this.el.getAttribute('value');
		if (value != null && this._lastSyncedValue !== value) {
			if (variant === 'richtext') {
				this.rich.innerHTML = value;
			} else {
				this.code.value = value;
				this.renderLineNumbers();
			}
			this._lastSyncedValue = value;
		} else if (value == null && !this._hasUserInput) {
			const initial = this.el.textContent?.trim() || '';
			if (initial) {
				if (variant === 'richtext') {
					this.rich.innerHTML = initial;
				} else {
					this.code.value = initial;
					this.renderLineNumbers();
				}
				this._hasUserInput = true;
			}
		}

		if (variant === 'code') {
			this.renderLineNumbers();
		}
	}

	componentDidRender() {
		this.sync();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root">
					<div class="toolbar" part="toolbar">
						<button type="button" data-cmd="bold" title="Bold">
							<b>B</b>
						</button>
						<button type="button" data-cmd="italic" title="Italic">
							<i>I</i>
						</button>
						<button type="button" data-cmd="underline" title="Underline">
							<u>U</u>
						</button>
						<button type="button" data-cmd="insertUnorderedList" title="Bullet List">
							• List
						</button>
						<button type="button" data-cmd="insertOrderedList" title="Numbered List">
							1. List
						</button>
					</div>
					<div class="code-wrap" part="code-wrap">
						<div class="line-numbers" part="line-numbers"></div>
						<textarea class="code" part="code" />
					</div>
					<div class="rich" part="rich" contentEditable={true} />
				</div>
			</Host>
		);
	}
}
