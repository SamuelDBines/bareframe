import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfDropdownCss = () => `:host{--bf-dropdown-font:var(--bf-theme-font-family, inherit);--bf-dropdown-radius:var(--bf-theme-radius-md, 8px);--bf-dropdown-border-width:var(--bf-theme-border-width, 1px);--bf-dropdown-border-style:var(--bf-theme-border-style, solid);--bf-dropdown-border-color:var(--bf-theme-dropdown-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-dropdown-bg:var(--bf-theme-dropdown-bg, var(--bf-theme-surface-1, #ffffff));--bf-dropdown-color:var(--bf-theme-dropdown-color, var(--bf-theme-text-1, #0f172a));--bf-dropdown-muted:var(--bf-theme-text-2, #475569);--bf-dropdown-accent:var(--bf-theme-button-primary-bg, #2563eb);--bf-dropdown-padding-y:var(--bf-theme-space-2, 0.45rem);--bf-dropdown-padding-x:var(--bf-theme-space-3, 0.75rem);--bf-dropdown-shadow:0 14px 28px -18px rgba(2, 6, 23, 0.45);--bf-dropdown-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease),   transform 120ms ease,   opacity 120ms ease;display:inline-block;font:var(--bf-dropdown-font);color:var(--bf-dropdown-color);position:relative}.root{position:relative;color:var(--bf-dropdown-color)}.toggle{display:inline-flex;align-items:center;gap:0.45rem;border:0;border-radius:var(--bf-dropdown-radius);background:transparent;color:var(--bf-dropdown-color);padding:0;cursor:pointer;font:inherit;transition:var(--bf-dropdown-transition)}.root[data-bordered='true'] .toggle{border-width:var(--bf-dropdown-border-width);border-style:var(--bf-dropdown-border-style);border-color:var(--bf-dropdown-border-color);background:var(--bf-dropdown-bg);padding:var(--bf-dropdown-padding-y) var(--bf-dropdown-padding-x)}.root[data-bordered='true'] slot[name='trigger']::slotted(*){border:none !important;box-shadow:none !important;background:transparent !important}.toggle:hover{color:color-mix(in srgb, var(--bf-dropdown-accent) 70%, var(--bf-dropdown-color))}.toggle:focus-visible{outline:none;box-shadow:0 0 0 2px color-mix(in srgb, var(--bf-dropdown-accent) 36%, transparent)}.toggle-label{display:inline-flex;align-items:center;gap:0.35rem;min-height:1.75rem}.caret{font-size:0.75rem;color:var(--bf-dropdown-muted);transition:transform 140ms ease}.root[data-open='true'] .caret{transform:rotate(180deg)}.menu{position:absolute;min-width:100%;max-width:320px;z-index:60;border-width:var(--bf-dropdown-border-width);border-style:var(--bf-dropdown-border-style);border-color:var(--bf-dropdown-border-color);border-radius:calc(var(--bf-dropdown-radius) + 2px);background:var(--bf-dropdown-bg);box-shadow:var(--bf-dropdown-shadow);padding:0.35rem;overflow:auto;max-height:min(340px, 70vh);opacity:0;transform:translateY(-4px);pointer-events:none;transition:var(--bf-dropdown-transition)}.root[data-open='true'] .menu{opacity:1;transform:translateY(0);pointer-events:auto}.root[data-position='bottom-start'] .menu{left:0;top:calc(100% + 0.35rem)}.root[data-position='bottom-end'] .menu{right:0;top:calc(100% + 0.35rem)}.root[data-position='top-start'] .menu{left:0;bottom:calc(100% + 0.35rem)}.root[data-position='top-end'] .menu{right:0;bottom:calc(100% + 0.35rem)}.menu ::slotted([data-bf-dropdown-item]),.menu ::slotted([item]),.menu ::slotted(a),.menu ::slotted(button){display:flex;align-items:center;width:100%;gap:0.45rem;border:0;background:transparent;color:var(--bf-dropdown-color);text-decoration:none;border-radius:calc(var(--bf-dropdown-radius) - 2px);padding:0.5rem 0.6rem;cursor:pointer;text-align:left;font:inherit}.menu ::slotted(*)+::slotted(*){margin-top:0.15rem}.menu ::slotted([data-bf-dropdown-item]:hover),.menu ::slotted([item]:hover),.menu ::slotted(a:hover),.menu ::slotted(button:hover){background:color-mix(in srgb, var(--bf-dropdown-accent) 12%, transparent)}.menu ::slotted([data-bf-dropdown-item]:focus-visible),.menu ::slotted([item]:focus-visible),.menu ::slotted(a:focus-visible),.menu ::slotted(button:focus-visible){outline:none;box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--bf-dropdown-accent) 42%, transparent)}`;

const BfDropdown$1 = /*@__PURE__*/ proxyCustomElement(class BfDropdown extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    observer;
    toggleEl;
    menuEl;
    triggerSlotEl;
    contentSlotEl;
    boundDocClick = this.onDocumentClick.bind(this);
    connectedCallback() {
        document.addEventListener('click', this.boundDocClick);
        this.observer = new MutationObserver(() => this.syncDom());
        this.observer.observe(this.el, {
            attributes: true,
            attributeFilter: ['open', 'position', 'border'],
        });
    }
    disconnectedCallback() {
        document.removeEventListener('click', this.boundDocClick);
        this.observer?.disconnect();
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
    assignSlots() {
        const cs = this.contentSlotEl;
        const ts = this.triggerSlotEl;
        if (!cs || !ts) {
            return;
        }
        const candidates = Array.from(this.el.children).filter((element) => element.nodeType === Node.ELEMENT_NODE);
        if (!candidates.length) {
            return;
        }
        const hasTrigger = candidates.some((e) => e.getAttribute('slot') === 'trigger');
        const hasContent = candidates.some((e) => e.getAttribute('slot') === 'content');
        if (!hasTrigger) {
            candidates[0].setAttribute('slot', 'trigger');
        }
        if (!hasContent) {
            for (let i = 1; i < candidates.length; i += 1) {
                candidates[i].setAttribute('slot', 'content');
            }
        }
    }
    actionableItemsComputed() {
        const root = this.contentSlotEl ?? this.el.shadowRoot?.querySelector('slot[name="content"]');
        if (!(root instanceof HTMLSlotElement)) {
            return [];
        }
        this.contentSlotEl = root;
        const assigned = root.assignedElements({ flatten: true });
        const items = [];
        for (const element of Array.from(assigned)) {
            if (!(element instanceof H)) {
                continue;
            }
            if (element.matches('a,button,[item],[role="menuitem"],[tabindex]')) {
                items.push(element);
            }
            items.push(...Array.from(element.querySelectorAll('a,button,[item],[role="menuitem"],[tabindex]')));
        }
        return items;
    }
    decorateItems() {
        const items = this.actionableItemsComputed();
        for (const item of items) {
            item.setAttribute('data-bf-dropdown-item', '');
            if (item.hasAttribute('item') && !item.hasAttribute('role')) {
                item.setAttribute('role', 'menuitem');
            }
            if (!item.hasAttribute('tabindex')) {
                item.setAttribute('tabindex', '0');
            }
            if (item.dataset.bfDropdownStyled !== 'true') {
                item.style.display = 'flex';
                item.style.alignItems = 'center';
                item.style.width = '100%';
                item.style.gap = '0.45rem';
                item.style.border = '0';
                item.style.background = 'transparent';
                item.style.borderRadius = '0.4rem';
                item.style.padding = '0.5rem 0.6rem';
                item.style.cursor = 'pointer';
                item.style.textAlign = 'left';
                item.style.font = 'inherit';
                item.style.color = 'inherit';
                item.style.textDecoration = 'none';
                item.dataset.bfDropdownStyled = 'true';
            }
        }
    }
    focusFirstItem() {
        const items = this.actionableItemsComputed();
        const first = items.find((item) => !item.hasAttribute('disabled'));
        first?.focus();
    }
    emitSelect(target) {
        const value = target.getAttribute('value') || target.textContent?.trim() || '';
        this.el.dispatchEvent(new CustomEvent('bf-select', {
            bubbles: true,
            composed: true,
            detail: {
                id: target.id || '',
                value,
            },
        }));
    }
    onContentClick = (event) => {
        const from = event.target;
        if (!from || from.nodeType !== Node.ELEMENT_NODE) {
            return;
        }
        const closest = from.closest('[data-bf-dropdown-item]');
        if (!(closest instanceof H)) {
            return;
        }
        this.emitSelect(closest);
        void this.close();
    };
    onToggleClick = () => {
        void this.toggle();
        if (this.el.hasAttribute('open')) {
            requestAnimationFrame(() => this.focusFirstItem());
        }
    };
    onDocumentClick(event) {
        if (!this.el.hasAttribute('open')) {
            return;
        }
        const path = event.composedPath();
        if (path.includes(this.el)) {
            return;
        }
        void this.close();
    }
    onKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            void this.toggle();
            if (this.el.hasAttribute('open')) {
                requestAnimationFrame(() => this.focusFirstItem());
            }
            return;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            void this.open();
            requestAnimationFrame(() => this.focusFirstItem());
            return;
        }
        if (event.key === 'Escape') {
            void this.close();
            const t = this.toggleEl ?? this.el.shadowRoot?.querySelector('.toggle');
            t?.focus();
        }
    };
    onSlotChange = () => {
        this.assignSlots();
        this.decorateItems();
    };
    position() {
        const value = (this.el.getAttribute('position') || 'bottom-start').toLowerCase();
        if (['bottom-start', 'bottom-end', 'top-start', 'top-end'].includes(value)) {
            return value;
        }
        return 'bottom-start';
    }
    syncDom() {
        const root = this.el.shadowRoot?.querySelector('.root') ?? undefined;
        const toggle = this.toggleEl ?? this.el.shadowRoot?.querySelector('.toggle');
        const menu = this.menuEl ?? this.el.shadowRoot?.querySelector('.menu');
        this.toggleEl = toggle instanceof H ? toggle : undefined;
        this.menuEl = menu instanceof H ? menu : null;
        if (!(root instanceof H) || !(toggle instanceof H) || !(menu instanceof H)) {
            return;
        }
        const open = this.el.hasAttribute('open');
        root.setAttribute('data-open', open ? 'true' : 'false');
        root.setAttribute('data-position', this.position());
        root.setAttribute('data-bordered', this.el.hasAttribute('border') ? 'true' : 'false');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-pressed', String(open));
        menu.hidden = !open;
    }
    bindChromeOnce() {
        const sr = this.el.shadowRoot;
        const toggle = sr?.querySelector('.toggle');
        const menu = sr?.querySelector('.menu');
        const ts = sr?.querySelector('slot[name="trigger"]');
        const cs = sr?.querySelector('slot[name="content"]');
        this.triggerSlotEl = ts instanceof HTMLSlotElement ? ts : null;
        this.contentSlotEl = cs instanceof HTMLSlotElement ? cs : null;
        if (toggle instanceof H && toggle.dataset.bfBound !== 'true') {
            toggle.dataset.bfBound = 'true';
            toggle.addEventListener('click', this.onToggleClick);
            toggle.addEventListener('keydown', this.onKeyDown);
            this.toggleEl = toggle;
        }
        if (menu instanceof H && menu.dataset.bfBound !== 'true') {
            menu.dataset.bfBound = 'true';
            menu.addEventListener('click', this.onContentClick);
            this.menuEl = menu;
        }
        if (ts instanceof HTMLSlotElement && ts.dataset.bfSlotBound !== 'true') {
            ts.dataset.bfSlotBound = 'true';
            ts.addEventListener('slotchange', this.onSlotChange);
        }
        if (cs instanceof HTMLSlotElement && cs.dataset.bfSlotBound !== 'true') {
            cs.dataset.bfSlotBound = 'true';
            cs.addEventListener('slotchange', this.onSlotChange);
        }
    }
    componentDidRender() {
        this.bindChromeOnce();
        this.assignSlots();
        this.decorateItems();
        this.syncDom();
    }
    render() {
        return (h(Host, { key: '1a902e4e674f3f7e85350229df507887146f9fca' }, h("div", { key: '5a4a34cc9fc77e95c6d750693ef841b7a1a93682', class: "root", part: "root" }, h("div", { key: 'cefed0181d394fef409349de202ec7f165b69ef9', class: "toggle", part: "toggle", role: "button", tabIndex: 0, "aria-haspopup": "menu", "aria-expanded": "false" }, h("span", { key: '24bffc644904e6105adbc5a0008b5220546cb228', class: "toggle-label" }, h("slot", { key: '47193b4592057f50b4530b89e436092f0db7db85', name: "trigger" }, "Open")), h("span", { key: 'a1ebf796a069a5b63c6abdbd49f2066311948025', class: "caret", "aria-hidden": "true" }, "\u25BE")), h("div", { key: '2431a50c25834b98e122c24140f0f131936eb251', class: "menu", part: "menu", role: "menu" }, h("slot", { key: '2ce262a4707ad31cd4b5453519a51865be1dd4e6', name: "content" })))));
    }
    static get style() { return bfDropdownCss(); }
}, [257, "bf-dropdown", {
        "open": [64],
        "close": [64],
        "toggle": [64]
    }]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-dropdown"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-dropdown":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfDropdown$1);
            }
            break;
    } });
}

const BfDropdown = BfDropdown$1;
const defineCustomElement = defineCustomElement$1;

export { BfDropdown, defineCustomElement };
