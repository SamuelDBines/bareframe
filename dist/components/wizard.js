class BfWizard extends HTMLElement {
	static observedAttributes = ['mode', 'step', 'steps', 'linear', 'stepper'];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._onPrev = this._onPrev.bind(this);
		this._onNext = this._onNext.bind(this);
	}

	connectedCallback() {
		if (this._initialized) {
			this._sync();
			return;
		}
		this._initialized = true;

		const cssUrl = new URL('./wizard.css', import.meta.url);
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = cssUrl.href;

		const root = document.createElement('div');
		root.className = 'root';
		root.setAttribute('part', 'root');
		root.innerHTML = `
			<ol class="steps" part="steps"></ol>
			<div class="content" part="content"><slot></slot></div>
			<div class="actions" part="actions">
				<button class="prev" type="button" part="prev">Back</button>
				<button class="next" type="button" part="next">Next</button>
			</div>
		`;

		this.shadowRoot.replaceChildren(link, root);
		this._root = root;
		this._stepsEl = root.querySelector('.steps');
		this._content = root.querySelector('.content');
		this._prevBtn = root.querySelector('.prev');
		this._nextBtn = root.querySelector('.next');
		this._slot = root.querySelector('slot');
		this._prevBtn.addEventListener('click', this._onPrev);
		this._nextBtn.addEventListener('click', this._onNext);
		this._slot.addEventListener('slotchange', () => this._sync());
		this._sync();
	}

	attributeChangedCallback() {
		this._sync();
	}

	get step() {
		return this._step();
	}

	set step(next) {
		this.setAttribute('step', `${next}`);
	}

	next() {
		this.step = Math.min(this._items().length, this._step() + 1);
	}

	prev() {
		this.step = Math.max(1, this._step() - 1);
	}

	_onPrev() {
		this.prev();
		this._emitChange();
	}

	_onNext() {
		this.next();
		this._emitChange();
	}

	_emitChange() {
		this.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: {
					step: this._step(),
					mode: this._mode(),
				},
			}),
		);
	}

	_mode() {
		const mode = (this.getAttribute('mode') || '').toLowerCase();
		if (mode === 'stepper' || this.hasAttribute('stepper')) {
			return 'stepper';
		}
		return 'wizard';
	}

	_items() {
		const explicit = (this.getAttribute('steps') || '')
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
		if (explicit.length) {
			return explicit;
		}
		const panels = [...this.children]
			.filter((child) => child.tagName.toLowerCase() === 'section')
			.map((panel) => panel.getAttribute('title') || panel.id || 'Step');
		if (panels.length) {
			return panels;
		}
		return ['Step 1', 'Step 2', 'Step 3'];
	}

	_step() {
		const parsed = Number.parseInt(this.getAttribute('step') || '1', 10);
		if (!Number.isFinite(parsed) || parsed < 1) {
			return 1;
		}
		return Math.min(parsed, this._items().length);
	}

	_renderSteps(items, current) {
		this._stepsEl.replaceChildren();
		items.forEach((label, index) => {
			const li = document.createElement('li');
			const stepNumber = index + 1;
			if (stepNumber === current) {
				li.classList.add('current');
			} else if (stepNumber < current) {
				li.classList.add('done');
			}
			li.innerHTML = `<span class="dot">${stepNumber}</span><span class="label">${label}</span>`;
			this._stepsEl.append(li);
		});
	}

	_syncPanels(current) {
		const panels = [...this.children].filter((child) => child.tagName.toLowerCase() === 'section');
		if (!panels.length) {
			this._content.classList.add('is-empty');
			return;
		}
		this._content.classList.remove('is-empty');
		panels.forEach((panel, index) => {
			panel.hidden = index + 1 !== current;
		});
	}

	_sync() {
		if (!this._root) {
			return;
		}
		const mode = this._mode();
		const items = this._items();
		const current = this._step();
		this._root.setAttribute('data-mode', mode);
		this._renderSteps(items, current);
		this._syncPanels(current);
		this._prevBtn.hidden = mode === 'stepper';
		this._nextBtn.hidden = mode === 'stepper';
		this._prevBtn.disabled = current <= 1;
		this._nextBtn.disabled = current >= items.length;
	}
}

customElements.define('bf-wizard', BfWizard);
