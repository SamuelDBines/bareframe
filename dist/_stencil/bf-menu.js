import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfMenuCss = () => `:host{--bf-menu-font:var(--bf-theme-font-family, inherit);--bf-menu-radius:var(--bf-theme-radius-md, 8px);--bf-menu-border-width:var(--bf-theme-border-width, 1px);--bf-menu-border-style:var(--bf-theme-border-style, solid);--bf-menu-border-color:var(--bf-theme-menu-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-menu-bg:var(--bf-theme-menu-bg, var(--bf-theme-surface-1, #ffffff));--bf-menu-color:var(--bf-theme-menu-color, var(--bf-theme-text-1, #0f172a));--bf-menu-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-menu-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-menu-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-menu-font);color:var(--bf-menu-color)}.root{background:var(--bf-menu-bg);color:var(--bf-menu-color);border-width:var(--bf-menu-border-width);border-style:var(--bf-menu-border-style);border-color:var(--bf-menu-border-color);border-radius:var(--bf-menu-radius);padding:var(--bf-menu-padding-y) var(--bf-menu-padding-x);transition:var(--bf-menu-transition)}.root[data-variant='context'][data-open='false']{display:none}.root[data-variant='context']{min-width:11rem;box-shadow:0 14px 36px rgba(2, 6, 23, 0.2)}.root ::slotted([item]){display:block;padding:0.45rem 0.6rem;border-radius:0.4rem;cursor:pointer}.root ::slotted([item]:hover){background:var(--bf-theme-surface-2, #f8fafc)}`;

const BfMenu$1 = /*@__PURE__*/ proxyCustomElement(class BfMenu extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    observer;
    attrObserver;
    ctxHandler;
    ctxTarget;
    connectedCallback() {
        document.addEventListener('click', this.onDocumentClick);
        this.observer = new MutationObserver(() => this.bindContextTarget());
        this.observer.observe(this.el, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['variant', 'context', 'for', 'open', 'x', 'y'],
        });
        this.attrObserver = new MutationObserver(() => this.sync());
        this.attrObserver.observe(this.el, {
            attributes: true,
            attributeFilter: ['variant', 'open', 'x', 'y', 'context', 'for'],
        });
        this.bindContextTarget();
    }
    disconnectedCallback() {
        document.removeEventListener('click', this.onDocumentClick);
        this.observer?.disconnect();
        this.attrObserver?.disconnect();
        this.unbindCtx();
    }
    async open() {
        this.el.setAttribute('open', '');
    }
    async close() {
        this.el.removeAttribute('open');
    }
    async toggle() {
        if (this.el.hasAttribute('open')) {
            await this.close();
            return;
        }
        await this.open();
    }
    isContextMode() {
        const variant = (this.el.getAttribute('variant') || '').toLowerCase();
        return variant === 'context' || this.el.hasAttribute('context');
    }
    unbindCtx() {
        if (this.ctxTarget &&
            this.ctxTarget instanceof H &&
            this.ctxHandler) {
            this.ctxTarget.removeEventListener('contextmenu', this.ctxHandler);
        }
        this.ctxTarget = null;
        this.ctxHandler = undefined;
    }
    bindContextTarget() {
        this.unbindCtx();
        if (!this.isContextMode()) {
            return;
        }
        const targetId = this.el.getAttribute('for');
        this.ctxTarget = targetId
            ? document.getElementById(targetId)
            : this.el.parentElement;
        if (!(this.ctxTarget instanceof H)) {
            return;
        }
        this.ctxHandler = (event) => {
            event.preventDefault();
            this.el.setAttribute('x', `${event.clientX}`);
            this.el.setAttribute('y', `${event.clientY}`);
            this.el.setAttribute('open', '');
            this.sync();
        };
        this.ctxTarget.addEventListener('contextmenu', this.ctxHandler);
    }
    onDocumentClick = (event) => {
        if (!this.isContextMode() || !this.el.hasAttribute('open')) {
            return;
        }
        const path = event.composedPath();
        if (path.includes(this.el)) {
            return;
        }
        this.el.removeAttribute('open');
    };
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
            elitem.setAttribute('role', elitem.getAttribute('role') || 'menuitem');
            if (!elitem.hasAttribute('tabindex')) {
                elitem.setAttribute('tabindex', '0');
            }
            if (elitem.dataset.bfMenuBound === 'true') {
                return;
            }
            elitem.dataset.bfMenuBound = 'true';
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
        if (this.isContextMode()) {
            this.el.removeAttribute('open');
        }
    }
    sync() {
        const root = this.el.shadowRoot?.querySelector('.root');
        if (!(root instanceof H)) {
            return;
        }
        const context = this.isContextMode();
        root.setAttribute('data-variant', context ? 'context' : 'menu');
        root.setAttribute('data-open', this.el.hasAttribute('open') ? 'true' : 'false');
        if (context) {
            this.el.style.position = 'fixed';
            this.el.style.left = `${Number.parseFloat(this.el.getAttribute('x') || '0') || 0}px`;
            this.el.style.top = `${Number.parseFloat(this.el.getAttribute('y') || '0') || 0}px`;
            this.el.style.zIndex = '1300';
        }
        else {
            this.el.style.position = '';
            this.el.style.left = '';
            this.el.style.top = '';
            this.el.style.zIndex = '';
        }
    }
    componentDidRender() {
        this.sync();
    }
    render() {
        return (h(Host, { key: '566459d9a96e926bf61a36546bad7a24604f6ef8' }, h("div", { key: '5605b5063829f5be87f2ccfebbfbc1dfc8685e41', class: "root", part: "root" }, h("slot", { key: '1db6ad6bbf32d4ffdcb964fab2f7a85066d53a82', onSlotchange: this.onSlotChange }))));
    }
    static get style() { return bfMenuCss(); }
}, [257, "bf-menu", {
        "open": [64],
        "close": [64],
        "toggle": [64]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-menu"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-menu":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfMenu$1);
            }
            break;
    } });
}

const BfMenu = BfMenu$1;
const defineCustomElement = defineCustomElement$1;

export { BfMenu, defineCustomElement };
