import { p as proxyCustomElement, t as transformTag, H, h, c as Host } from './p-DAXdczoz.js';

const bfAccordionCss = () => `:host{--bf-accordion-font:var(--bf-theme-font-family, inherit);--bf-accordion-gap:var(--bf-theme-space-2, 0.5rem);--bf-accordion-radius:var(--bf-theme-radius-md, 8px);--bf-accordion-border-width:var(--bf-theme-border-width, 1px);--bf-accordion-border-style:var(--bf-theme-border-style, solid);--bf-accordion-border-color:var(--bf-theme-accordion-border-color, #cbd5e1);--bf-accordion-bg:var(--bf-theme-accordion-bg, #ffffff);--bf-accordion-color:var(--bf-theme-accordion-color, #0f172a);--bf-accordion-trigger-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-accordion-trigger-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-accordion-panel-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-accordion-panel-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-accordion-trigger-bg:var(--bf-theme-accordion-trigger-bg, #f8fafc);--bf-accordion-trigger-hover-bg:var(   --bf-theme-accordion-trigger-hover-bg,   #f1f5f9  );--bf-accordion-trigger-open-bg:var(   --bf-theme-accordion-trigger-open-bg,   #eff6ff  );--bf-accordion-trigger-color:var(--bf-theme-accordion-trigger-color, #0f172a);--bf-accordion-panel-bg:var(--bf-theme-accordion-panel-bg, #ffffff);--bf-accordion-focus-ring-width:var(--bf-theme-focus-ring-width, 2px);--bf-accordion-focus-ring-style:var(--bf-theme-focus-ring-style, solid);--bf-accordion-focus-ring-color:var(--bf-theme-focus-ring-color, #93c5fd);--bf-accordion-focus-ring-offset:var(--bf-theme-focus-ring-offset, 2px);--bf-accordion-chevron-color:var(--bf-theme-accordion-chevron-color, #475569);--bf-accordion-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-accordion-font);color:var(--bf-accordion-color)}.accordion{display:grid;gap:var(--bf-accordion-gap)}.accordion-item{border-width:var(--bf-accordion-border-width);border-style:var(--bf-accordion-border-style);border-color:var(--bf-accordion-border-color);border-radius:var(--bf-accordion-radius);background:var(--bf-accordion-bg);overflow:clip}.accordion-trigger{list-style:none;cursor:pointer;padding:var(--bf-accordion-trigger-padding-y)   var(--bf-accordion-trigger-padding-x);background:var(--bf-accordion-trigger-bg);color:var(--bf-accordion-trigger-color);transition:var(--bf-accordion-transition);display:flex;align-items:center;justify-content:space-between}.accordion-trigger::-webkit-details-marker{display:none}.accordion-trigger::after{content:'+';color:var(--bf-accordion-chevron-color);font-weight:700;line-height:1}.accordion-item[open]>.accordion-trigger::after{content:'-'}.accordion-trigger:hover{background:var(--bf-accordion-trigger-hover-bg)}.accordion-trigger:focus-visible{outline-width:var(--bf-accordion-focus-ring-width);outline-style:var(--bf-accordion-focus-ring-style);outline-color:var(--bf-accordion-focus-ring-color);outline-offset:calc(var(--bf-accordion-focus-ring-offset) * -1)}.accordion-item[open]>.accordion-trigger{background:var(--bf-accordion-trigger-open-bg)}.accordion-panel{padding:var(--bf-accordion-panel-padding-y) var(--bf-accordion-panel-padding-x);background:var(--bf-accordion-panel-bg);border-top-width:var(--bf-accordion-border-width);border-top-style:var(--bf-accordion-border-style);border-top-color:var(--bf-accordion-border-color)}.accordion-panel ::slotted(*){margin:0}`;

const BfAccordion$1 = /*@__PURE__*/ proxyCustomElement(class BfAccordion extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    accordion;
    detailsArr = [];
    itemIds = [];
    built = false;
    mo;
    connectedCallback() {
        this.mo = new MutationObserver(() => {
            const v = this.el.getAttribute('active-id');
            if (v) {
                void this.openItem(v);
            }
        });
        this.mo.observe(this.el, {
            attributes: true,
            attributeFilter: ['active-id'],
        });
    }
    disconnectedCallback() {
        this.mo?.disconnect();
    }
    multiple() {
        return this.el.hasAttribute('multiple');
    }
    async openItem(itemId) {
        const details = this.detailsArr.find((d) => d.dataset.itemId === itemId);
        if (details) {
            details.open = true;
        }
    }
    async closeItem(itemId) {
        const details = this.detailsArr.find((d) => d.dataset.itemId === itemId);
        if (details) {
            details.open = false;
        }
    }
    async toggleItem(itemId) {
        const details = this.detailsArr.find((d) => d.dataset.itemId === itemId);
        if (details) {
            details.open = !details.open;
        }
    }
    emitToggle(index, itemId, title, open) {
        this.el.dispatchEvent(new CustomEvent('bf-accordion-toggle', {
            bubbles: true,
            composed: true,
            detail: { index, id: itemId, title, open },
        }));
    }
    ensureItemId(item, index) {
        const explicit = item.getAttribute('id');
        if (explicit && !this.itemIds.includes(explicit)) {
            return explicit;
        }
        const hostId = this.el.id || this.el.getAttribute('id') || 'bf-accordion';
        let counter = index + 1;
        let candidate = `${hostId}-item-${counter}`;
        while (this.itemIds.includes(candidate) ||
            (this.el.querySelector(`#${CSS.escape(candidate)}`) &&
                this.el.querySelector(`#${CSS.escape(candidate)}`) !== item)) {
            counter += 1;
            candidate = `${hostId}-item-${counter}`;
        }
        item.setAttribute('id', candidate);
        return candidate;
    }
    rebuild() {
        const sr = this.el.shadowRoot;
        if (!sr) {
            return;
        }
        this.built = true;
        this.detailsArr = [];
        this.itemIds = [];
        this.accordion?.replaceChildren?.();
        const container = sr.querySelector('.accordion');
        if (!(container instanceof H)) {
            return;
        }
        this.accordion = container;
        container.innerHTML = '';
        container.setAttribute('part', 'accordion');
        const items = Array.from(this.el.children).filter((n) => n.nodeType === Node.ELEMENT_NODE);
        items.forEach((item, index) => {
            const title = item.getAttribute('title') ||
                item.getAttribute('data-title') ||
                `Section ${index + 1}`;
            const slotName = `item-${index + 1}`;
            const openByDefault = item.hasAttribute('open');
            const itemId = this.ensureItemId(item, index);
            item.setAttribute('slot', slotName);
            const details = document.createElement('details');
            details.className = 'accordion-item';
            details.setAttribute('part', 'item');
            details.dataset.itemId = itemId;
            details.open = openByDefault;
            const summary = document.createElement('summary');
            summary.className = 'accordion-trigger';
            summary.setAttribute('part', 'trigger');
            summary.textContent = title;
            const panel = document.createElement('div');
            panel.className = 'accordion-panel';
            panel.setAttribute('part', 'panel');
            const slot = document.createElement('slot');
            slot.name = slotName;
            panel.append(slot);
            details.append(summary, panel);
            container.append(details);
            this.detailsArr.push(details);
            this.itemIds.push(itemId);
            details.addEventListener('toggle', () => {
                if (!this.multiple() && details.open) {
                    this.detailsArr.forEach((other) => {
                        if (other !== details) {
                            other.open = false;
                        }
                    });
                }
                this.emitToggle(index, itemId, title, details.open);
            });
        });
        const aid = this.el.getAttribute('active-id');
        if (aid) {
            void this.openItem(aid);
        }
    }
    componentDidRender() {
        if (!this.built) {
            this.rebuild();
        }
    }
    render() {
        return (h(Host, { key: '348e8d1ceccc7f09db92cc936ca6320f90b16733' }, h("div", { key: 'f374664412ba33582ad7a0960bb18c26e6ea4fcb', class: "accordion", part: "accordion" })));
    }
    static get style() { return bfAccordionCss(); }
}, [257, "bf-accordion", {
        "openItem": [64],
        "closeItem": [64],
        "toggleItem": [64]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-accordion"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-accordion":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfAccordion$1);
            }
            break;
    } });
}

const BfAccordion = BfAccordion$1;
const defineCustomElement = defineCustomElement$1;

export { BfAccordion, defineCustomElement };
