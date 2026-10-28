import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfListCss = () => `:host{--bf-list-font:var(--bf-theme-font-family, inherit);--bf-list-radius:var(--bf-theme-radius-md, 8px);--bf-list-border-width:var(--bf-theme-border-width, 1px);--bf-list-border-style:var(--bf-theme-border-style, solid);--bf-list-border-color:var(--bf-theme-list-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-list-bg:var(--bf-theme-list-bg, var(--bf-theme-surface-1, #ffffff));--bf-list-color:var(--bf-theme-list-color, var(--bf-theme-text-1, #0f172a));--bf-list-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-list-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-list-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-list-font);color:var(--bf-list-color)}.root{background:var(--bf-list-bg);color:var(--bf-list-color);border-width:var(--bf-list-border-width);border-style:var(--bf-list-border-style);border-color:var(--bf-list-border-color);border-radius:var(--bf-list-radius);padding:var(--bf-list-padding-y) var(--bf-list-padding-x);transition:var(--bf-list-transition)}.root ::slotted([item]){display:block;padding:0.45rem 0.6rem;border-radius:0.4rem;cursor:pointer}.root ::slotted([item]:hover){background:var(--bf-theme-surface-2, #f8fafc)}`;

const BfList$1 = /*@__PURE__*/ proxyCustomElement(class BfList extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    onSlotChange = () => {
        const slot = this.el.shadowRoot?.querySelector('slot');
        if (!(slot instanceof HTMLSlotElement)) {
            return;
        }
        const items = slot
            .assignedElements({ flatten: true })
            .filter((element) => element.hasAttribute('item'));
        items.forEach((item, index) => {
            const elitem = item;
            elitem.setAttribute('role', elitem.getAttribute('role') || 'listitem');
            if (!elitem.hasAttribute('tabindex')) {
                elitem.setAttribute('tabindex', '0');
            }
            if (elitem.dataset.bfListBound === 'true') {
                return;
            }
            elitem.dataset.bfListBound = 'true';
            elitem.addEventListener('click', () => this.emitSelect(elitem, index));
            elitem.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.emitSelect(elitem, index);
                }
            });
        });
    };
    emitSelect(item, index) {
        this.el.dispatchEvent(new CustomEvent('bf-select', {
            bubbles: true,
            composed: true,
            detail: {
                index,
                id: item.id || '',
                value: item.getAttribute('value') || item.textContent?.trim() || '',
            },
        }));
    }
    componentDidLoad() {
        this.onSlotChange();
    }
    render() {
        return (h(Host, { key: '869672c04d54e2ef195e58533981e29eff522b0c' }, h("div", { key: '931ba48a3d385764ca6524d704c9a4ad37979b66', class: "root", part: "root" }, h("slot", { key: '546838241bbd857687802f595136755317291643', onSlotchange: this.onSlotChange }))));
    }
    static get style() { return bfListCss(); }
}, [257, "bf-list"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-list"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-list":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfList$1);
            }
            break;
    } });
}

const BfList = BfList$1;
const defineCustomElement = defineCustomElement$1;

export { BfList, defineCustomElement };
