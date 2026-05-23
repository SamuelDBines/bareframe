import { Component, Element, Host, Method, h } from '@stencil/core';

@Component({
	tag: 'bf-wizard',
	styleUrl: 'bf-wizard.css',
	shadow: true,
})
export class BfWizard {
	@Element() el!: HTMLElement;
	private observer?: MutationObserver;

	connectedCallback() {
		this.observer = new MutationObserver(() => this.sync());
		this.observer.observe(this.el, {
			attributes: true,
			childList: true,
			subtree: true,
			characterData: true,
		});
	}

	disconnectedCallback() {
		this.observer?.disconnect();
	}

	@Method()
	async next(): Promise<void> {
		this.el.setAttribute(
			'step',
			`${Math.min(this.items().length, this.stepValue() + 1)}`,
		);
	}

	@Method()
	async prev(): Promise<void> {
		this.el.setAttribute('step', `${Math.max(1, this.stepValue() - 1)}`);
	}

	get step(): number {
		return this.stepValue();
	}
	set step(next: number) {
		this.el.setAttribute('step', `${next}`);
	}

	private mode(): string {
		const mode = (this.el.getAttribute('mode') || '').toLowerCase();
		if (mode === 'stepper' || this.el.hasAttribute('stepper')) {
			return 'stepper';
		}
		return 'wizard';
	}

	private items(): string[] {
		const explicit = (this.el.getAttribute('steps') || '')
			.split(',')
			.map((item) => item.trim())
			.filter(Boolean);
		if (explicit.length) {
			return explicit;
		}
		const titles = Array.from(this.el.children)
			.filter((child) => child.tagName.toLowerCase() === 'section')
			.map((panel) => panel.getAttribute('title') || panel.id || 'Step');
		if (titles.length) {
			return titles;
		}
		return ['Step 1', 'Step 2', 'Step 3'];
	}

	private stepValue(): number {
		const parsed = Number.parseInt(this.el.getAttribute('step') || '1', 10);
		if (!Number.isFinite(parsed) || parsed < 1) {
			return 1;
		}
		return Math.min(parsed, this.items().length);
	}

	private emitChange() {
		this.el.dispatchEvent(
			new CustomEvent('bf-change', {
				bubbles: true,
				composed: true,
				detail: {
					step: this.stepValue(),
					mode: this.mode(),
				},
			}),
		);
	}

	private renderSteps(items: string[], current: number) {
		const ol = this.el.shadowRoot?.querySelector('.steps');
		if (!(ol instanceof HTMLOListElement)) {
			return;
		}
		ol.replaceChildren();
		items.forEach((label, index) => {
			const li = document.createElement('li');
			const stepNumber = index + 1;
			if (stepNumber === current) {
				li.classList.add('current');
			} else if (stepNumber < current) {
				li.classList.add('done');
			}
			li.innerHTML = `<span class="dot">${stepNumber}</span><span class="label">${label}</span>`;
			ol.append(li);
		});
	}

	private syncPanels(current: number) {
		const content = this.el.shadowRoot?.querySelector('.content');
		const panels = Array.from(this.el.children).filter(
			(child) => child.tagName.toLowerCase() === 'section',
		);
		if (!(content instanceof HTMLElement)) {
			return;
		}
		if (!panels.length) {
			content.classList.add('is-empty');
			return;
		}
		content.classList.remove('is-empty');
		panels.forEach((panel, index) => {
			(panel as HTMLElement).hidden = index + 1 !== current;
		});
	}

	private onPrevClick = async () => {
		await this.prev();
		this.emitChange();
	};

	private onNextClick = async () => {
		await this.next();
		this.emitChange();
	};

	private sync() {
		const root = this.el.shadowRoot?.querySelector('.root');
		const prevBtn = this.el.shadowRoot?.querySelector('.prev');
		const nextBtn = this.el.shadowRoot?.querySelector('.next');
		if (
			!(root instanceof HTMLElement) ||
			!(prevBtn instanceof HTMLButtonElement) ||
			!(nextBtn instanceof HTMLButtonElement)
		) {
			return;
		}
		const mode = this.mode();
		const items = this.items();
		const current = this.stepValue();
		root.setAttribute('data-mode', mode);
		this.renderSteps(items, current);
		this.syncPanels(current);
		prevBtn.hidden = mode === 'stepper';
		nextBtn.hidden = mode === 'stepper';
		prevBtn.disabled = current <= 1;
		nextBtn.disabled = current >= items.length;
	}

	componentDidRender() {
		this.sync();
	}

	render() {
		return (
			<Host>
				<div class="root" part="root">
					<ol class="steps" part="steps"></ol>
					<div class="content" part="content">
						<slot onSlotchange={() => this.sync()} />
					</div>
					<div class="actions" part="actions">
						<button
							class="prev"
							type="button"
							part="prev"
							onClick={this.onPrevClick}>
							Back
						</button>
						<button
							class="next"
							type="button"
							part="next"
							onClick={this.onNextClick}>
							Next
						</button>
					</div>
				</div>
			</Host>
		);
	}
}
