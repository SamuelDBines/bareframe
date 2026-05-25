import { p as proxyCustomElement, H, h, c as Host, t as transformTag } from './p-DAXdczoz.js';

const bfAutocompleteCss = () => `:host{--bf-autocomplete-font:var(--bf-theme-font-family, inherit);--bf-autocomplete-radius:var(--bf-theme-radius-md, 8px);--bf-autocomplete-border-width:var(--bf-theme-border-width, 1px);--bf-autocomplete-border-style:var(--bf-theme-border-style, solid);--bf-autocomplete-border-color:var(   --bf-theme-autocomplete-border-color,   var(--bf-theme-border-1, #d1d5db)  );--bf-autocomplete-bg:var(   --bf-theme-autocomplete-bg,   var(--bf-theme-surface-1, #ffffff)  );--bf-autocomplete-color:var(   --bf-theme-autocomplete-color,   var(--bf-theme-text-1, #111827)  );--bf-autocomplete-placeholder:var(--bf-theme-text-2, #6b7280);--bf-autocomplete-focus:var(--bf-theme-focus-ring-color, #9ca3af);--bf-autocomplete-list-max-height:220px;--bf-autocomplete-item-hover-bg:var(--bf-theme-surface-2, #f3f4f6);--bf-autocomplete-item-active-bg:var(--bf-theme-surface-2, #e5e7eb);--bf-autocomplete-shadow:0 8px 26px rgba(15, 23, 42, 0.12);display:inline-block;width:min(100%, 420px);font:var(--bf-autocomplete-font)}.root{position:relative}.input{width:100%;box-sizing:border-box;font:inherit;color:var(--bf-autocomplete-color);background:var(--bf-autocomplete-bg);border-width:var(--bf-autocomplete-border-width);border-style:var(--bf-autocomplete-border-style);border-color:var(--bf-autocomplete-border-color);border-radius:var(--bf-autocomplete-radius);padding:0.62rem 0.8rem;outline:none}.input::placeholder{color:var(--bf-autocomplete-placeholder)}.input:focus-visible{border-color:var(--bf-autocomplete-focus);box-shadow:0 0 0 2px color-mix(in srgb, var(--bf-autocomplete-focus) 30%, transparent)}.list{position:absolute;top:calc(100% + 0.35rem);left:0;right:0;margin:0;padding:0.35rem;list-style:none;border-width:var(--bf-autocomplete-border-width);border-style:var(--bf-autocomplete-border-style);border-color:var(--bf-autocomplete-border-color);border-radius:calc(var(--bf-autocomplete-radius) - 2px);background:var(--bf-autocomplete-bg);max-height:var(--bf-autocomplete-list-max-height);overflow:auto;box-shadow:var(--bf-autocomplete-shadow);z-index:20}.item{padding:0.48rem 0.55rem;border-radius:calc(var(--bf-autocomplete-radius) - 4px);cursor:pointer}.item:hover{background:var(--bf-autocomplete-item-hover-bg)}.item.active{background:var(--bf-autocomplete-item-active-bg)}.item.empty{cursor:default;color:var(--bf-autocomplete-placeholder)}`;

const BfAutocomplete$1 = /*@__PURE__*/ proxyCustomElement(class BfAutocomplete extends H {
    constructor(registerHost) {
        super();
        if (registerHost !== false) {
            this.__registerHost();
        }
        this.__attachShadow();
    }
    get el() { return this; }
    booted = false;
    listId = `ac-list-${Math.random().toString(36).slice(2, 10)}`;
    items = [];
    filtered = [];
    activeIndex = -1;
    listOpen = false;
    observer;
    inputEl;
    listEl;
    boundDocClick = (event) => this.onDocumentClick(event);
    connectedCallback() {
        document.addEventListener('click', this.boundDocClick);
        this.observer = new MutationObserver(() => {
            this.refreshFromAttrs();
        });
        this.observer.observe(this.el, {
            attributes: true,
            attributeFilter: ['options', 'options-csv'],
        });
    }
    disconnectedCallback() {
        document.removeEventListener('click', this.boundDocClick);
        this.observer?.disconnect();
    }
    refreshFromAttrs() {
        this.cacheDom();
        this.setItemsFromAttributes();
        this.filtered = [...this.items];
        this.renderList();
    }
    cacheDom() {
        const sr = this.el.shadowRoot;
        this.inputEl = sr?.querySelector('.input') ?? undefined;
        this.listEl = sr?.querySelector('.list') ?? null;
    }
    setItemsFromAttributes() {
        const json = this.el.getAttribute('options');
        if (json) {
            try {
                const parsed = JSON.parse(json);
                if (Array.isArray(parsed)) {
                    this.items = parsed.map((item) => String(item));
                    return;
                }
            }
            catch {
                //
            }
        }
        const csv = this.el.getAttribute('options-csv');
        if (csv) {
            this.items = csv
                .split(',')
                .map((part) => part.trim())
                .filter(Boolean);
            return;
        }
        this.items = [
            'Accessibility',
            'Accordion',
            'Autocomplete',
            'Button',
            'Card',
            'Color Picker',
            'Data Grid',
            'Dropdown',
            'Modal',
            'Typography',
        ];
    }
    filter(query) {
        const lower = query.trim().toLowerCase();
        if (!lower) {
            this.filtered = [...this.items];
        }
        else {
            this.filtered = this.items.filter((item) => item.toLowerCase().includes(lower));
        }
        this.activeIndex = -1;
        this.renderList();
    }
    renderList() {
        const list = this.listEl ?? this.el.shadowRoot?.querySelector('.list');
        const input = this.inputEl ?? this.el.shadowRoot?.querySelector('.input');
        if (!(list instanceof H) || !(input instanceof HTMLInputElement)) {
            return;
        }
        list.innerHTML = '';
        if (!this.filtered.length) {
            const li = document.createElement('li');
            li.className = 'item empty';
            li.textContent = 'No matches';
            li.setAttribute('part', 'item empty');
            list.append(li);
            return;
        }
        this.filtered.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'item';
            li.textContent = item;
            li.role = 'option';
            li.id = `ac-opt-${index}`;
            li.setAttribute('part', 'item');
            li.onmousedown = (event) => {
                event.preventDefault();
                this.select(item);
            };
            list.append(li);
        });
        input.setAttribute('aria-controls', this.listId);
    }
    moveActive(step) {
        if (!this.filtered.length || !this.inputEl) {
            return;
        }
        const next = this.activeIndex + step;
        if (next < 0) {
            this.activeIndex = this.filtered.length - 1;
        }
        else if (next >= this.filtered.length) {
            this.activeIndex = 0;
        }
        else {
            this.activeIndex = next;
        }
        const sr = this.el.shadowRoot;
        const els = Array.from(sr?.querySelectorAll('.item:not(.empty)') ?? []);
        els.forEach((itemEl, idx) => {
            itemEl.classList.toggle('active', idx === this.activeIndex);
        });
        const activeEl = els[this.activeIndex];
        if (activeEl instanceof H) {
            this.inputEl.setAttribute('aria-activedescendant', activeEl.id);
            activeEl.scrollIntoView({ block: 'nearest' });
        }
    }
    select(value) {
        const input = this.inputEl ?? this.el.shadowRoot?.querySelector('.input');
        if (input instanceof HTMLInputElement) {
            input.value = value;
        }
        this.closeList();
        this.el.dispatchEvent(new CustomEvent('bf-select', {
            bubbles: true,
            composed: true,
            detail: { value },
        }));
    }
    openList() {
        const input = this.inputEl ?? this.el.shadowRoot?.querySelector('.input');
        const list = this.listEl ?? this.el.shadowRoot?.querySelector('.list');
        if (!(input instanceof HTMLInputElement) || !(list instanceof H)) {
            return;
        }
        this.listOpen = true;
        input.setAttribute('aria-expanded', 'true');
        list.hidden = false;
    }
    closeList() {
        const input = this.inputEl ?? this.el.shadowRoot?.querySelector('.input');
        const list = this.listEl ?? this.el.shadowRoot?.querySelector('.list');
        if (!(input instanceof HTMLInputElement) || !(list instanceof H)) {
            return;
        }
        this.listOpen = false;
        this.activeIndex = -1;
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
        list.hidden = true;
        this.el.shadowRoot?.querySelectorAll('.item.active').forEach((itemEl) => {
            itemEl.classList.remove('active');
        });
    }
    onDocumentClick(event) {
        const path = event.composedPath();
        if (!path.includes(this.el)) {
            this.closeList();
        }
    }
    bindInputOnce() {
        const input = this.el.shadowRoot?.querySelector('.input');
        const list = this.el.shadowRoot?.querySelector('.list');
        if (input instanceof HTMLInputElement &&
            list instanceof H &&
            input.dataset.bfBound !== 'true') {
            input.dataset.bfBound = 'true';
            this.inputEl = input;
            this.listEl = list;
            input.addEventListener('focus', () => {
                this.filter(input.value);
                this.openList();
            });
            input.addEventListener('input', () => {
                const text = input.value;
                this.filter(text);
                this.openList();
                this.el.dispatchEvent(new CustomEvent('bf-change', {
                    bubbles: true,
                    composed: true,
                    detail: { value: text },
                }));
            });
            input.addEventListener('keydown', (event) => {
                if (!this.listOpen && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
                    this.openList();
                }
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    this.moveActive(1);
                }
                if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    this.moveActive(-1);
                }
                if (event.key === 'Enter' && this.activeIndex >= 0) {
                    event.preventDefault();
                    const item = this.filtered[this.activeIndex];
                    if (item) {
                        this.select(item);
                    }
                }
                if (event.key === 'Escape') {
                    this.closeList();
                }
            });
        }
    }
    componentDidRender() {
        this.bindInputOnce();
        this.cacheDom();
        const ph = this.el.getAttribute('placeholder') || 'Search...';
        const val = this.el.getAttribute('value') || '';
        if (this.inputEl) {
            this.inputEl.placeholder = ph;
            this.inputEl.setAttribute('autocomplete', 'off');
            this.inputEl.setAttribute('spellcheck', 'false');
            this.inputEl.setAttribute('role', 'combobox');
            if (!this.booted) {
                this.inputEl.value = val;
            }
            this.inputEl.setAttribute('aria-controls', this.listId);
            this.inputEl.setAttribute('aria-expanded', String(this.listOpen));
        }
        if (this.listEl) {
            this.listEl.id = this.listId;
            this.listEl.setAttribute('role', 'listbox');
            this.listEl.hidden = !this.listOpen;
        }
        if (!this.booted) {
            this.booted = true;
            this.refreshFromAttrs();
        }
    }
    render() {
        const placeholder = this.el.getAttribute('placeholder') || 'Search...';
        return (h(Host, { key: '2cb7e33b19deb7d16d5561fbf97571bc76ec1acb' }, h("div", { key: '501f29f46dc305ff509be3102da1499a960d7450', class: "root", part: "root" }, h("input", { key: '3aaf5322c6aa2db7583e17e1972f6587d386d629', class: "input", part: "input", type: "text", placeholder: placeholder, autocomplete: "off", spellcheck: false, role: "combobox", "aria-expanded": "false", "aria-controls": this.listId, "aria-autocomplete": "list" }), h("ul", { key: 'c30c987cecfff8f0e98ed245e9088f33f87c9a98', class: "list", part: "list", id: this.listId, role: "listbox", hidden: true }))));
    }
    static get style() { return bfAutocompleteCss(); }
}, [1, "bf-autocomplete"]);
function defineCustomElement$1() {
    if (typeof customElements === "undefined") {
        return;
    }
    const components = ["bf-autocomplete"];
    components.forEach(tagName => { switch (tagName) {
        case "bf-autocomplete":
            if (!customElements.get(transformTag(tagName))) {
                customElements.define(transformTag(tagName), BfAutocomplete$1);
            }
            break;
    } });
}

const BfAutocomplete = BfAutocomplete$1;
const defineCustomElement = defineCustomElement$1;

export { BfAutocomplete, defineCustomElement };
