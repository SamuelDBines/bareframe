import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfWizardCss = () => `:host{--bf-wizard-font:var(--bf-theme-font-family, inherit);--bf-wizard-radius:var(--bf-theme-radius-md, 10px);--bf-wizard-border-color:var(--bf-theme-wizard-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-wizard-bg:var(--bf-theme-wizard-bg, var(--bf-theme-surface-1, #ffffff));--bf-wizard-color:var(--bf-theme-wizard-color, var(--bf-theme-text-1, #0f172a));--bf-wizard-accent:var(--bf-theme-button-primary-bg, #2563eb);--bf-wizard-muted:var(--bf-theme-text-2, #64748b);display:block;font:var(--bf-wizard-font);color:var(--bf-wizard-color)}.root{background:var(--bf-wizard-bg);color:var(--bf-wizard-color);border:1px solid var(--bf-wizard-border-color);border-radius:var(--bf-wizard-radius);padding:0.85rem;display:grid;gap:0.8rem}.steps{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:0.55rem}.steps li{display:inline-flex;align-items:center;gap:0.4rem;color:var(--bf-wizard-muted)}.steps .dot{width:1.4rem;height:1.4rem;border-radius:999px;border:1px solid var(--bf-wizard-border-color);display:inline-flex;align-items:center;justify-content:center;font-size:0.78rem}.steps li.current{color:var(--bf-wizard-color);font-weight:600}.steps li.current .dot{background:var(--bf-wizard-accent);color:#fff;border-color:var(--bf-wizard-accent)}.steps li.done .dot{border-color:var(--bf-wizard-accent);color:var(--bf-wizard-accent)}.content.is-empty{display:none}.actions{display:flex;justify-content:space-between;gap:0.6rem}.actions button{border:1px solid var(--bf-wizard-border-color);background:var(--bf-theme-surface-1, #fff);color:inherit;border-radius:7px;padding:0.35rem 0.7rem;cursor:pointer}.actions button:disabled{opacity:0.55;cursor:not-allowed}.root[data-mode='stepper'] .content,.root[data-mode='stepper'] .actions{display:none}`;

const BfWizard$1 = /*@__PURE__*/ proxyCustomElement(class BfWizard extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    observer;
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
    async next() {
        this.el.setAttribute('step', `${Math.min(this.items().length, this.stepValue() + 1)}`);
    }
    async prev() {
        this.el.setAttribute('step', `${Math.max(1, this.stepValue() - 1)}`);
    }
    get step() {
        return this.stepValue();
    }
    set step(next) {
        this.el.setAttribute('step', `${next}`);
    }
    mode() {
        const mode = (this.el.getAttribute('mode') || '').toLowerCase();
        if (mode === 'stepper' || this.el.hasAttribute('stepper')) {
            return 'stepper';
        }
        return 'wizard';
    }
    items() {
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
    stepValue() {
        const parsed = Number.parseInt(this.el.getAttribute('step') || '1', 10);
        if (!Number.isFinite(parsed) || parsed < 1) {
            return 1;
        }
        return Math.min(parsed, this.items().length);
    }
    emitChange() {
        this.el.dispatchEvent(new CustomEvent('bf-change', {
            bubbles: true,
            composed: true,
            detail: {
                step: this.stepValue(),
                mode: this.mode(),
            },
        }));
    }
    renderSteps(items, current) {
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
            }
            else if (stepNumber < current) {
                li.classList.add('done');
            }
            li.innerHTML = `<span class="dot">${stepNumber}</span><span class="label">${label}</span>`;
            ol.append(li);
        });
    }
    syncPanels(current) {
        const content = this.el.shadowRoot?.querySelector('.content');
        const panels = Array.from(this.el.children).filter((child) => child.tagName.toLowerCase() === 'section');
        if (!(content instanceof H)) {
            return;
        }
        if (!panels.length) {
            content.classList.add('is-empty');
            return;
        }
        content.classList.remove('is-empty');
        panels.forEach((panel, index) => {
            panel.hidden = index + 1 !== current;
        });
    }
    onPrevClick = async () => {
        await this.prev();
        this.emitChange();
    };
    onNextClick = async () => {
        await this.next();
        this.emitChange();
    };
    sync() {
        const root = this.el.shadowRoot?.querySelector('.root');
        const prevBtn = this.el.shadowRoot?.querySelector('.prev');
        const nextBtn = this.el.shadowRoot?.querySelector('.next');
        if (!(root instanceof H) ||
            !(prevBtn instanceof HTMLButtonElement) ||
            !(nextBtn instanceof HTMLButtonElement)) {
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
        return (h(Host, { key: '7448391419d2787701e08d7638ee896190db1f29' }, h("div", { key: 'd58a3098122920f3ac32f55886069d5a5cdaf396', class: "root", part: "root" }, h("ol", { key: 'ba0eca14e66c2b9c9ac63071743764fa42f815f1', class: "steps", part: "steps" }), h("div", { key: '26111c9908cb94328726e26f10f0cc4a579fdd1c', class: "content", part: "content" }, h("slot", { key: 'caa1a139aa9d08b6da2ef254695adf2fc2d032a8', onSlotchange: () => this.sync() })), h("div", { key: '40b3f3e5a542c4782cf6c3a93177aa370e54926a', class: "actions", part: "actions" }, h("button", { key: '3a49db9d0c23a56bddb5966bae98539837d8656c', class: "prev", type: "button", part: "prev", onClick: this.onPrevClick }, "Back"), h("button", { key: 'c43547595934b001bb1a9fa2e4b68f9d3d0746ae', class: "next", type: "button", part: "next", onClick: this.onNextClick }, "Next")))));
    }
    static get style() { return bfWizardCss(); }
}, [257, "bf-wizard", {
        "next": [64],
        "prev": [64]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-wizard"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-wizard":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfWizard$1);
            }
            break;
    } });
}

const BfWizard = BfWizard$1;
const defineCustomElement = defineCustomElement$1;

export { BfWizard, defineCustomElement };
