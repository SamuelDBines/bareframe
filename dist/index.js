var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// src/accordion/accordion.js
var BfAccordion = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._details = [];
    this._itemIds = [];
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-accordion-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-accordion-gap%3A%20var(--bf-theme-space-2%2C%200.5rem)%3B%0A%09--bf-accordion-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-accordion-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-accordion-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-accordion-border-color%3A%20var(--bf-theme-accordion-border-color%2C%20%23cbd5e1)%3B%0A%09--bf-accordion-bg%3A%20var(--bf-theme-accordion-bg%2C%20%23ffffff)%3B%0A%09--bf-accordion-color%3A%20var(--bf-theme-accordion-color%2C%20%230f172a)%3B%0A%09--bf-accordion-trigger-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-accordion-trigger-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-accordion-panel-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-accordion-panel-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-accordion-trigger-bg%3A%20var(--bf-theme-accordion-trigger-bg%2C%20%23f8fafc)%3B%0A%09--bf-accordion-trigger-hover-bg%3A%20var(%0A%09%09--bf-theme-accordion-trigger-hover-bg%2C%0A%09%09%23f1f5f9%0A%09)%3B%0A%09--bf-accordion-trigger-open-bg%3A%20var(%0A%09%09--bf-theme-accordion-trigger-open-bg%2C%0A%09%09%23eff6ff%0A%09)%3B%0A%09--bf-accordion-trigger-color%3A%20var(--bf-theme-accordion-trigger-color%2C%20%230f172a)%3B%0A%09--bf-accordion-panel-bg%3A%20var(--bf-theme-accordion-panel-bg%2C%20%23ffffff)%3B%0A%09--bf-accordion-focus-ring-width%3A%20var(--bf-theme-focus-ring-width%2C%202px)%3B%0A%09--bf-accordion-focus-ring-style%3A%20var(--bf-theme-focus-ring-style%2C%20solid)%3B%0A%09--bf-accordion-focus-ring-color%3A%20var(--bf-theme-focus-ring-color%2C%20%2393c5fd)%3B%0A%09--bf-accordion-focus-ring-offset%3A%20var(--bf-theme-focus-ring-offset%2C%202px)%3B%0A%09--bf-accordion-chevron-color%3A%20var(--bf-theme-accordion-chevron-color%2C%20%23475569)%3B%0A%09--bf-accordion-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-accordion-font)%3B%0A%09color%3A%20var(--bf-accordion-color)%3B%0A%7D%0A%0A.accordion%20%7B%0A%09display%3A%20grid%3B%0A%09gap%3A%20var(--bf-accordion-gap)%3B%0A%7D%0A%0A.accordion-item%20%7B%0A%09border-width%3A%20var(--bf-accordion-border-width)%3B%0A%09border-style%3A%20var(--bf-accordion-border-style)%3B%0A%09border-color%3A%20var(--bf-accordion-border-color)%3B%0A%09border-radius%3A%20var(--bf-accordion-radius)%3B%0A%09background%3A%20var(--bf-accordion-bg)%3B%0A%09overflow%3A%20clip%3B%0A%7D%0A%0A.accordion-trigger%20%7B%0A%09list-style%3A%20none%3B%0A%09cursor%3A%20pointer%3B%0A%09padding%3A%20var(--bf-accordion-trigger-padding-y)%0A%09%09var(--bf-accordion-trigger-padding-x)%3B%0A%09background%3A%20var(--bf-accordion-trigger-bg)%3B%0A%09color%3A%20var(--bf-accordion-trigger-color)%3B%0A%09transition%3A%20var(--bf-accordion-transition)%3B%0A%09display%3A%20flex%3B%0A%09align-items%3A%20center%3B%0A%09justify-content%3A%20space-between%3B%0A%7D%0A%0A.accordion-trigger%3A%3A-webkit-details-marker%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.accordion-trigger%3A%3Aafter%20%7B%0A%09content%3A%20'%2B'%3B%0A%09color%3A%20var(--bf-accordion-chevron-color)%3B%0A%09font-weight%3A%20700%3B%0A%09line-height%3A%201%3B%0A%7D%0A%0A.accordion-item%5Bopen%5D%20%3E%20.accordion-trigger%3A%3Aafter%20%7B%0A%09content%3A%20'-'%3B%0A%7D%0A%0A.accordion-trigger%3Ahover%20%7B%0A%09background%3A%20var(--bf-accordion-trigger-hover-bg)%3B%0A%7D%0A%0A.accordion-trigger%3Afocus-visible%20%7B%0A%09outline-width%3A%20var(--bf-accordion-focus-ring-width)%3B%0A%09outline-style%3A%20var(--bf-accordion-focus-ring-style)%3B%0A%09outline-color%3A%20var(--bf-accordion-focus-ring-color)%3B%0A%09outline-offset%3A%20calc(var(--bf-accordion-focus-ring-offset)%20*%20-1)%3B%0A%7D%0A%0A.accordion-item%5Bopen%5D%20%3E%20.accordion-trigger%20%7B%0A%09background%3A%20var(--bf-accordion-trigger-open-bg)%3B%0A%7D%0A%0A.accordion-panel%20%7B%0A%09padding%3A%20var(--bf-accordion-panel-padding-y)%20var(--bf-accordion-panel-padding-x)%3B%0A%09background%3A%20var(--bf-accordion-panel-bg)%3B%0A%09border-top-width%3A%20var(--bf-accordion-border-width)%3B%0A%09border-top-style%3A%20var(--bf-accordion-border-style)%3B%0A%09border-top-color%3A%20var(--bf-accordion-border-color)%3B%0A%7D%0A%0A.accordion-panel%20%3A%3Aslotted(*)%20%7B%0A%09margin%3A%200%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const container = document.createElement("div");
    container.className = "accordion";
    container.setAttribute("part", "accordion");
    const items = [...this.children].filter(
      (node) => node.nodeType === Node.ELEMENT_NODE
    );
    items.forEach((item, index) => {
      const title = item.getAttribute("title") || item.getAttribute("data-title") || `Section ${index + 1}`;
      const slotName = `item-${index + 1}`;
      const openByDefault = item.hasAttribute("open");
      const itemId = this._ensureItemId(item, index);
      item.setAttribute("slot", slotName);
      const details = document.createElement("details");
      details.className = "accordion-item";
      details.setAttribute("part", "item");
      details.dataset.itemId = itemId;
      if (openByDefault) {
        details.open = true;
      }
      const summary = document.createElement("summary");
      summary.className = "accordion-trigger";
      summary.setAttribute("part", "trigger");
      summary.textContent = title;
      const panel = document.createElement("div");
      panel.className = "accordion-panel";
      panel.setAttribute("part", "panel");
      const slot = document.createElement("slot");
      slot.name = slotName;
      panel.append(slot);
      details.append(summary, panel);
      container.append(details);
      this._details.push(details);
      this._itemIds.push(itemId);
      details.addEventListener("toggle", () => {
        if (!this.multiple && details.open) {
          this._details.forEach((other) => {
            if (other !== details) {
              other.open = false;
            }
          });
        }
        this.dispatchEvent(
          new CustomEvent("bf-accordion-toggle", {
            bubbles: true,
            composed: true,
            detail: {
              index,
              id: itemId,
              title,
              open: details.open
            }
          })
        );
      });
    });
    this.shadowRoot.replaceChildren(link, container);
    const activeId = this.getAttribute("active-id");
    if (activeId) {
      this.openItem(activeId);
    }
  }
  get multiple() {
    return this.hasAttribute("multiple");
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._initialized) {
      return;
    }
    if (name === "active-id" && oldValue !== newValue && newValue) {
      this.openItem(newValue);
    }
  }
  openItem(itemId) {
    const details = this._details.find((entry) => entry.dataset.itemId === itemId);
    if (!details) {
      return;
    }
    details.open = true;
  }
  closeItem(itemId) {
    const details = this._details.find((entry) => entry.dataset.itemId === itemId);
    if (!details) {
      return;
    }
    details.open = false;
  }
  toggleItem(itemId) {
    const details = this._details.find((entry) => entry.dataset.itemId === itemId);
    if (!details) {
      return;
    }
    details.open = !details.open;
  }
  _ensureItemId(item, index) {
    const explicit = item.getAttribute("id");
    if (explicit && !this._itemIds.includes(explicit)) {
      return explicit;
    }
    const hostId = this.getAttribute("id") || "bf-accordion";
    let counter = index + 1;
    let candidate = `${hostId}-item-${counter}`;
    while (this._itemIds.includes(candidate) || this.querySelector(`#${CSS.escape(candidate)}`) && this.querySelector(`#${CSS.escape(candidate)}`) !== item) {
      counter += 1;
      candidate = `${hostId}-item-${counter}`;
    }
    item.setAttribute("id", candidate);
    return candidate;
  }
};
__publicField(BfAccordion, "observedAttributes", ["active-id"]);
customElements.define("bf-accordion", BfAccordion);

// src/action-list/action-list.js
var BfActionList = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-action-list-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-action-list-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-action-list-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-action-list-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-action-list-border-color%3A%20var(--bf-theme-action-list-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-action-list-bg%3A%20var(--bf-theme-action-list-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-action-list-color%3A%20var(--bf-theme-action-list-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-action-list-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-action-list-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-action-list-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-action-list-font)%3B%0A%09color%3A%20var(--bf-action-list-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-action-list-bg)%3B%0A%09color%3A%20var(--bf-action-list-color)%3B%0A%09border-width%3A%20var(--bf-action-list-border-width)%3B%0A%09border-style%3A%20var(--bf-action-list-border-style)%3B%0A%09border-color%3A%20var(--bf-action-list-border-color)%3B%0A%09border-radius%3A%20var(--bf-action-list-radius)%3B%0A%09padding%3A%20var(--bf-action-list-padding-y)%20var(--bf-action-list-padding-x)%3B%0A%09transition%3A%20var(--bf-action-list-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "action list";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-action-list", BfActionList);

// src/anchor/anchor.js
var BfAnchor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-anchor-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-anchor-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-anchor-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-anchor-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-anchor-border-color%3A%20var(--bf-theme-anchor-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-anchor-bg%3A%20var(--bf-theme-anchor-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-anchor-color%3A%20var(--bf-theme-anchor-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-anchor-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-anchor-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-anchor-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-anchor-font)%3B%0A%09color%3A%20var(--bf-anchor-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-anchor-bg)%3B%0A%09color%3A%20var(--bf-anchor-color)%3B%0A%09border-width%3A%20var(--bf-anchor-border-width)%3B%0A%09border-style%3A%20var(--bf-anchor-border-style)%3B%0A%09border-color%3A%20var(--bf-anchor-border-color)%3B%0A%09border-radius%3A%20var(--bf-anchor-radius)%3B%0A%09padding%3A%20var(--bf-anchor-padding-y)%20var(--bf-anchor-padding-x)%3B%0A%09transition%3A%20var(--bf-anchor-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "anchor";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-anchor", BfAnchor);

// src/autocomplete/autocomplete.js
var BfAutocomplete = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._items = [];
    this._filtered = [];
    this._activeIndex = -1;
    this._listOpen = false;
    this._boundOnDocumentClick = this._onDocumentClick.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-autocomplete-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-autocomplete-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-autocomplete-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-autocomplete-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-autocomplete-border-color%3A%20var(%0A%09%09--bf-theme-autocomplete-border-color%2C%0A%09%09var(--bf-theme-border-1%2C%20%23d1d5db)%0A%09)%3B%0A%09--bf-autocomplete-bg%3A%20var(%0A%09%09--bf-theme-autocomplete-bg%2C%0A%09%09var(--bf-theme-surface-1%2C%20%23ffffff)%0A%09)%3B%0A%09--bf-autocomplete-color%3A%20var(%0A%09%09--bf-theme-autocomplete-color%2C%0A%09%09var(--bf-theme-text-1%2C%20%23111827)%0A%09)%3B%0A%09--bf-autocomplete-placeholder%3A%20var(--bf-theme-text-2%2C%20%236b7280)%3B%0A%09--bf-autocomplete-focus%3A%20var(--bf-theme-focus-ring-color%2C%20%239ca3af)%3B%0A%09--bf-autocomplete-list-max-height%3A%20220px%3B%0A%09--bf-autocomplete-item-hover-bg%3A%20var(--bf-theme-surface-2%2C%20%23f3f4f6)%3B%0A%09--bf-autocomplete-item-active-bg%3A%20var(--bf-theme-surface-2%2C%20%23e5e7eb)%3B%0A%09--bf-autocomplete-shadow%3A%200%208px%2026px%20rgba(15%2C%2023%2C%2042%2C%200.12)%3B%0A%0A%09display%3A%20inline-block%3B%0A%09width%3A%20min(100%25%2C%20420px)%3B%0A%09font%3A%20var(--bf-autocomplete-font)%3B%0A%7D%0A%0A.root%20%7B%0A%09position%3A%20relative%3B%0A%7D%0A%0A.input%20%7B%0A%09width%3A%20100%25%3B%0A%09box-sizing%3A%20border-box%3B%0A%09font%3A%20inherit%3B%0A%09color%3A%20var(--bf-autocomplete-color)%3B%0A%09background%3A%20var(--bf-autocomplete-bg)%3B%0A%09border-width%3A%20var(--bf-autocomplete-border-width)%3B%0A%09border-style%3A%20var(--bf-autocomplete-border-style)%3B%0A%09border-color%3A%20var(--bf-autocomplete-border-color)%3B%0A%09border-radius%3A%20var(--bf-autocomplete-radius)%3B%0A%09padding%3A%200.62rem%200.8rem%3B%0A%09outline%3A%20none%3B%0A%7D%0A%0A.input%3A%3Aplaceholder%20%7B%0A%09color%3A%20var(--bf-autocomplete-placeholder)%3B%0A%7D%0A%0A.input%3Afocus-visible%20%7B%0A%09border-color%3A%20var(--bf-autocomplete-focus)%3B%0A%09box-shadow%3A%200%200%200%202px%20color-mix(in%20srgb%2C%20var(--bf-autocomplete-focus)%2030%25%2C%20transparent)%3B%0A%7D%0A%0A.list%20%7B%0A%09position%3A%20absolute%3B%0A%09top%3A%20calc(100%25%20%2B%200.35rem)%3B%0A%09left%3A%200%3B%0A%09right%3A%200%3B%0A%09margin%3A%200%3B%0A%09padding%3A%200.35rem%3B%0A%09list-style%3A%20none%3B%0A%09border-width%3A%20var(--bf-autocomplete-border-width)%3B%0A%09border-style%3A%20var(--bf-autocomplete-border-style)%3B%0A%09border-color%3A%20var(--bf-autocomplete-border-color)%3B%0A%09border-radius%3A%20calc(var(--bf-autocomplete-radius)%20-%202px)%3B%0A%09background%3A%20var(--bf-autocomplete-bg)%3B%0A%09max-height%3A%20var(--bf-autocomplete-list-max-height)%3B%0A%09overflow%3A%20auto%3B%0A%09box-shadow%3A%20var(--bf-autocomplete-shadow)%3B%0A%09z-index%3A%2020%3B%0A%7D%0A%0A.item%20%7B%0A%09padding%3A%200.48rem%200.55rem%3B%0A%09border-radius%3A%20calc(var(--bf-autocomplete-radius)%20-%204px)%3B%0A%09cursor%3A%20pointer%3B%0A%7D%0A%0A.item%3Ahover%20%7B%0A%09background%3A%20var(--bf-autocomplete-item-hover-bg)%3B%0A%7D%0A%0A.item.active%20%7B%0A%09background%3A%20var(--bf-autocomplete-item-active-bg)%3B%0A%7D%0A%0A.item.empty%20%7B%0A%09cursor%3A%20default%3B%0A%09color%3A%20var(--bf-autocomplete-placeholder)%3B%0A%7D%0A", import.meta.url);
    const placeholder = this.getAttribute("placeholder") || "Search...";
    const value = this.getAttribute("value") || "";
    const listId = `ac-list-${Math.random().toString(36).slice(2, 10)}`;
    this.shadowRoot.innerHTML = `
			<link rel="stylesheet" href="${cssUrl.href}" />
			<div class="root" part="root">
				<input
					class="input"
					part="input"
					type="text"
					placeholder="${placeholder.replace(/"/g, "&quot;")}"
					autocomplete="off"
					spellcheck="false"
					role="combobox"
					aria-expanded="false"
					aria-controls="${listId}"
					aria-autocomplete="list"
				/>
				<ul class="list" part="list" id="${listId}" role="listbox" hidden></ul>
			</div>
		`;
    this._input = this.shadowRoot.querySelector(".input");
    this._list = this.shadowRoot.querySelector(".list");
    this._input.value = value;
    this._setItemsFromAttributes();
    this._filtered = [...this._items];
    this._renderList();
    this._input.addEventListener("focus", () => {
      this._filter(this._input.value);
      this._openList();
    });
    this._input.addEventListener("input", () => {
      const text = this._input.value;
      this._filter(text);
      this._openList();
      this.dispatchEvent(
        new CustomEvent("bf-change", {
          bubbles: true,
          composed: true,
          detail: { value: text }
        })
      );
    });
    this._input.addEventListener("keydown", (event) => {
      if (!this._listOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        this._openList();
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        this._moveActive(1);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        this._moveActive(-1);
      }
      if (event.key === "Enter" && this._activeIndex >= 0) {
        event.preventDefault();
        const item = this._filtered[this._activeIndex];
        if (item) {
          this._select(item);
        }
      }
      if (event.key === "Escape") {
        this._closeList();
      }
    });
    document.addEventListener("click", this._boundOnDocumentClick);
  }
  disconnectedCallback() {
    document.removeEventListener("click", this._boundOnDocumentClick);
  }
  _setItemsFromAttributes() {
    const json = this.getAttribute("options");
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          this._items = parsed.map((item) => String(item));
          return;
        }
      } catch {
      }
    }
    const csv = this.getAttribute("options-csv");
    if (csv) {
      this._items = csv.split(",").map((part) => part.trim()).filter(Boolean);
      return;
    }
    this._items = [
      "Accessibility",
      "Accordion",
      "Autocomplete",
      "Button",
      "Card",
      "Color Picker",
      "Data Grid",
      "Dropdown",
      "Modal",
      "Typography"
    ];
  }
  _filter(query) {
    const lower = query.trim().toLowerCase();
    if (!lower) {
      this._filtered = [...this._items];
    } else {
      this._filtered = this._items.filter(
        (item) => item.toLowerCase().includes(lower)
      );
    }
    this._activeIndex = -1;
    this._renderList();
  }
  _renderList() {
    this._list.innerHTML = "";
    if (!this._filtered.length) {
      const li = document.createElement("li");
      li.className = "item empty";
      li.textContent = "No matches";
      li.setAttribute("part", "item empty");
      this._list.append(li);
      return;
    }
    this._filtered.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "item";
      li.textContent = item;
      li.role = "option";
      li.id = `ac-opt-${index}`;
      li.setAttribute("part", "item");
      li.addEventListener("mousedown", (event) => {
        event.preventDefault();
        this._select(item);
      });
      this._list.append(li);
    });
  }
  _moveActive(step) {
    if (!this._filtered.length) {
      return;
    }
    const next = this._activeIndex + step;
    if (next < 0) {
      this._activeIndex = this._filtered.length - 1;
    } else if (next >= this._filtered.length) {
      this._activeIndex = 0;
    } else {
      this._activeIndex = next;
    }
    const items = [...this.shadowRoot.querySelectorAll(".item:not(.empty)")];
    items.forEach((itemEl, idx) => {
      itemEl.classList.toggle("active", idx === this._activeIndex);
    });
    const activeEl = items[this._activeIndex];
    if (activeEl) {
      this._input.setAttribute("aria-activedescendant", activeEl.id);
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }
  _select(value) {
    this._input.value = value;
    this._closeList();
    this.dispatchEvent(
      new CustomEvent("bf-select", {
        bubbles: true,
        composed: true,
        detail: { value }
      })
    );
  }
  _openList() {
    this._listOpen = true;
    this._input.setAttribute("aria-expanded", "true");
    this._list.hidden = false;
  }
  _closeList() {
    this._listOpen = false;
    this._activeIndex = -1;
    this._input.setAttribute("aria-expanded", "false");
    this._input.removeAttribute("aria-activedescendant");
    this._list.hidden = true;
    this.shadowRoot.querySelectorAll(".item.active").forEach((itemEl) => {
      itemEl.classList.remove("active");
    });
  }
  _onDocumentClick(event) {
    if (!this.contains(event.target) && !this.shadowRoot.contains(event.target)) {
      this._closeList();
    }
  }
};
customElements.define("bf-autocomplete", BfAutocomplete);

// src/avatar/avatar.js
var BfAvatar = class extends HTMLElement {
  static get observedAttributes() {
    return ["name", "src", "alt", "initials", "size", "status"];
  }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    this._render();
  }
  attributeChangedCallback() {
    if (!this._initialized) {
      return;
    }
    this._render();
  }
  _render() {
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-avatar-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-avatar-size-sm%3A%202rem%3B%0A%09--bf-avatar-size-md%3A%202.5rem%3B%0A%09--bf-avatar-size-lg%3A%203rem%3B%0A%09--bf-avatar-size-xl%3A%203.75rem%3B%0A%09--bf-avatar-radius%3A%20999px%3B%0A%09--bf-avatar-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-avatar-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-avatar-border-color%3A%20var(%0A%09%09--bf-theme-avatar-border-color%2C%0A%09%09var(--bf-theme-border-1%2C%20%23d1d5db)%0A%09)%3B%0A%09--bf-avatar-bg%3A%20var(%0A%09%09--bf-theme-avatar-bg%2C%0A%09%09var(--bf-theme-surface-2%2C%20%23f3f4f6)%0A%09)%3B%0A%09--bf-avatar-color%3A%20var(%0A%09%09--bf-theme-avatar-color%2C%0A%09%09var(--bf-theme-text-1%2C%20%23111827)%0A%09)%3B%0A%09--bf-avatar-fallback-bg%3A%20var(%0A%09%09--bf-theme-avatar-fallback-bg%2C%0A%09%09color-mix(in%20srgb%2C%20var(--bf-avatar-bg)%2075%25%2C%20%2394a3b8%2025%25)%0A%09)%3B%0A%09--bf-avatar-fallback-color%3A%20var(%0A%09%09--bf-theme-avatar-fallback-color%2C%0A%09%09var(--bf-avatar-color)%0A%09)%3B%0A%09--bf-avatar-shadow%3A%20var(--bf-theme-avatar-shadow%2C%200%201px%202px%20rgba(15%2C%2023%2C%2042%2C%200.08))%3B%0A%09--bf-avatar-status-size%3A%200.62rem%3B%0A%09--bf-avatar-status-ring%3A%20var(--bf-theme-surface-1%2C%20%23ffffff)%3B%0A%09--bf-avatar-status-online%3A%20%2316a34a%3B%0A%09--bf-avatar-status-away%3A%20%23f59e0b%3B%0A%09--bf-avatar-status-busy%3A%20%23ef4444%3B%0A%09--bf-avatar-status-offline%3A%20%2364748b%3B%0A%0A%09display%3A%20inline-block%3B%0A%09font%3A%20var(--bf-avatar-font)%3B%0A%7D%0A%0A.root%20%7B%0A%09position%3A%20relative%3B%0A%09width%3A%20var(--bf-avatar-size-md)%3B%0A%09height%3A%20var(--bf-avatar-size-md)%3B%0A%09border-radius%3A%20var(--bf-avatar-radius)%3B%0A%09border-width%3A%20var(--bf-avatar-border-width)%3B%0A%09border-style%3A%20var(--bf-avatar-border-style)%3B%0A%09border-color%3A%20var(--bf-avatar-border-color)%3B%0A%09overflow%3A%20hidden%3B%0A%09background%3A%20var(--bf-avatar-bg)%3B%0A%09color%3A%20var(--bf-avatar-color)%3B%0A%09box-shadow%3A%20var(--bf-avatar-shadow)%3B%0A%7D%0A%0A.root.size-sm%20%7B%0A%09width%3A%20var(--bf-avatar-size-sm)%3B%0A%09height%3A%20var(--bf-avatar-size-sm)%3B%0A%7D%0A%0A.root.size-md%20%7B%0A%09width%3A%20var(--bf-avatar-size-md)%3B%0A%09height%3A%20var(--bf-avatar-size-md)%3B%0A%7D%0A%0A.root.size-lg%20%7B%0A%09width%3A%20var(--bf-avatar-size-lg)%3B%0A%09height%3A%20var(--bf-avatar-size-lg)%3B%0A%7D%0A%0A.root.size-xl%20%7B%0A%09width%3A%20var(--bf-avatar-size-xl)%3B%0A%09height%3A%20var(--bf-avatar-size-xl)%3B%0A%7D%0A%0A.image%2C%0A.fallback%20%7B%0A%09width%3A%20100%25%3B%0A%09height%3A%20100%25%3B%0A%7D%0A%0A.image%20%7B%0A%09display%3A%20block%3B%0A%09object-fit%3A%20cover%3B%0A%09background%3A%20var(--bf-avatar-bg)%3B%0A%7D%0A%0A.fallback%20%7B%0A%09display%3A%20grid%3B%0A%09place-items%3A%20center%3B%0A%09font-weight%3A%20700%3B%0A%09letter-spacing%3A%200.02em%3B%0A%09background%3A%20var(--bf-avatar-fallback-bg)%3B%0A%09color%3A%20var(--bf-avatar-fallback-color)%3B%0A%09user-select%3A%20none%3B%0A%7D%0A%0A.root.size-sm%20.fallback%20%7B%0A%09font-size%3A%200.7rem%3B%0A%7D%0A%0A.root.size-md%20.fallback%20%7B%0A%09font-size%3A%200.85rem%3B%0A%7D%0A%0A.root.size-lg%20.fallback%20%7B%0A%09font-size%3A%201rem%3B%0A%7D%0A%0A.root.size-xl%20.fallback%20%7B%0A%09font-size%3A%201.15rem%3B%0A%7D%0A%0A.hidden%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.status%20%7B%0A%09position%3A%20absolute%3B%0A%09right%3A%200.02rem%3B%0A%09bottom%3A%200.02rem%3B%0A%09width%3A%20var(--bf-avatar-status-size)%3B%0A%09height%3A%20var(--bf-avatar-status-size)%3B%0A%09border-radius%3A%20999px%3B%0A%09border%3A%202px%20solid%20var(--bf-avatar-status-ring)%3B%0A%7D%0A%0A.status.online%20%7B%0A%09background%3A%20var(--bf-avatar-status-online)%3B%0A%7D%0A%0A.status.away%20%7B%0A%09background%3A%20var(--bf-avatar-status-away)%3B%0A%7D%0A%0A.status.busy%20%7B%0A%09background%3A%20var(--bf-avatar-status-busy)%3B%0A%7D%0A%0A.status.offline%20%7B%0A%09background%3A%20var(--bf-avatar-status-offline)%3B%0A%7D%0A", import.meta.url);
    const name = this.getAttribute("name") || "";
    const src = this.getAttribute("src") || "";
    const alt = this.getAttribute("alt") || name || "Avatar";
    const explicitInitials = this.getAttribute("initials");
    const initials = explicitInitials || this._buildInitials(name);
    const size = this.getAttribute("size") || "md";
    const status = this.getAttribute("status") || "";
    const showStatus = status && ["online", "away", "busy", "offline"].includes(status);
    this.shadowRoot.innerHTML = `
			<link rel="stylesheet" href="${cssUrl.href}" />
			<div class="root size-${size}" part="root">
				${src ? `<img class="image" part="image" src="${src}" alt="${alt.replace(/"/g, "&quot;")}" />` : ""}
				<div class="fallback ${src ? "hidden" : ""}" part="fallback" aria-label="${alt.replace(/"/g, "&quot;")}">${initials || "?"}</div>
				${showStatus ? `<span class="status ${status}" part="status"></span>` : ""}
			</div>
		`;
    if (src) {
      const image = this.shadowRoot.querySelector(".image");
      const fallback = this.shadowRoot.querySelector(".fallback");
      image.addEventListener("error", () => {
        image.classList.add("hidden");
        fallback.classList.remove("hidden");
      });
    }
  }
  _buildInitials(name) {
    if (!name.trim()) {
      return "";
    }
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join("");
  }
};
customElements.define("bf-avatar", BfAvatar);

// src/bottom-navigation/bottom-navigation.js
var BfBottomNavigation = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-bottom-navigation-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-bottom-navigation-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-bottom-navigation-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-bottom-navigation-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-bottom-navigation-border-color%3A%20var(--bf-theme-bottom-navigation-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-bottom-navigation-bg%3A%20var(--bf-theme-bottom-navigation-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-bottom-navigation-color%3A%20var(--bf-theme-bottom-navigation-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-bottom-navigation-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-bottom-navigation-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-bottom-navigation-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-bottom-navigation-font)%3B%0A%09color%3A%20var(--bf-bottom-navigation-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-bottom-navigation-bg)%3B%0A%09color%3A%20var(--bf-bottom-navigation-color)%3B%0A%09border-width%3A%20var(--bf-bottom-navigation-border-width)%3B%0A%09border-style%3A%20var(--bf-bottom-navigation-border-style)%3B%0A%09border-color%3A%20var(--bf-bottom-navigation-border-color)%3B%0A%09border-radius%3A%20var(--bf-bottom-navigation-radius)%3B%0A%09padding%3A%20var(--bf-bottom-navigation-padding-y)%20var(--bf-bottom-navigation-padding-x)%3B%0A%09transition%3A%20var(--bf-bottom-navigation-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "bottom navigation";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-bottom-navigation", BfBottomNavigation);

// src/breadcrumb/breadcrumb.js
var BfBreadcrumb = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onSlotChange = this._onSlotChange.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._render();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-breadcrumb-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-breadcrumb-radius%3A%20var(--bf-theme-radius-md%2C%207px)%3B%0A%09--bf-breadcrumb-border-color%3A%20var(--bf-theme-breadcrumb-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-breadcrumb-bg%3A%20var(--bf-theme-breadcrumb-bg%2C%20transparent)%3B%0A%09--bf-breadcrumb-color%3A%20var(--bf-theme-breadcrumb-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-breadcrumb-muted%3A%20var(--bf-theme-text-2%2C%20%2364748b)%3B%0A%09--bf-breadcrumb-link%3A%20var(--bf-theme-button-primary-bg%2C%20%232563eb)%3B%0A%09--bf-breadcrumb-pill-bg%3A%20var(--bf-theme-surface-1%2C%20%23ffffff)%3B%0A%0A%09display%3A%20inline-block%3B%0A%09font%3A%20var(--bf-breadcrumb-font)%3B%0A%09color%3A%20var(--bf-breadcrumb-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-breadcrumb-bg)%3B%0A%09color%3A%20var(--bf-breadcrumb-color)%3B%0A%7D%0A%0A.list%20%7B%0A%09list-style%3A%20none%3B%0A%09margin%3A%200%3B%0A%09padding%3A%200%3B%0A%09display%3A%20flex%3B%0A%09flex-wrap%3A%20wrap%3B%0A%09align-items%3A%20center%3B%0A%09gap%3A%200.45rem%3B%0A%7D%0A%0A.item%20%7B%0A%09display%3A%20inline-flex%3B%0A%09align-items%3A%20center%3B%0A%09gap%3A%200.45rem%3B%0A%09color%3A%20inherit%3B%0A%7D%0A%0A.item%20a%2C%0A.item%20span%20%7B%0A%09font%3A%20inherit%3B%0A%09color%3A%20inherit%3B%0A%09text-decoration%3A%20none%3B%0A%7D%0A%0A.item%20a%20%7B%0A%09color%3A%20var(--bf-breadcrumb-link)%3B%0A%7D%0A%0A.item%20.current%20%7B%0A%09color%3A%20var(--bf-breadcrumb-color)%3B%0A%09font-weight%3A%20600%3B%0A%7D%0A%0A.item%20.ellipsis%20%7B%0A%09color%3A%20var(--bf-breadcrumb-muted)%3B%0A%7D%0A%0A.separator%20%7B%0A%09color%3A%20var(--bf-breadcrumb-muted)%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'minimal'%5D%20.separator%20%7B%0A%09opacity%3A%200.55%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'pills'%5D%20.item%20a%2C%0A.root%5Bdata-variant%3D'pills'%5D%20.item%20span%20%7B%0A%09border%3A%201px%20solid%20var(--bf-breadcrumb-border-color)%3B%0A%09background%3A%20var(--bf-breadcrumb-pill-bg)%3B%0A%09border-radius%3A%20var(--bf-breadcrumb-radius)%3B%0A%09padding%3A%200.2rem%200.5rem%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'pills'%5D%20.separator%20%7B%0A%09margin-inline%3A%20-0.1rem%200.1rem%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("nav");
    root.className = "root";
    root.setAttribute("part", "root");
    root.setAttribute("aria-label", "Breadcrumb");
    root.innerHTML = `
			<ol class="list" part="list"></ol>
			<slot hidden></slot>
		`;
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._list = root.querySelector(".list");
    this._slot = root.querySelector("slot");
    this._slot.addEventListener("slotchange", this._onSlotChange);
    this._render();
  }
  attributeChangedCallback() {
    this._render();
  }
  _onSlotChange() {
    this._render();
  }
  _variant() {
    const value = (this.getAttribute("variant") || "default").toLowerCase();
    if (["default", "pills", "minimal"].includes(value)) {
      return value;
    }
    return "default";
  }
  _separatorText() {
    const icon = this.getAttribute("separator-icon");
    if (icon) {
      return icon;
    }
    const raw = this.getAttribute("separator");
    if (!raw) {
      return "\u203A";
    }
    const value = raw.toLowerCase();
    if (value === "chevron") {
      return "\u203A";
    }
    if (value === "slash") {
      return "/";
    }
    if (value === "dot") {
      return "\u2022";
    }
    if (value === "pipe") {
      return "|";
    }
    return raw;
  }
  _max() {
    const parsed = Number.parseInt(this.getAttribute("max") || "", 10);
    if (Number.isFinite(parsed) && parsed >= 2) {
      return parsed;
    }
    return Infinity;
  }
  _itemsFromDom() {
    const items = [];
    const children = [...this.children];
    for (const child of children) {
      const text = child.textContent?.trim();
      if (!text) {
        continue;
      }
      const isLink = child.tagName.toLowerCase() === "a" && child.getAttribute("href");
      items.push({
        label: text,
        href: isLink ? child.getAttribute("href") : "",
        current: child.hasAttribute("current")
      });
    }
    return items;
  }
  _applyCollapse(items) {
    const max = this._max();
    if (max === Infinity || items.length <= max || max < 3) {
      return items;
    }
    const head = items[0];
    const tailCount = max - 2;
    const tail = items.slice(items.length - tailCount);
    return [head, { label: "...", href: "", current: false, ellipsis: true }, ...tail];
  }
  _render() {
    if (!this._list || !this._root) {
      return;
    }
    const items = this._applyCollapse(this._itemsFromDom());
    this._root.setAttribute("data-variant", this._variant());
    this._list.replaceChildren();
    if (!items.length) {
      const fallback = document.createElement("li");
      fallback.className = "item";
      fallback.textContent = "breadcrumb";
      this._list.append(fallback);
      return;
    }
    items.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "item";
      if (item.ellipsis) {
        const span = document.createElement("span");
        span.className = "ellipsis";
        span.textContent = item.label;
        li.append(span);
      } else if (item.href && !item.current) {
        const link = document.createElement("a");
        link.href = item.href;
        link.textContent = item.label;
        li.append(link);
      } else {
        const span = document.createElement("span");
        span.className = item.current || index === items.length - 1 ? "current" : "";
        span.textContent = item.label;
        if (item.current || index === items.length - 1) {
          span.setAttribute("aria-current", "page");
        }
        li.append(span);
      }
      if (index < items.length - 1) {
        const sep = document.createElement("span");
        sep.className = "separator";
        sep.textContent = this._separatorText();
        li.append(sep);
      }
      this._list.append(li);
    });
  }
};
__publicField(BfBreadcrumb, "observedAttributes", ["variant", "separator", "separator-icon", "max"]);
customElements.define("bf-breadcrumb", BfBreadcrumb);

// src/button/button.js
var BfButton = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onClick = this._onClick.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._syncState();
      return;
    }
    this._initialized = true;
    const label = this.getAttribute("label") || "Button";
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-button-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-button-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-button-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-button-border-radius%3A%20var(--bf-theme-radius-md%2C%206px)%3B%0A%09--bf-button-padding-y%3A%20var(--bf-theme-space-2%2C%200.5rem)%3B%0A%09--bf-button-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-button-cursor%3A%20var(--bf-theme-cursor-button%2C%20pointer)%3B%0A%09--bf-button-opacity-hover%3A%20var(--bf-theme-opacity-hover%2C%200.95)%3B%0A%09--bf-button-active-translate-y%3A%20var(--bf-theme-active-translate-y%2C%201px)%3B%0A%09--bf-button-focus-outline-width%3A%20var(--bf-theme-focus-ring-width%2C%202px)%3B%0A%09--bf-button-focus-outline-style%3A%20var(--bf-theme-focus-ring-style%2C%20solid)%3B%0A%09--bf-button-focus-outline-color%3A%20var(--bf-theme-focus-ring-color%2C%20%2393c5fd)%3B%0A%09--bf-button-focus-outline-offset%3A%20var(--bf-theme-focus-ring-offset%2C%202px)%3B%0A%09--bf-button-transition%3A%0A%09%09var(--bf-theme-transition-transform%2C%20transform%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-opacity%2C%20opacity%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09--bf-button-primary-bg%3A%20var(--bf-theme-button-primary-bg%2C%20%231d4ed8)%3B%0A%09--bf-button-primary-color%3A%20var(--bf-theme-button-primary-color%2C%20%23ffffff)%3B%0A%09--bf-button-primary-border-color%3A%20var(%0A%09%09--bf-theme-button-primary-border-color%2C%0A%09%09transparent%0A%09)%3B%0A%09--bf-button-primary-hover-bg%3A%20var(--bf-button-primary-bg)%3B%0A%09--bf-button-primary-hover-color%3A%20var(--bf-button-primary-color)%3B%0A%09--bf-button-primary-hover-border-color%3A%20var(--bf-button-primary-border-color)%3B%0A%09--bf-button-primary-active-bg%3A%20var(--bf-button-primary-bg)%3B%0A%09--bf-button-primary-active-color%3A%20var(--bf-button-primary-color)%3B%0A%09--bf-button-primary-active-border-color%3A%20var(%0A%09%09--bf-button-primary-border-color%0A%09)%3B%0A%0A%09--bf-button-secondary-bg%3A%20var(--bf-theme-button-secondary-bg%2C%20%23ffffff)%3B%0A%09--bf-button-secondary-color%3A%20var(--bf-theme-button-secondary-color%2C%20%231d4ed8)%3B%0A%09--bf-button-secondary-border-color%3A%20var(%0A%09%09--bf-theme-button-secondary-border-color%2C%0A%09%09%231d4ed8%0A%09)%3B%0A%09--bf-button-secondary-hover-bg%3A%20var(--bf-button-secondary-bg)%3B%0A%09--bf-button-secondary-hover-color%3A%20var(--bf-button-secondary-color)%3B%0A%09--bf-button-secondary-hover-border-color%3A%20var(%0A%09%09--bf-button-secondary-border-color%0A%09)%3B%0A%09--bf-button-secondary-active-bg%3A%20var(--bf-button-secondary-bg)%3B%0A%09--bf-button-secondary-active-color%3A%20var(--bf-button-secondary-color)%3B%0A%09--bf-button-secondary-active-border-color%3A%20var(%0A%09%09--bf-button-secondary-border-color%0A%09)%3B%0A%0A%09display%3A%20inline-block%3B%0A%7D%0A%0Abutton%20%7B%0A%09--_bf-button-bg%3A%20var(--bf-button-primary-bg)%3B%0A%09--_bf-button-color%3A%20var(--bf-button-primary-color)%3B%0A%09--_bf-button-border-color%3A%20var(--bf-button-primary-border-color)%3B%0A%09--_bf-button-hover-bg%3A%20var(--bf-button-primary-hover-bg)%3B%0A%09--_bf-button-hover-color%3A%20var(--bf-button-primary-hover-color)%3B%0A%09--_bf-button-hover-border-color%3A%20var(--bf-button-primary-hover-border-color)%3B%0A%09--_bf-button-active-bg%3A%20var(--bf-button-primary-active-bg)%3B%0A%09--_bf-button-active-color%3A%20var(--bf-button-primary-active-color)%3B%0A%09--_bf-button-active-border-color%3A%20var(%0A%09%09--bf-button-primary-active-border-color%0A%09)%3B%0A%0A%09font%3A%20var(--bf-button-font)%3B%0A%09border-width%3A%20var(--bf-button-border-width)%3B%0A%09border-style%3A%20var(--bf-button-border-style)%3B%0A%09border-color%3A%20var(--_bf-button-border-color)%3B%0A%09border-radius%3A%20var(--bf-button-border-radius)%3B%0A%09cursor%3A%20var(--bf-button-cursor)%3B%0A%09padding%3A%20var(--bf-button-padding-y)%20var(--bf-button-padding-x)%3B%0A%09transition%3A%20var(--bf-button-transition)%3B%0A%09background%3A%20var(--_bf-button-bg)%3B%0A%09color%3A%20var(--_bf-button-color)%3B%0A%7D%0A%0Abutton%3Ahover%20%7B%0A%09opacity%3A%20var(--bf-button-opacity-hover)%3B%0A%09background%3A%20var(--_bf-button-hover-bg)%3B%0A%09color%3A%20var(--_bf-button-hover-color)%3B%0A%09border-color%3A%20var(--_bf-button-hover-border-color)%3B%0A%7D%0A%0Abutton%3Aactive%20%7B%0A%09transform%3A%20translateY(var(--bf-button-active-translate-y))%3B%0A%09background%3A%20var(--_bf-button-active-bg)%3B%0A%09color%3A%20var(--_bf-button-active-color)%3B%0A%09border-color%3A%20var(--_bf-button-active-border-color)%3B%0A%7D%0A%0Abutton%3Afocus-visible%20%7B%0A%09outline-width%3A%20var(--bf-button-focus-outline-width)%3B%0A%09outline-style%3A%20var(--bf-button-focus-outline-style)%3B%0A%09outline-color%3A%20var(--bf-button-focus-outline-color)%3B%0A%09outline-offset%3A%20var(--bf-button-focus-outline-offset)%3B%0A%7D%0A%0Abutton%3Adisabled%20%7B%0A%09opacity%3A%20var(--bf-button-disabled-opacity%2C%200.55)%3B%0A%09cursor%3A%20var(--bf-button-disabled-cursor%2C%20not-allowed)%3B%0A%7D%0A%0Abutton.primary%20%7B%0A%09--_bf-button-bg%3A%20var(--bf-button-primary-bg)%3B%0A%09--_bf-button-color%3A%20var(--bf-button-primary-color)%3B%0A%09--_bf-button-border-color%3A%20var(--bf-button-primary-border-color)%3B%0A%09--_bf-button-hover-bg%3A%20var(--bf-button-primary-hover-bg)%3B%0A%09--_bf-button-hover-color%3A%20var(--bf-button-primary-hover-color)%3B%0A%09--_bf-button-hover-border-color%3A%20var(--bf-button-primary-hover-border-color)%3B%0A%09--_bf-button-active-bg%3A%20var(--bf-button-primary-active-bg)%3B%0A%09--_bf-button-active-color%3A%20var(--bf-button-primary-active-color)%3B%0A%09--_bf-button-active-border-color%3A%20var(%0A%09%09--bf-button-primary-active-border-color%0A%09)%3B%0A%7D%0A%0Abutton.secondary%20%7B%0A%09--_bf-button-bg%3A%20var(--bf-button-secondary-bg)%3B%0A%09--_bf-button-color%3A%20var(--bf-button-secondary-color)%3B%0A%09--_bf-button-border-color%3A%20var(--bf-button-secondary-border-color)%3B%0A%09--_bf-button-hover-bg%3A%20var(--bf-button-secondary-hover-bg)%3B%0A%09--_bf-button-hover-color%3A%20var(--bf-button-secondary-hover-color)%3B%0A%09--_bf-button-hover-border-color%3A%20var(%0A%09%09--bf-button-secondary-hover-border-color%0A%09)%3B%0A%09--_bf-button-active-bg%3A%20var(--bf-button-secondary-active-bg)%3B%0A%09--_bf-button-active-color%3A%20var(--bf-button-secondary-active-color)%3B%0A%09--_bf-button-active-border-color%3A%20var(%0A%09%09--bf-button-secondary-active-border-color%0A%09)%3B%0A%7D%0A%0Abutton.is-selected%20%7B%0A%09box-shadow%3A%20inset%200%200%200%202px%20var(--bf-theme-focus-ring-color%2C%20%2393c5fd)%3B%0A%7D%0A", import.meta.url);
    this.shadowRoot.innerHTML = "";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const button = document.createElement("button");
    button.className = this.getAttribute("variant") || "primary";
    button.type = "button";
    button.textContent = label;
    button.append(document.createElement("slot"));
    this.shadowRoot.append(link, button);
    this._button = button;
    button.addEventListener("click", this._onClick);
    this._syncState();
  }
  attributeChangedCallback() {
    this._syncState();
  }
  get selected() {
    return this.hasAttribute("selected");
  }
  set selected(value) {
    if (value) {
      this.setAttribute("selected", "");
      return;
    }
    this.removeAttribute("selected");
  }
  _onClick() {
    this._applyGroupSelection();
    const label = this.getAttribute("label") || "Button";
    const variant = this.getAttribute("variant") || "primary";
    this.dispatchEvent(
      new CustomEvent("bf-click", {
        bubbles: true,
        composed: true,
        detail: {
          label,
          variant,
          selected: this.selected,
          group: this.getAttribute("group") || "",
          at: (/* @__PURE__ */ new Date()).toISOString()
        }
      })
    );
  }
  _groupLimit() {
    const multiple = this.getAttribute("multiple");
    if (multiple === null) {
      return 1;
    }
    if (multiple === "") {
      return Infinity;
    }
    const parsed = Number.parseInt(multiple, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }
  _applyGroupSelection() {
    const group = this.getAttribute("group");
    if (!group) {
      return;
    }
    const peers = [...document.querySelectorAll(`bf-button[group="${CSS.escape(group)}"]`)];
    const cap = this._groupLimit();
    if (cap === 1) {
      for (const peer of peers) {
        peer.selected = peer === this;
      }
      return;
    }
    if (this.selected) {
      this.selected = false;
      return;
    }
    const selectedCount = peers.filter((peer) => peer.selected).length;
    if (selectedCount >= cap) {
      return;
    }
    this.selected = true;
  }
  _syncState() {
    if (!this._button) {
      return;
    }
    this._button.className = this.getAttribute("variant") || "primary";
    this._button.disabled = this.hasAttribute("disabled");
    this._button.setAttribute("aria-pressed", String(this.selected));
    this._button.classList.toggle("is-selected", this.selected);
  }
};
__publicField(BfButton, "observedAttributes", ["selected", "disabled", "variant", "label", "group"]);
customElements.define("bf-button", BfButton);

// src/calendar/calendar.js
var BfCalendar = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-calendar-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-calendar-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-calendar-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-calendar-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-calendar-border-color%3A%20var(--bf-theme-calendar-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-calendar-bg%3A%20var(--bf-theme-calendar-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-calendar-color%3A%20var(--bf-theme-calendar-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-calendar-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-calendar-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-calendar-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-calendar-font)%3B%0A%09color%3A%20var(--bf-calendar-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-calendar-bg)%3B%0A%09color%3A%20var(--bf-calendar-color)%3B%0A%09border-width%3A%20var(--bf-calendar-border-width)%3B%0A%09border-style%3A%20var(--bf-calendar-border-style)%3B%0A%09border-color%3A%20var(--bf-calendar-border-color)%3B%0A%09border-radius%3A%20var(--bf-calendar-radius)%3B%0A%09padding%3A%20var(--bf-calendar-padding-y)%20var(--bf-calendar-padding-x)%3B%0A%09transition%3A%20var(--bf-calendar-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "calendar";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-calendar", BfCalendar);

// src/canvas/canvas.js
var BfCanvas = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-canvas-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-canvas-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-canvas-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-canvas-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-canvas-border-color%3A%20var(--bf-theme-canvas-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-canvas-bg%3A%20var(--bf-theme-canvas-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-canvas-color%3A%20var(--bf-theme-canvas-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-canvas-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-canvas-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-canvas-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-canvas-font)%3B%0A%09color%3A%20var(--bf-canvas-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-canvas-bg)%3B%0A%09color%3A%20var(--bf-canvas-color)%3B%0A%09border-width%3A%20var(--bf-canvas-border-width)%3B%0A%09border-style%3A%20var(--bf-canvas-border-style)%3B%0A%09border-color%3A%20var(--bf-canvas-border-color)%3B%0A%09border-radius%3A%20var(--bf-canvas-radius)%3B%0A%09padding%3A%20var(--bf-canvas-padding-y)%20var(--bf-canvas-padding-x)%3B%0A%09transition%3A%20var(--bf-canvas-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "canvas";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-canvas", BfCanvas);

// src/card/card.js
var BfCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-card-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-card-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-card-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-card-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-card-border-color%3A%20var(--bf-theme-card-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-card-bg%3A%20var(--bf-theme-card-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-card-color%3A%20var(--bf-theme-card-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-card-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-card-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-card-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-card-font)%3B%0A%09color%3A%20var(--bf-card-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-card-bg)%3B%0A%09color%3A%20var(--bf-card-color)%3B%0A%09border-width%3A%20var(--bf-card-border-width)%3B%0A%09border-style%3A%20var(--bf-card-border-style)%3B%0A%09border-color%3A%20var(--bf-card-border-color)%3B%0A%09border-radius%3A%20var(--bf-card-radius)%3B%0A%09padding%3A%20var(--bf-card-padding-y)%20var(--bf-card-padding-x)%3B%0A%09transition%3A%20var(--bf-card-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "card";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-card", BfCard);

// src/carousel/carousel.js
var BfCarousel = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-carousel-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-carousel-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-carousel-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-carousel-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-carousel-border-color%3A%20var(--bf-theme-carousel-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-carousel-bg%3A%20var(--bf-theme-carousel-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-carousel-color%3A%20var(--bf-theme-carousel-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-carousel-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-carousel-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-carousel-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-carousel-font)%3B%0A%09color%3A%20var(--bf-carousel-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-carousel-bg)%3B%0A%09color%3A%20var(--bf-carousel-color)%3B%0A%09border-width%3A%20var(--bf-carousel-border-width)%3B%0A%09border-style%3A%20var(--bf-carousel-border-style)%3B%0A%09border-color%3A%20var(--bf-carousel-border-color)%3B%0A%09border-radius%3A%20var(--bf-carousel-radius)%3B%0A%09padding%3A%20var(--bf-carousel-padding-y)%20var(--bf-carousel-padding-x)%3B%0A%09transition%3A%20var(--bf-carousel-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "carousel";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-carousel", BfCarousel);

// src/chart/chart.js
var BfChart = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      this._sync();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-chart-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-chart-radius%3A%20var(--bf-theme-radius-md%2C%2010px)%3B%0A%09--bf-chart-border-color%3A%20var(--bf-theme-chart-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-chart-bg%3A%20var(--bf-theme-chart-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-chart-color%3A%20var(--bf-theme-chart-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-chart-accent%3A%20var(--bf-theme-button-primary-bg%2C%20%232563eb)%3B%0A%09--bf-chart-muted%3A%20var(--bf-theme-surface-2%2C%20%23e2e8f0)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-chart-font)%3B%0A%09color%3A%20var(--bf-chart-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-chart-bg)%3B%0A%09color%3A%20var(--bf-chart-color)%3B%0A%09border%3A%201px%20solid%20var(--bf-chart-border-color)%3B%0A%09border-radius%3A%20var(--bf-chart-radius)%3B%0A%09padding%3A%200.75rem%3B%0A%09display%3A%20grid%3B%0A%09gap%3A%200.55rem%3B%0A%7D%0A%0A.viz%20%7B%0A%09display%3A%20grid%3B%0A%09height%3A%20130px%3B%0A%09align-items%3A%20end%3B%0A%7D%0A%0A.bar%20%7B%0A%09display%3A%20none%3B%0A%09background%3A%20var(--bf-chart-accent)%3B%0A%09border-radius%3A%206px%206px%200%200%3B%0A%7D%0A%0A.viz%20.bar%3Anth-child(1)%20%7B%20height%3A%2035%25%3B%20%7D%0A.viz%20.bar%3Anth-child(2)%20%7B%20height%3A%2052%25%3B%20%7D%0A.viz%20.bar%3Anth-child(3)%20%7B%20height%3A%2074%25%3B%20%7D%0A.viz%20.bar%3Anth-child(4)%20%7B%20height%3A%2046%25%3B%20%7D%0A.viz%20.bar%3Anth-child(5)%20%7B%20height%3A%2062%25%3B%20%7D%0A%0A.line%2C%0A.pie%2C%0A.donut%2C%0A.gauge%2C%0A.heatmap%2C%0A.treemap%2C%0A.gantt%2C%0A.graph%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'bar'%5D%20.viz%2C%0A.root%5Bdata-variant%3D'sparkline'%5D%20.viz%20%7B%0A%09grid-template-columns%3A%20repeat(5%2C%201fr)%3B%0A%09gap%3A%200.45rem%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'bar'%5D%20.bar%20%7B%0A%09display%3A%20block%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'line'%5D%20.line%2C%0A.root%5Bdata-variant%3D'sparkline'%5D%20.line%20%7B%0A%09display%3A%20block%3B%0A%09height%3A%2070%25%3B%0A%09border-bottom%3A%203px%20solid%20var(--bf-chart-accent)%3B%0A%09border-left%3A%203px%20solid%20transparent%3B%0A%09border-right%3A%203px%20solid%20transparent%3B%0A%09clip-path%3A%20polygon(0%2070%25%2C%2018%25%2048%25%2C%2036%25%2058%25%2C%2056%25%2028%25%2C%2076%25%2042%25%2C%20100%25%2012%25%2C%20100%25%20100%25%2C%200%20100%25)%3B%0A%09background%3A%20linear-gradient(to%20top%2C%20color-mix(in%20srgb%2C%20var(--bf-chart-accent)%2020%25%2C%20transparent)%2C%20transparent)%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'line'%5D%20.viz%2C%0A.root%5Bdata-variant%3D'sparkline'%5D%20.viz%20%7B%0A%09grid-template-columns%3A%201fr%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'pie'%5D%20.pie%2C%0A.root%5Bdata-variant%3D'donut'%5D%20.donut%2C%0A.root%5Bdata-variant%3D'gauge'%5D%20.gauge%20%7B%0A%09display%3A%20block%3B%0A%09justify-self%3A%20center%3B%0A%09width%3A%20108px%3B%0A%09height%3A%20108px%3B%0A%09border-radius%3A%2050%25%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'pie'%5D%20.pie%20%7B%0A%09background%3A%20conic-gradient(var(--bf-chart-accent)%200%2062%25%2C%20var(--bf-chart-muted)%2062%25%20100%25)%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'donut'%5D%20.donut%20%7B%0A%09background%3A%0A%09%09radial-gradient(circle%20at%20center%2C%20var(--bf-chart-bg)%2046%25%2C%20transparent%2047%25)%2C%0A%09%09conic-gradient(var(--bf-chart-accent)%200%2068%25%2C%20var(--bf-chart-muted)%2068%25%20100%25)%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'gauge'%5D%20.gauge%20%7B%0A%09height%3A%2064px%3B%0A%09border-radius%3A%2064px%2064px%200%200%3B%0A%09background%3A%20conic-gradient(from%20180deg%20at%2050%25%20100%25%2C%20var(--bf-chart-accent)%200%2058%25%2C%20var(--bf-chart-muted)%2058%25%20100%25)%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'heatmap'%5D%20.heatmap%20%7B%0A%09display%3A%20grid%3B%0A%09grid-template-columns%3A%20repeat(4%2C%201fr)%3B%0A%09gap%3A%200.35rem%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'heatmap'%5D%20.heatmap%20span%20%7B%0A%09aspect-ratio%3A%201%3B%0A%09border-radius%3A%204px%3B%0A%09background%3A%20color-mix(in%20srgb%2C%20var(--bf-chart-accent)%2020%25%2C%20var(--bf-chart-muted))%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'heatmap'%5D%20.heatmap%20span%3Anth-child(3n)%20%7B%0A%09background%3A%20color-mix(in%20srgb%2C%20var(--bf-chart-accent)%2060%25%2C%20var(--bf-chart-muted))%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'treemap'%5D%20.treemap%20%7B%0A%09display%3A%20grid%3B%0A%09grid-template-columns%3A%201.2fr%201fr%3B%0A%09gap%3A%200.35rem%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'treemap'%5D%20.treemap%20span%20%7B%0A%09min-height%3A%2056px%3B%0A%09background%3A%20color-mix(in%20srgb%2C%20var(--bf-chart-accent)%2035%25%2C%20var(--bf-chart-muted))%3B%0A%09border-radius%3A%206px%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'treemap'%5D%20.treemap%20span%3Afirst-child%20%7B%0A%09grid-row%3A%20span%202%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'gantt'%5D%20.gantt%20%7B%0A%09display%3A%20grid%3B%0A%09gap%3A%200.45rem%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'gantt'%5D%20.gantt%20span%20%7B%0A%09height%3A%200.65rem%3B%0A%09border-radius%3A%20999px%3B%0A%09background%3A%20var(--bf-chart-muted)%3B%0A%09position%3A%20relative%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'gantt'%5D%20.gantt%20span%3A%3Aafter%20%7B%0A%09content%3A%20''%3B%0A%09position%3A%20absolute%3B%0A%09inset%3A%200%20auto%200%200%3B%0A%09width%3A%2045%25%3B%0A%09border-radius%3A%20inherit%3B%0A%09background%3A%20var(--bf-chart-accent)%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'gantt'%5D%20.gantt%20span%3Anth-child(2)%3A%3Aafter%20%7B%20width%3A%2070%25%3B%20%7D%0A.root%5Bdata-variant%3D'gantt'%5D%20.gantt%20span%3Anth-child(3)%3A%3Aafter%20%7B%20width%3A%2032%25%3B%20%7D%0A%0A.root%5Bdata-variant%3D'graph'%5D%20.graph%20%7B%0A%09display%3A%20grid%3B%0A%09grid-template-columns%3A%20repeat(3%2C%201fr)%3B%0A%09align-items%3A%20center%3B%0A%09justify-items%3A%20center%3B%0A%09gap%3A%200.45rem%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'graph'%5D%20.graph%20span%20%7B%0A%09width%3A%201rem%3B%0A%09height%3A%201rem%3B%0A%09border-radius%3A%2050%25%3B%0A%09background%3A%20var(--bf-chart-accent)%3B%0A%7D%0A%0A.meta%3Aempty%20%7B%0A%09display%3A%20none%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = `
			<div class="viz" part="viz">
				<div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div><div class="bar"></div>
				<div class="line"></div>
				<div class="pie"></div>
				<div class="donut"></div>
				<div class="gauge"></div>
				<div class="heatmap">
					<span></span><span></span><span></span><span></span>
					<span></span><span></span><span></span><span></span>
					<span></span><span></span><span></span><span></span>
				</div>
				<div class="treemap"><span></span><span></span><span></span></div>
				<div class="gantt"><span></span><span></span><span></span></div>
				<div class="graph"><span></span><span></span><span></span></div>
			</div>
			<div class="meta" part="meta"><slot></slot></div>
		`;
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._sync();
  }
  attributeChangedCallback() {
    this._sync();
  }
  _variant() {
    const explicit = (this.getAttribute("variant") || "").toLowerCase();
    const valid = ["bar", "line", "pie", "donut", "graph", "sparkline", "gauge", "heatmap", "treemap", "gantt"];
    if (valid.includes(explicit)) {
      return explicit;
    }
    for (const item of valid) {
      if (this.hasAttribute(item)) {
        return item;
      }
    }
    return "bar";
  }
  _sync() {
    if (!this._root) {
      return;
    }
    this._root.setAttribute("data-variant", this._variant());
  }
};
__publicField(BfChart, "observedAttributes", [
  "variant",
  "bar",
  "line",
  "pie",
  "donut",
  "graph",
  "sparkline",
  "gauge",
  "heatmap",
  "treemap",
  "gantt"
]);
customElements.define("bf-chart", BfChart);

// src/checkbox/checkbox.js
var BfCheckbox = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onInputChange = this._onInputChange.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._syncState();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-checkbox-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-checkbox-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-checkbox-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-checkbox-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-checkbox-border-color%3A%20var(--bf-theme-checkbox-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-checkbox-bg%3A%20var(--bf-theme-checkbox-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-checkbox-color%3A%20var(--bf-theme-checkbox-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-checkbox-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-checkbox-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-checkbox-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20inline-block%3B%0A%09font%3A%20var(--bf-checkbox-font)%3B%0A%09color%3A%20var(--bf-checkbox-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09display%3A%20inline-flex%3B%0A%09align-items%3A%20center%3B%0A%09gap%3A%200.5rem%3B%0A%09cursor%3A%20pointer%3B%0A%09background%3A%20var(--bf-checkbox-bg)%3B%0A%09color%3A%20var(--bf-checkbox-color)%3B%0A%09border-width%3A%20var(--bf-checkbox-border-width)%3B%0A%09border-style%3A%20var(--bf-checkbox-border-style)%3B%0A%09border-color%3A%20var(--bf-checkbox-border-color)%3B%0A%09border-radius%3A%20var(--bf-checkbox-radius)%3B%0A%09padding%3A%20var(--bf-checkbox-padding-y)%20var(--bf-checkbox-padding-x)%3B%0A%09transition%3A%20var(--bf-checkbox-transition)%3B%0A%7D%0A%0Ainput%20%7B%0A%09position%3A%20absolute%3B%0A%09opacity%3A%200%3B%0A%09width%3A%200%3B%0A%09height%3A%200%3B%0A%7D%0A%0A.box%20%7B%0A%09width%3A%200.95rem%3B%0A%09height%3A%200.95rem%3B%0A%09border-radius%3A%200.25rem%3B%0A%09border%3A%202px%20solid%20var(--bf-checkbox-border-color)%3B%0A%09display%3A%20inline-block%3B%0A%09position%3A%20relative%3B%0A%7D%0A%0A.box%3A%3Aafter%20%7B%0A%09content%3A%20''%3B%0A%09position%3A%20absolute%3B%0A%09left%3A%200.2rem%3B%0A%09top%3A%200.02rem%3B%0A%09width%3A%200.28rem%3B%0A%09height%3A%200.55rem%3B%0A%09border-right%3A%202px%20solid%20var(--bf-theme-button-primary-color%2C%20%23fff)%3B%0A%09border-bottom%3A%202px%20solid%20var(--bf-theme-button-primary-color%2C%20%23fff)%3B%0A%09transform%3A%20rotate(45deg)%20scale(0)%3B%0A%09transition%3A%20transform%20120ms%20ease%3B%0A%7D%0A%0Ainput%3Achecked%20%2B%20.box%20%7B%0A%09background%3A%20var(--bf-theme-button-primary-bg%2C%20%232563eb)%3B%0A%09border-color%3A%20var(--bf-theme-button-primary-bg%2C%20%232563eb)%3B%0A%7D%0A%0Ainput%3Achecked%20%2B%20.box%3A%3Aafter%20%7B%0A%09transform%3A%20rotate(45deg)%20scale(1)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("label");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = `
			<input type="checkbox" part="input" />
			<span class="box" part="box"></span>
			<span class="text" part="text"><slot></slot></span>
		`;
    this.shadowRoot.replaceChildren(link, root);
    this._input = this.shadowRoot.querySelector("input");
    this._input.addEventListener("change", this._onInputChange);
    this._syncState();
  }
  attributeChangedCallback() {
    this._syncState();
  }
  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(value) {
    if (value) {
      this.setAttribute("checked", "");
      return;
    }
    this.removeAttribute("checked");
  }
  get value() {
    return this.getAttribute("value") || this.textContent?.trim() || "";
  }
  _onInputChange() {
    const nextChecked = this._input.checked;
    if (nextChecked && !this._canSelectMore()) {
      this._input.checked = false;
      return;
    }
    this.checked = nextChecked;
    this.dispatchEvent(
      new CustomEvent("bf-change", {
        bubbles: true,
        composed: true,
        detail: {
          group: this._effectiveGroup(),
          value: this.value,
          checked: this.checked
        }
      })
    );
  }
  _effectiveGroup() {
    return this.getAttribute("group") || "";
  }
  _groupLimit() {
    const multiple = this.getAttribute("multiple");
    if (multiple === null) {
      return Infinity;
    }
    if (multiple === "") {
      return Infinity;
    }
    const parsed = Number.parseInt(multiple, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : Infinity;
  }
  _canSelectMore() {
    const group = this._effectiveGroup();
    if (!group) {
      return true;
    }
    const cap = this._groupLimit();
    if (cap === Infinity) {
      return true;
    }
    const selected = [
      ...document.querySelectorAll(
        `bf-checkbox[group="${CSS.escape(group)}"][checked]`
      )
    ];
    return selected.length < cap || selected.includes(this);
  }
  _syncState() {
    if (!this._input) {
      return;
    }
    this._input.checked = this.checked;
    this._input.disabled = this.hasAttribute("disabled");
    this._input.value = this.value;
    if (this.getAttribute("label")) {
      this.setAttribute("aria-label", this.getAttribute("label"));
    }
  }
};
__publicField(BfCheckbox, "observedAttributes", ["checked", "disabled", "label", "value"]);
customElements.define("bf-checkbox", BfCheckbox);

// src/code-block/code-block.js
var BfCodeBlock = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-code-block-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-code-block-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-code-block-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-code-block-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-code-block-border-color%3A%20var(--bf-theme-code-block-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-code-block-bg%3A%20var(--bf-theme-code-block-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-code-block-color%3A%20var(--bf-theme-code-block-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-code-block-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-code-block-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-code-block-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-code-block-font)%3B%0A%09color%3A%20var(--bf-code-block-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-code-block-bg)%3B%0A%09color%3A%20var(--bf-code-block-color)%3B%0A%09border-width%3A%20var(--bf-code-block-border-width)%3B%0A%09border-style%3A%20var(--bf-code-block-border-style)%3B%0A%09border-color%3A%20var(--bf-code-block-border-color)%3B%0A%09border-radius%3A%20var(--bf-code-block-radius)%3B%0A%09padding%3A%20var(--bf-code-block-padding-y)%20var(--bf-code-block-padding-x)%3B%0A%09transition%3A%20var(--bf-code-block-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "code block";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-code-block", BfCodeBlock);

// src/combobox/combobox.js
var BfCombobox = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-combobox-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-combobox-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-combobox-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-combobox-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-combobox-border-color%3A%20var(--bf-theme-combobox-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-combobox-bg%3A%20var(--bf-theme-combobox-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-combobox-color%3A%20var(--bf-theme-combobox-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-combobox-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-combobox-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-combobox-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-combobox-font)%3B%0A%09color%3A%20var(--bf-combobox-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-combobox-bg)%3B%0A%09color%3A%20var(--bf-combobox-color)%3B%0A%09border-width%3A%20var(--bf-combobox-border-width)%3B%0A%09border-style%3A%20var(--bf-combobox-border-style)%3B%0A%09border-color%3A%20var(--bf-combobox-border-color)%3B%0A%09border-radius%3A%20var(--bf-combobox-radius)%3B%0A%09padding%3A%20var(--bf-combobox-padding-y)%20var(--bf-combobox-padding-x)%3B%0A%09transition%3A%20var(--bf-combobox-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "combobox";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-combobox", BfCombobox);

// src/command-palette/command-palette.js
var BfCommandPalette = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-command-palette-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-command-palette-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-command-palette-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-command-palette-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-command-palette-border-color%3A%20var(--bf-theme-command-palette-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-command-palette-bg%3A%20var(--bf-theme-command-palette-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-command-palette-color%3A%20var(--bf-theme-command-palette-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-command-palette-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-command-palette-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-command-palette-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-command-palette-font)%3B%0A%09color%3A%20var(--bf-command-palette-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-command-palette-bg)%3B%0A%09color%3A%20var(--bf-command-palette-color)%3B%0A%09border-width%3A%20var(--bf-command-palette-border-width)%3B%0A%09border-style%3A%20var(--bf-command-palette-border-style)%3B%0A%09border-color%3A%20var(--bf-command-palette-border-color)%3B%0A%09border-radius%3A%20var(--bf-command-palette-radius)%3B%0A%09padding%3A%20var(--bf-command-palette-padding-y)%20var(--bf-command-palette-padding-x)%3B%0A%09transition%3A%20var(--bf-command-palette-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "command palette";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-command-palette", BfCommandPalette);

// src/countdown/countdown.js
var BfCountdown = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-countdown-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-countdown-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-countdown-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-countdown-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-countdown-border-color%3A%20var(--bf-theme-countdown-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-countdown-bg%3A%20var(--bf-theme-countdown-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-countdown-color%3A%20var(--bf-theme-countdown-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-countdown-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-countdown-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-countdown-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-countdown-font)%3B%0A%09color%3A%20var(--bf-countdown-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-countdown-bg)%3B%0A%09color%3A%20var(--bf-countdown-color)%3B%0A%09border-width%3A%20var(--bf-countdown-border-width)%3B%0A%09border-style%3A%20var(--bf-countdown-border-style)%3B%0A%09border-color%3A%20var(--bf-countdown-border-color)%3B%0A%09border-radius%3A%20var(--bf-countdown-radius)%3B%0A%09padding%3A%20var(--bf-countdown-padding-y)%20var(--bf-countdown-padding-x)%3B%0A%09transition%3A%20var(--bf-countdown-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "countdown";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-countdown", BfCountdown);

// src/data-grid/data-grid.js
var BfDataGrid = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-data-grid-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-data-grid-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-data-grid-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-data-grid-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-data-grid-border-color%3A%20var(--bf-theme-data-grid-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-data-grid-bg%3A%20var(--bf-theme-data-grid-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-data-grid-color%3A%20var(--bf-theme-data-grid-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-data-grid-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-data-grid-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-data-grid-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-data-grid-font)%3B%0A%09color%3A%20var(--bf-data-grid-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-data-grid-bg)%3B%0A%09color%3A%20var(--bf-data-grid-color)%3B%0A%09border-width%3A%20var(--bf-data-grid-border-width)%3B%0A%09border-style%3A%20var(--bf-data-grid-border-style)%3B%0A%09border-color%3A%20var(--bf-data-grid-border-color)%3B%0A%09border-radius%3A%20var(--bf-data-grid-radius)%3B%0A%09padding%3A%20var(--bf-data-grid-padding-y)%20var(--bf-data-grid-padding-x)%3B%0A%09transition%3A%20var(--bf-data-grid-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "data grid";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-data-grid", BfDataGrid);

// src/date-picker/date-picker.js
var BfDatePicker = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-date-picker-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-date-picker-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-date-picker-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-date-picker-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-date-picker-border-color%3A%20var(--bf-theme-date-picker-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-date-picker-bg%3A%20var(--bf-theme-date-picker-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-date-picker-color%3A%20var(--bf-theme-date-picker-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-date-picker-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-date-picker-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-date-picker-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-date-picker-font)%3B%0A%09color%3A%20var(--bf-date-picker-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-date-picker-bg)%3B%0A%09color%3A%20var(--bf-date-picker-color)%3B%0A%09border-width%3A%20var(--bf-date-picker-border-width)%3B%0A%09border-style%3A%20var(--bf-date-picker-border-style)%3B%0A%09border-color%3A%20var(--bf-date-picker-border-color)%3B%0A%09border-radius%3A%20var(--bf-date-picker-radius)%3B%0A%09padding%3A%20var(--bf-date-picker-padding-y)%20var(--bf-date-picker-padding-x)%3B%0A%09transition%3A%20var(--bf-date-picker-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "date picker";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-date-picker", BfDatePicker);

// src/date-range-picker/date-range-picker.js
var BfDateRangePicker = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-date-range-picker-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-date-range-picker-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-date-range-picker-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-date-range-picker-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-date-range-picker-border-color%3A%20var(--bf-theme-date-range-picker-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-date-range-picker-bg%3A%20var(--bf-theme-date-range-picker-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-date-range-picker-color%3A%20var(--bf-theme-date-range-picker-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-date-range-picker-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-date-range-picker-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-date-range-picker-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-date-range-picker-font)%3B%0A%09color%3A%20var(--bf-date-range-picker-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-date-range-picker-bg)%3B%0A%09color%3A%20var(--bf-date-range-picker-color)%3B%0A%09border-width%3A%20var(--bf-date-range-picker-border-width)%3B%0A%09border-style%3A%20var(--bf-date-range-picker-border-style)%3B%0A%09border-color%3A%20var(--bf-date-range-picker-border-color)%3B%0A%09border-radius%3A%20var(--bf-date-range-picker-radius)%3B%0A%09padding%3A%20var(--bf-date-range-picker-padding-y)%20var(--bf-date-range-picker-padding-x)%3B%0A%09transition%3A%20var(--bf-date-range-picker-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "date range picker";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-date-range-picker", BfDateRangePicker);

// src/dialog/dialog.js
var BfDialog = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onBackdropClick = this._onBackdropClick.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._sync();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-dialog-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-dialog-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-dialog-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-dialog-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-dialog-border-color%3A%20var(--bf-theme-dialog-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-dialog-bg%3A%20var(--bf-theme-dialog-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-dialog-color%3A%20var(--bf-theme-dialog-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-dialog-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-dialog-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-dialog-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09--bf-dialog-backdrop%3A%20rgba(2%2C%206%2C%2023%2C%200.45)%3B%0A%09--bf-dialog-max-w%3A%2036rem%3B%0A%09--bf-dialog-shadow%3A%200%2018px%2044px%20rgba(2%2C%206%2C%2023%2C%200.28)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-dialog-font)%3B%0A%09color%3A%20var(--bf-dialog-color)%3B%0A%09z-index%3A%201100%3B%0A%7D%0A%0A.root%20%7B%0A%09position%3A%20fixed%3B%0A%09inset%3A%200%3B%0A%09display%3A%20grid%3B%0A%09align-items%3A%20center%3B%0A%09justify-items%3A%20center%3B%0A%09padding%3A%201rem%3B%0A%7D%0A%0A.backdrop%20%7B%0A%09position%3A%20absolute%3B%0A%09inset%3A%200%3B%0A%09background%3A%20var(--bf-dialog-backdrop)%3B%0A%7D%0A%0A.panel%20%7B%0A%09position%3A%20relative%3B%0A%09width%3A%20min(100%25%2C%20var(--bf-dialog-max-w))%3B%0A%09background%3A%20var(--bf-dialog-bg)%3B%0A%09color%3A%20var(--bf-dialog-color)%3B%0A%09border-width%3A%20var(--bf-dialog-border-width)%3B%0A%09border-style%3A%20var(--bf-dialog-border-style)%3B%0A%09border-color%3A%20var(--bf-dialog-border-color)%3B%0A%09border-radius%3A%20var(--bf-dialog-radius)%3B%0A%09padding%3A%20var(--bf-dialog-padding-y)%20var(--bf-dialog-padding-x)%3B%0A%09transition%3A%20var(--bf-dialog-transition)%3B%0A%09box-shadow%3A%20var(--bf-dialog-shadow)%3B%0A%7D%0A%0A.root%5Bdata-open%3D'false'%5D%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'tooltip'%5D%20.backdrop%2C%0A.root%5Bdata-variant%3D'popover'%5D%20.backdrop%2C%0A.root%5Bdata-variant%3D'panel'%5D%20.backdrop%2C%0A.root%5Bdata-variant%3D'sheet'%5D%20.backdrop%2C%0A.root%5Bdata-variant%3D'bottom-sheet'%5D%20.backdrop%20%7B%0A%09background%3A%20transparent%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'tooltip'%5D%20.panel%20%7B%0A%09width%3A%20auto%3B%0A%09max-width%3A%2018rem%3B%0A%09padding%3A%200.35rem%200.55rem%3B%0A%09border-radius%3A%206px%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'popover'%5D%20.panel%20%7B%0A%09width%3A%20min(24rem%2C%20100%25)%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'sheet'%5D%20%7B%0A%09align-items%3A%20center%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'bottom-sheet'%5D%20%7B%0A%09align-items%3A%20end%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'bottom-sheet'%5D%20.panel%20%7B%0A%09width%3A%20min(100%25%2C%2042rem)%3B%0A%09border-radius%3A%2014px%2014px%200%200%3B%0A%7D%0A%0A.root%5Bdata-position%3D'top'%5D%20%7B%0A%09align-items%3A%20start%3B%0A%7D%0A%0A.root%5Bdata-position%3D'bottom'%5D%20%7B%0A%09align-items%3A%20end%3B%0A%7D%0A%0A.root%5Bdata-position%3D'left'%5D%20%7B%0A%09justify-items%3A%20start%3B%0A%7D%0A%0A.root%5Bdata-position%3D'right'%5D%20%7B%0A%09justify-items%3A%20end%3B%0A%7D%0A%0A.root%5Bdata-position%3D'top-left'%5D%20%7B%0A%09align-items%3A%20start%3B%0A%09justify-items%3A%20start%3B%0A%7D%0A%0A.root%5Bdata-position%3D'top-right'%5D%20%7B%0A%09align-items%3A%20start%3B%0A%09justify-items%3A%20end%3B%0A%7D%0A%0A.root%5Bdata-position%3D'bottom-left'%5D%20%7B%0A%09align-items%3A%20end%3B%0A%09justify-items%3A%20start%3B%0A%7D%0A%0A.root%5Bdata-position%3D'bottom-right'%5D%20%7B%0A%09align-items%3A%20end%3B%0A%09justify-items%3A%20end%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = `
			<div class="backdrop" part="backdrop"></div>
			<div class="panel" part="panel"><slot></slot></div>
		`;
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._backdrop = root.querySelector(".backdrop");
    this._panel = root.querySelector(".panel");
    this._backdrop.addEventListener("click", this._onBackdropClick);
    if (!this.textContent?.trim()) {
      this.textContent = "dialog";
    }
    this._sync();
  }
  attributeChangedCallback() {
    this._sync();
  }
  get openState() {
    return this.hasAttribute("open");
  }
  open() {
    this.setAttribute("open", "");
  }
  close() {
    this.removeAttribute("open");
  }
  toggle() {
    if (this.hasAttribute("open")) {
      this.close();
      return;
    }
    this.open();
  }
  _onBackdropClick() {
    const variant = this._variant();
    if (variant === "tooltip" || variant === "popover") {
      return;
    }
    if (this.hasAttribute("persistent")) {
      return;
    }
    this.close();
    this.dispatchEvent(
      new CustomEvent("bf-close", {
        bubbles: true,
        composed: true,
        detail: { id: this.id || "" }
      })
    );
  }
  _variant() {
    const explicit = (this.getAttribute("variant") || "").toLowerCase();
    if ([
      "dialog",
      "sheet",
      "bottom-sheet",
      "popover",
      "tooltip",
      "panel"
    ].includes(explicit)) {
      return explicit;
    }
    if (this.hasAttribute("sheet")) {
      return "sheet";
    }
    if (this.hasAttribute("bottom-sheet")) {
      return "bottom-sheet";
    }
    if (this.hasAttribute("popover")) {
      return "popover";
    }
    if (this.hasAttribute("tooltip")) {
      return "tooltip";
    }
    if (this.hasAttribute("panel")) {
      return "panel";
    }
    return "dialog";
  }
  _position() {
    const explicit = (this.getAttribute("position") || "").toLowerCase().replace(/\s+/g, "-");
    if ([
      "center",
      "left",
      "right",
      "top",
      "bottom",
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right"
    ].includes(explicit)) {
      return explicit;
    }
    if (this.hasAttribute("left")) {
      return "left";
    }
    if (this.hasAttribute("right")) {
      return "right";
    }
    if (this.hasAttribute("top")) {
      return "top";
    }
    if (this.hasAttribute("bottom")) {
      return "bottom";
    }
    if (this.hasAttribute("center")) {
      return "center";
    }
    return "center";
  }
  _shouldOpenByDefault() {
    return !this.hasAttribute("id");
  }
  _sync() {
    if (!this._root || !this._panel) {
      return;
    }
    if (!this.hasAttribute("open") && this._shouldOpenByDefault()) {
      this.setAttribute("open", "");
      return;
    }
    const isOpen = this.hasAttribute("open");
    const variant = this._variant();
    const position = this._position();
    this._root.setAttribute("data-open", isOpen ? "true" : "false");
    this._root.setAttribute("data-variant", variant);
    this._root.setAttribute("data-position", position);
    this.hidden = !isOpen;
    this.setAttribute("aria-hidden", String(!isOpen));
    this.setAttribute("role", variant === "tooltip" ? "tooltip" : "dialog");
    if (this.getAttribute("label")) {
      this.setAttribute("aria-label", this.getAttribute("label"));
    }
  }
};
__publicField(BfDialog, "observedAttributes", [
  "open",
  "variant",
  "position",
  "modal",
  "sheet",
  "bottom-sheet",
  "popover",
  "tooltip",
  "panel",
  "top",
  "bottom",
  "left",
  "right",
  "center",
  "label"
]);
customElements.define("bf-dialog", BfDialog);

// src/divider/divider.js
var BfDivider = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      this._sync();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-divider-border-color%3A%20var(--bf-theme-divider-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-divider-thickness%3A%201px%3B%0A%09--bf-divider-min-length%3A%202rem%3B%0A%0A%09display%3A%20block%3B%0A%7D%0A%0A.root%20%7B%0A%09box-sizing%3A%20border-box%3B%0A%09border-radius%3A%20999px%3B%0A%09background%3A%20var(--bf-divider-border-color)%3B%0A%09min-width%3A%20var(--bf-divider-min-length)%3B%0A%7D%0A%0A.root%5Bdata-orientation%3D'horizontal'%5D%20%7B%0A%09height%3A%20var(--bf-divider-thickness)%3B%0A%09width%3A%20100%25%3B%0A%7D%0A%0A.root%5Bdata-orientation%3D'vertical'%5D%20%7B%0A%09width%3A%20var(--bf-divider-thickness)%3B%0A%09height%3A%20100%25%3B%0A%09min-height%3A%20var(--bf-divider-min-length)%3B%0A%09min-width%3A%200%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._sync();
  }
  attributeChangedCallback() {
    this._sync();
  }
  _sync() {
    if (!this._root) {
      return;
    }
    const isVertical = this.hasAttribute("vertical");
    this._root.dataset.orientation = isVertical ? "vertical" : "horizontal";
    const raw = this.getAttribute("thickness");
    if (!raw) {
      this.style.removeProperty("--bf-divider-thickness");
      return;
    }
    const parsed = Number.parseFloat(raw);
    if (Number.isFinite(parsed)) {
      this.style.setProperty("--bf-divider-thickness", `${parsed}px`);
      return;
    }
    this.style.setProperty("--bf-divider-thickness", raw);
  }
};
__publicField(BfDivider, "observedAttributes", ["vertical", "thickness"]);
customElements.define("bf-divider", BfDivider);

// src/drawer/drawer.js
var BfDrawer = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onBackdropClick = this._onBackdropClick.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._sync();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-drawer-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-drawer-bg%3A%20var(--bf-theme-drawer-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-drawer-color%3A%20var(--bf-theme-drawer-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-drawer-border-color%3A%20var(--bf-theme-drawer-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-drawer-backdrop%3A%20rgba(2%2C%206%2C%2023%2C%200.35)%3B%0A%09--bf-drawer-width%3A%20min(90vw%2C%2022rem)%3B%0A%09--bf-drawer-height%3A%20min(75vh%2C%2024rem)%3B%0A%09--bf-drawer-shadow%3A%200%2018px%2044px%20rgba(2%2C%206%2C%2023%2C%200.28)%3B%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-drawer-font)%3B%0A%09z-index%3A%201190%3B%0A%7D%0A%0A.root%20%7B%0A%09position%3A%20fixed%3B%0A%09inset%3A%200%3B%0A%09display%3A%20grid%3B%0A%7D%0A%0A.root%5Bdata-open%3D'false'%5D%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.backdrop%20%7B%0A%09position%3A%20absolute%3B%0A%09inset%3A%200%3B%0A%09background%3A%20var(--bf-drawer-backdrop)%3B%0A%7D%0A%0A.panel%20%7B%0A%09position%3A%20relative%3B%0A%09background%3A%20var(--bf-drawer-bg)%3B%0A%09color%3A%20var(--bf-drawer-color)%3B%0A%09border%3A%201px%20solid%20var(--bf-drawer-border-color)%3B%0A%09box-shadow%3A%20var(--bf-drawer-shadow)%3B%0A%09padding%3A%201rem%3B%0A%7D%0A%0A.root%5Bdata-side%3D'right'%5D%20%7B%0A%09justify-items%3A%20end%3B%0A%7D%0A%0A.root%5Bdata-side%3D'right'%5D%20.panel%20%7B%0A%09width%3A%20var(--bf-drawer-width)%3B%0A%09height%3A%20100%25%3B%0A%09border-radius%3A%200%3B%0A%7D%0A%0A.root%5Bdata-side%3D'left'%5D%20%7B%0A%09justify-items%3A%20start%3B%0A%7D%0A%0A.root%5Bdata-side%3D'left'%5D%20.panel%20%7B%0A%09width%3A%20var(--bf-drawer-width)%3B%0A%09height%3A%20100%25%3B%0A%09border-radius%3A%200%3B%0A%7D%0A%0A.root%5Bdata-side%3D'top'%5D%20%7B%0A%09align-items%3A%20start%3B%0A%7D%0A%0A.root%5Bdata-side%3D'top'%5D%20.panel%20%7B%0A%09width%3A%20100%25%3B%0A%09max-width%3A%20100%25%3B%0A%09height%3A%20var(--bf-drawer-height)%3B%0A%09border-radius%3A%200%200%2012px%2012px%3B%0A%7D%0A%0A.root%5Bdata-side%3D'bottom'%5D%20%7B%0A%09align-items%3A%20end%3B%0A%7D%0A%0A.root%5Bdata-side%3D'bottom'%5D%20.panel%20%7B%0A%09width%3A%20100%25%3B%0A%09max-width%3A%20100%25%3B%0A%09height%3A%20var(--bf-drawer-height)%3B%0A%09border-radius%3A%2012px%2012px%200%200%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = `
			<div class="backdrop" part="backdrop"></div>
			<div class="panel" part="panel"><slot></slot></div>
		`;
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._backdrop = root.querySelector(".backdrop");
    this._backdrop.addEventListener("click", this._onBackdropClick);
    if (!this.textContent?.trim()) {
      this.textContent = "drawer";
    }
    this._sync();
  }
  attributeChangedCallback() {
    this._sync();
  }
  open() {
    this.setAttribute("open", "");
  }
  close() {
    this.removeAttribute("open");
  }
  toggle() {
    if (this.hasAttribute("open")) {
      this.close();
      return;
    }
    this.open();
  }
  _onBackdropClick() {
    if (this.hasAttribute("persistent")) {
      return;
    }
    this.close();
  }
  _side() {
    const explicit = (this.getAttribute("side") || "").toLowerCase();
    if (["left", "right", "top", "bottom"].includes(explicit)) {
      return explicit;
    }
    if (this.hasAttribute("left")) {
      return "left";
    }
    if (this.hasAttribute("top")) {
      return "top";
    }
    if (this.hasAttribute("bottom")) {
      return "bottom";
    }
    return "right";
  }
  _shouldOpenByDefault() {
    return !this.hasAttribute("id");
  }
  _sync() {
    if (!this._root) {
      return;
    }
    if (!this.hasAttribute("open") && this._shouldOpenByDefault()) {
      this.setAttribute("open", "");
      return;
    }
    const isOpen = this.hasAttribute("open");
    this.hidden = !isOpen;
    this._root.setAttribute("data-open", isOpen ? "true" : "false");
    this._root.setAttribute("data-side", this._side());
    this.setAttribute("aria-hidden", String(!isOpen));
    this.setAttribute("role", "dialog");
    if (this.getAttribute("label")) {
      this.setAttribute("aria-label", this.getAttribute("label"));
    }
  }
};
__publicField(BfDrawer, "observedAttributes", ["open", "side", "label", "left", "right", "top", "bottom"]);
customElements.define("bf-drawer", BfDrawer);

// src/dropdown/dropdown.js
var BfDropdown = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-dropdown-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-dropdown-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-dropdown-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-dropdown-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-dropdown-border-color%3A%20var(--bf-theme-dropdown-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-dropdown-bg%3A%20var(--bf-theme-dropdown-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-dropdown-color%3A%20var(--bf-theme-dropdown-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-dropdown-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-dropdown-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-dropdown-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-dropdown-font)%3B%0A%09color%3A%20var(--bf-dropdown-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-dropdown-bg)%3B%0A%09color%3A%20var(--bf-dropdown-color)%3B%0A%09border-width%3A%20var(--bf-dropdown-border-width)%3B%0A%09border-style%3A%20var(--bf-dropdown-border-style)%3B%0A%09border-color%3A%20var(--bf-dropdown-border-color)%3B%0A%09border-radius%3A%20var(--bf-dropdown-radius)%3B%0A%09padding%3A%20var(--bf-dropdown-padding-y)%20var(--bf-dropdown-padding-x)%3B%0A%09transition%3A%20var(--bf-dropdown-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "dropdown";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-dropdown", BfDropdown);

// src/edge/edge.js
var BfEdge = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      this._syncPosition();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-edge-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-edge-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-edge-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-edge-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-edge-border-color%3A%20var(--bf-theme-header-border-color%2C%20var(--bf-theme-footer-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1)))%3B%0A%09--bf-edge-bg%3A%20var(--bf-theme-header-bg%2C%20var(--bf-theme-footer-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff)))%3B%0A%09--bf-edge-color%3A%20var(--bf-theme-header-color%2C%20var(--bf-theme-footer-color%2C%20var(--bf-theme-text-1%2C%20%230f172a)))%3B%0A%09--bf-edge-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-edge-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-edge-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-edge-font)%3B%0A%09color%3A%20var(--bf-edge-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-edge-bg)%3B%0A%09color%3A%20var(--bf-edge-color)%3B%0A%09border-width%3A%20var(--bf-edge-border-width)%3B%0A%09border-style%3A%20var(--bf-edge-border-style)%3B%0A%09border-color%3A%20var(--bf-edge-border-color)%3B%0A%09border-radius%3A%20var(--bf-edge-radius)%3B%0A%09padding%3A%20var(--bf-edge-padding-y)%20var(--bf-edge-padding-x)%3B%0A%09transition%3A%20var(--bf-edge-transition)%3B%0A%7D%0A%0A%3Ahost(%5Bsticky%5D)%20%7B%0A%09position%3A%20sticky%3B%0A%09z-index%3A%20var(--bf-theme-z-sticky%2C%20100)%3B%0A%7D%0A%0A%3Ahost(%5Bfixed%5D)%20%7B%0A%09position%3A%20fixed%3B%0A%09left%3A%200%3B%0A%09right%3A%200%3B%0A%09z-index%3A%20var(--bf-theme-z-fixed%2C%20200)%3B%0A%7D%0A%0A%3Ahost(%5Bheader%5D%5Bsticky%5D)%2C%0A%3Ahost(%5Bheader%5D%5Bfixed%5D)%20%7B%0A%09top%3A%200%3B%0A%09bottom%3A%20auto%3B%0A%7D%0A%0A%3Ahost(%5Bfooter%5D%5Bsticky%5D)%2C%0A%3Ahost(%5Bfooter%5D%5Bfixed%5D)%20%7B%0A%09bottom%3A%200%3B%0A%09top%3A%20auto%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "edge";
    }
    this.shadowRoot.replaceChildren(link, root);
    this._syncPosition();
  }
  attributeChangedCallback() {
    this._syncPosition();
  }
  _syncPosition() {
    if (!this.hasAttribute("header") && !this.hasAttribute("footer") && !this.getAttribute("position")) {
      this.setAttribute("header", "");
    }
    const position = this.getAttribute("position");
    if (position === "bottom") {
      this.removeAttribute("header");
      this.setAttribute("footer", "");
    }
    if (position === "top") {
      this.removeAttribute("footer");
      this.setAttribute("header", "");
    }
  }
};
__publicField(BfEdge, "observedAttributes", ["position", "sticky", "fixed", "header", "footer"]);
customElements.define("bf-edge", BfEdge);

// src/empty-state/empty-state.js
var BfEmptyState = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-empty-state-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-empty-state-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-empty-state-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-empty-state-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-empty-state-border-color%3A%20var(--bf-theme-empty-state-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-empty-state-bg%3A%20var(--bf-theme-empty-state-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-empty-state-color%3A%20var(--bf-theme-empty-state-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-empty-state-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-empty-state-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-empty-state-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-empty-state-font)%3B%0A%09color%3A%20var(--bf-empty-state-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-empty-state-bg)%3B%0A%09color%3A%20var(--bf-empty-state-color)%3B%0A%09border-width%3A%20var(--bf-empty-state-border-width)%3B%0A%09border-style%3A%20var(--bf-empty-state-border-style)%3B%0A%09border-color%3A%20var(--bf-empty-state-border-color)%3B%0A%09border-radius%3A%20var(--bf-empty-state-radius)%3B%0A%09padding%3A%20var(--bf-empty-state-padding-y)%20var(--bf-empty-state-padding-x)%3B%0A%09transition%3A%20var(--bf-empty-state-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "empty state";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-empty-state", BfEmptyState);

// src/error-summary/error-summary.js
var BfErrorSummary = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-error-summary-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-error-summary-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-error-summary-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-error-summary-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-error-summary-border-color%3A%20var(--bf-theme-error-summary-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-error-summary-bg%3A%20var(--bf-theme-error-summary-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-error-summary-color%3A%20var(--bf-theme-error-summary-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-error-summary-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-error-summary-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-error-summary-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-error-summary-font)%3B%0A%09color%3A%20var(--bf-error-summary-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-error-summary-bg)%3B%0A%09color%3A%20var(--bf-error-summary-color)%3B%0A%09border-width%3A%20var(--bf-error-summary-border-width)%3B%0A%09border-style%3A%20var(--bf-error-summary-border-style)%3B%0A%09border-color%3A%20var(--bf-error-summary-border-color)%3B%0A%09border-radius%3A%20var(--bf-error-summary-radius)%3B%0A%09padding%3A%20var(--bf-error-summary-padding-y)%20var(--bf-error-summary-padding-x)%3B%0A%09transition%3A%20var(--bf-error-summary-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "error summary";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-error-summary", BfErrorSummary);

// src/fab/fab.js
var BfFab = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-fab-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-fab-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-fab-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-fab-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-fab-border-color%3A%20var(--bf-theme-fab-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-fab-bg%3A%20var(--bf-theme-fab-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-fab-color%3A%20var(--bf-theme-fab-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-fab-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-fab-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-fab-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-fab-font)%3B%0A%09color%3A%20var(--bf-fab-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-fab-bg)%3B%0A%09color%3A%20var(--bf-fab-color)%3B%0A%09border-width%3A%20var(--bf-fab-border-width)%3B%0A%09border-style%3A%20var(--bf-fab-border-style)%3B%0A%09border-color%3A%20var(--bf-fab-border-color)%3B%0A%09border-radius%3A%20var(--bf-fab-radius)%3B%0A%09padding%3A%20var(--bf-fab-padding-y)%20var(--bf-fab-padding-x)%3B%0A%09transition%3A%20var(--bf-fab-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "fab";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-fab", BfFab);

// src/file-upload/file-upload.js
var BfFileUpload = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onRootClick = this._onRootClick.bind(this);
    this._onInputChange = this._onInputChange.bind(this);
    this._onDragOver = this._onDragOver.bind(this);
    this._onDragLeave = this._onDragLeave.bind(this);
    this._onDrop = this._onDrop.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._sync();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-file-upload-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-file-upload-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-file-upload-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-file-upload-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-file-upload-border-color%3A%20var(%0A%09%09--bf-theme-file-upload-border-color%2C%0A%09%09var(--bf-theme-upload-dropzone-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%0A%09)%3B%0A%09--bf-file-upload-bg%3A%20var(%0A%09%09--bf-theme-file-upload-bg%2C%0A%09%09var(--bf-theme-upload-dropzone-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%0A%09)%3B%0A%09--bf-file-upload-color%3A%20var(%0A%09%09--bf-theme-file-upload-color%2C%0A%09%09var(--bf-theme-upload-dropzone-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%0A%09)%3B%0A%09--bf-file-upload-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-file-upload-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-file-upload-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-file-upload-font)%3B%0A%09color%3A%20var(--bf-file-upload-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09display%3A%20grid%3B%0A%09gap%3A%200.45rem%3B%0A%09background%3A%20var(--bf-file-upload-bg)%3B%0A%09color%3A%20var(--bf-file-upload-color)%3B%0A%09border-width%3A%20var(--bf-file-upload-border-width)%3B%0A%09border-style%3A%20var(--bf-file-upload-border-style)%3B%0A%09border-color%3A%20var(--bf-file-upload-border-color)%3B%0A%09border-radius%3A%20var(--bf-file-upload-radius)%3B%0A%09padding%3A%20var(--bf-file-upload-padding-y)%20var(--bf-file-upload-padding-x)%3B%0A%09transition%3A%20var(--bf-file-upload-transition)%3B%0A%09cursor%3A%20pointer%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'dropzone'%5D%20%7B%0A%09min-height%3A%207rem%3B%0A%09align-content%3A%20center%3B%0A%09text-align%3A%20center%3B%0A%7D%0A%0A.root%5Bdata-border%3D'dotted'%5D%20%7B%0A%09border-style%3A%20dotted%3B%0A%7D%0A%0A.root%5Bdata-border%3D'dashed'%5D%20%7B%0A%09border-style%3A%20dashed%3B%0A%7D%0A%0A.root%5Bdata-drag%3D'over'%5D%20%7B%0A%09background%3A%20color-mix(in%20srgb%2C%20var(--bf-file-upload-bg)%2070%25%2C%20var(--bf-file-upload-border-color))%3B%0A%7D%0A%0A.root%5Bdata-disabled%3D'true'%5D%20%7B%0A%09opacity%3A%200.65%3B%0A%09cursor%3A%20not-allowed%3B%0A%7D%0A%0A.native%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.label%20%7B%0A%09font-weight%3A%20600%3B%0A%7D%0A%0A.meta%20%7B%0A%09color%3A%20var(--bf-theme-text-2%2C%20%23475569)%3B%0A%09font-size%3A%200.9em%3B%0A%7D%0A%0A.files%20%7B%0A%09display%3A%20flex%3B%0A%09flex-wrap%3A%20wrap%3B%0A%09gap%3A%200.35rem%3B%0A%7D%0A%0A.file%20%7B%0A%09display%3A%20inline-flex%3B%0A%09align-items%3A%20center%3B%0A%09gap%3A%200.25rem%3B%0A%09padding%3A%200.2rem%200.45rem%3B%0A%09border-radius%3A%20999px%3B%0A%09border%3A%201px%20solid%20color-mix(in%20srgb%2C%20var(--bf-file-upload-border-color)%2090%25%2C%20transparent)%3B%0A%09background%3A%20color-mix(in%20srgb%2C%20var(--bf-file-upload-bg)%2082%25%2C%20var(--bf-file-upload-border-color))%3B%0A%09font-size%3A%200.82em%3B%0A%7D%0A%0Aslot%3Anot(%3Aempty)%20%7B%0A%09display%3A%20block%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = `
			<input class="native" type="file" />
			<div class="label" part="label"></div>
			<div class="meta" part="meta"></div>
			<div class="files" part="files"></div>
			<slot></slot>
		`;
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._input = root.querySelector(".native");
    this._label = root.querySelector(".label");
    this._meta = root.querySelector(".meta");
    this._files = root.querySelector(".files");
    root.addEventListener("click", this._onRootClick);
    this._input.addEventListener("change", this._onInputChange);
    root.addEventListener("dragover", this._onDragOver);
    root.addEventListener("dragleave", this._onDragLeave);
    root.addEventListener("drop", this._onDrop);
    this._sync();
  }
  disconnectedCallback() {
    if (!this._root || !this._input) {
      return;
    }
    this._root.removeEventListener("click", this._onRootClick);
    this._root.removeEventListener("dragover", this._onDragOver);
    this._root.removeEventListener("dragleave", this._onDragLeave);
    this._root.removeEventListener("drop", this._onDrop);
    this._input.removeEventListener("change", this._onInputChange);
  }
  attributeChangedCallback() {
    this._sync();
  }
  _variant() {
    const explicit = (this.getAttribute("variant") || "").toLowerCase();
    if (explicit === "dropzone" || this.hasAttribute("dropzone")) {
      return "dropzone";
    }
    return "input";
  }
  _sync() {
    if (!this._root || !this._input || !this._label || !this._meta || !this._files) {
      return;
    }
    const variant = this._variant();
    this._root.dataset.variant = variant;
    this._root.dataset.border = this.hasAttribute("dotted") ? "dotted" : this.hasAttribute("dashed") ? "dashed" : "solid";
    const disabled = this.hasAttribute("disabled");
    this._root.dataset.disabled = disabled ? "true" : "false";
    this._input.disabled = disabled;
    if (this.hasAttribute("multiple")) {
      this._input.multiple = true;
      this._root.dataset.multiple = "true";
    } else {
      this._input.multiple = false;
      this._root.dataset.multiple = "false";
    }
    const accept = this.getAttribute("accept") || "";
    if (accept) {
      this._input.setAttribute("accept", accept);
    } else {
      this._input.removeAttribute("accept");
    }
    this._label.textContent = this.getAttribute("label") || (variant === "dropzone" ? "Drop files here or click to browse" : "Choose file");
    if (!this._selectedFiles || this._selectedFiles.length === 0) {
      this._meta.textContent = this._input.multiple ? "No files selected" : "No file selected";
      this._files.replaceChildren();
    }
  }
  _onRootClick(event) {
    if (this.hasAttribute("disabled")) {
      return;
    }
    if (event.target instanceof Element && event.target.tagName.toLowerCase() === "a") {
      return;
    }
    this._input.click();
  }
  _onInputChange() {
    this._setFiles(this._input.files);
  }
  _onDragOver(event) {
    if (this._variant() !== "dropzone" || this.hasAttribute("disabled")) {
      return;
    }
    event.preventDefault();
    this._root.dataset.drag = "over";
  }
  _onDragLeave() {
    if (!this._root) {
      return;
    }
    this._root.dataset.drag = "off";
  }
  _onDrop(event) {
    if (this._variant() !== "dropzone" || this.hasAttribute("disabled")) {
      return;
    }
    event.preventDefault();
    this._root.dataset.drag = "off";
    const list = event.dataTransfer?.files;
    if (!list || list.length === 0) {
      return;
    }
    this._setFiles(list);
  }
  _setFiles(fileList) {
    const all = Array.from(fileList || []);
    this._selectedFiles = this._input.multiple ? all : all.slice(0, 1);
    this._meta.textContent = this._selectedFiles.length ? `${this._selectedFiles.length} file${this._selectedFiles.length === 1 ? "" : "s"} selected` : this._input.multiple ? "No files selected" : "No file selected";
    const chips = this._selectedFiles.slice(0, 3).map((file) => {
      const item = document.createElement("span");
      item.className = "file";
      item.textContent = file.name;
      return item;
    });
    if (this._selectedFiles.length > 3) {
      const more = document.createElement("span");
      more.className = "file";
      more.textContent = `+${this._selectedFiles.length - 3} more`;
      chips.push(more);
    }
    this._files.replaceChildren(...chips);
    this.dispatchEvent(
      new CustomEvent("bf-change", {
        bubbles: true,
        composed: true,
        detail: {
          count: this._selectedFiles.length,
          files: this._selectedFiles.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type
          }))
        }
      })
    );
  }
};
__publicField(BfFileUpload, "observedAttributes", [
  "variant",
  "dropzone",
  "multiple",
  "accept",
  "dotted",
  "dashed",
  "disabled"
]);
customElements.define("bf-file-upload", BfFileUpload);

// src/filter-bar/filter-bar.js
var BfFilterBar = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-filter-bar-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-filter-bar-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-filter-bar-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-filter-bar-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-filter-bar-border-color%3A%20var(--bf-theme-filter-bar-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-filter-bar-bg%3A%20var(--bf-theme-filter-bar-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-filter-bar-color%3A%20var(--bf-theme-filter-bar-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-filter-bar-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-filter-bar-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-filter-bar-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-filter-bar-font)%3B%0A%09color%3A%20var(--bf-filter-bar-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-filter-bar-bg)%3B%0A%09color%3A%20var(--bf-filter-bar-color)%3B%0A%09border-width%3A%20var(--bf-filter-bar-border-width)%3B%0A%09border-style%3A%20var(--bf-filter-bar-border-style)%3B%0A%09border-color%3A%20var(--bf-filter-bar-border-color)%3B%0A%09border-radius%3A%20var(--bf-filter-bar-radius)%3B%0A%09padding%3A%20var(--bf-filter-bar-padding-y)%20var(--bf-filter-bar-padding-x)%3B%0A%09transition%3A%20var(--bf-filter-bar-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "filter bar";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-filter-bar", BfFilterBar);

// src/form-field/form-field.js
var BfFormField = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-form-field-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-form-field-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-form-field-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-form-field-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-form-field-border-color%3A%20var(--bf-theme-form-field-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-form-field-bg%3A%20var(--bf-theme-form-field-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-form-field-color%3A%20var(--bf-theme-form-field-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-form-field-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-form-field-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-form-field-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-form-field-font)%3B%0A%09color%3A%20var(--bf-form-field-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-form-field-bg)%3B%0A%09color%3A%20var(--bf-form-field-color)%3B%0A%09border-width%3A%20var(--bf-form-field-border-width)%3B%0A%09border-style%3A%20var(--bf-form-field-border-style)%3B%0A%09border-color%3A%20var(--bf-form-field-border-color)%3B%0A%09border-radius%3A%20var(--bf-form-field-radius)%3B%0A%09padding%3A%20var(--bf-form-field-padding-y)%20var(--bf-form-field-padding-x)%3B%0A%09transition%3A%20var(--bf-form-field-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "form field";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-form-field", BfFormField);

// src/grid/grid.js
var BfGrid = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-grid-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-grid-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-grid-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-grid-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-grid-border-color%3A%20var(--bf-theme-grid-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-grid-bg%3A%20var(--bf-theme-grid-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-grid-color%3A%20var(--bf-theme-grid-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-grid-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-grid-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-grid-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-grid-font)%3B%0A%09color%3A%20var(--bf-grid-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-grid-bg)%3B%0A%09color%3A%20var(--bf-grid-color)%3B%0A%09border-width%3A%20var(--bf-grid-border-width)%3B%0A%09border-style%3A%20var(--bf-grid-border-style)%3B%0A%09border-color%3A%20var(--bf-grid-border-color)%3B%0A%09border-radius%3A%20var(--bf-grid-radius)%3B%0A%09padding%3A%20var(--bf-grid-padding-y)%20var(--bf-grid-padding-x)%3B%0A%09transition%3A%20var(--bf-grid-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "grid";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-grid", BfGrid);

// src/hero/hero.js
var BfHero = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-hero-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-hero-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-hero-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-hero-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-hero-border-color%3A%20var(--bf-theme-hero-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-hero-bg%3A%20var(--bf-theme-hero-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-hero-color%3A%20var(--bf-theme-hero-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-hero-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-hero-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-hero-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-hero-font)%3B%0A%09color%3A%20var(--bf-hero-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-hero-bg)%3B%0A%09color%3A%20var(--bf-hero-color)%3B%0A%09border-width%3A%20var(--bf-hero-border-width)%3B%0A%09border-style%3A%20var(--bf-hero-border-style)%3B%0A%09border-color%3A%20var(--bf-hero-border-color)%3B%0A%09border-radius%3A%20var(--bf-hero-radius)%3B%0A%09padding%3A%20var(--bf-hero-padding-y)%20var(--bf-hero-padding-x)%3B%0A%09transition%3A%20var(--bf-hero-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "hero";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-hero", BfHero);

// src/icon/icon.js
var BfIcon = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-icon-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-icon-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-icon-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-icon-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-icon-border-color%3A%20var(--bf-theme-icon-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-icon-bg%3A%20var(--bf-theme-icon-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-icon-color%3A%20var(--bf-theme-icon-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-icon-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-icon-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-icon-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-icon-font)%3B%0A%09color%3A%20var(--bf-icon-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-icon-bg)%3B%0A%09color%3A%20var(--bf-icon-color)%3B%0A%09border-width%3A%20var(--bf-icon-border-width)%3B%0A%09border-style%3A%20var(--bf-icon-border-style)%3B%0A%09border-color%3A%20var(--bf-icon-border-color)%3B%0A%09border-radius%3A%20var(--bf-icon-radius)%3B%0A%09padding%3A%20var(--bf-icon-padding-y)%20var(--bf-icon-padding-x)%3B%0A%09transition%3A%20var(--bf-icon-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "icon";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-icon", BfIcon);

// src/image/image.js
var BfImage = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-image-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-image-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-image-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-image-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-image-border-color%3A%20var(--bf-theme-image-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-image-bg%3A%20var(--bf-theme-image-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-image-color%3A%20var(--bf-theme-image-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-image-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-image-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-image-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-image-font)%3B%0A%09color%3A%20var(--bf-image-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-image-bg)%3B%0A%09color%3A%20var(--bf-image-color)%3B%0A%09border-width%3A%20var(--bf-image-border-width)%3B%0A%09border-style%3A%20var(--bf-image-border-style)%3B%0A%09border-color%3A%20var(--bf-image-border-color)%3B%0A%09border-radius%3A%20var(--bf-image-radius)%3B%0A%09padding%3A%20var(--bf-image-padding-y)%20var(--bf-image-padding-x)%3B%0A%09transition%3A%20var(--bf-image-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "image";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-image", BfImage);

// src/input/input.js
var BfInput = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onInput = this._onInput.bind(this);
    this._onChange = this._onChange.bind(this);
    this._onFormatChange = this._onFormatChange.bind(this);
    this._onPickerInput = this._onPickerInput.bind(this);
    this._onSwatchClick = this._onSwatchClick.bind(this);
    this._color = { r: 0, g: 0, b: 0, a: 1 };
    this._colorFormat = "hex";
  }
  connectedCallback() {
    if (this._initialized) {
      this._syncState();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-input-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-input-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-input-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-input-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-input-border-color%3A%20var(--bf-theme-input-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-input-bg%3A%20var(--bf-theme-input-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-input-color%3A%20var(--bf-theme-input-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-input-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-input-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-input-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-input-font)%3B%0A%09color%3A%20var(--bf-input-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09display%3A%20flex%3B%0A%09align-items%3A%20center%3B%0A%09gap%3A%200.5rem%3B%0A%09background%3A%20var(--bf-input-bg)%3B%0A%09color%3A%20var(--bf-input-color)%3B%0A%09border-width%3A%20var(--bf-input-border-width)%3B%0A%09border-style%3A%20var(--bf-input-border-style)%3B%0A%09border-color%3A%20var(--bf-input-border-color)%3B%0A%09border-radius%3A%20var(--bf-input-radius)%3B%0A%09padding%3A%20var(--bf-input-padding-y)%20var(--bf-input-padding-x)%3B%0A%09transition%3A%20var(--bf-input-transition)%3B%0A%7D%0A%0A.field%20%7B%0A%09width%3A%20100%25%3B%0A%09min-width%3A%200%3B%0A%09border%3A%200%3B%0A%09outline%3A%200%3B%0A%09background%3A%20transparent%3B%0A%09color%3A%20inherit%3B%0A%09font%3A%20inherit%3B%0A%09padding%3A%200%3B%0A%7D%0A%0A.swatch%2C%0A.format%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.root.is-color%20.swatch%2C%0A.root.is-color%20.format%20%7B%0A%09display%3A%20inline-flex%3B%0A%7D%0A%0A.swatch%20%7B%0A%09width%3A%201.25rem%3B%0A%09height%3A%201.25rem%3B%0A%09border%3A%201px%20solid%20var(--bf-theme-border-1%2C%20%2394a3b8)%3B%0A%09border-radius%3A%204px%3B%0A%09cursor%3A%20pointer%3B%0A%09flex%3A%200%200%20auto%3B%0A%7D%0A%0A.format%20%7B%0A%09border%3A%200%3B%0A%09outline%3A%200%3B%0A%09background%3A%20transparent%3B%0A%09color%3A%20inherit%3B%0A%09font%3A%20inherit%3B%0A%09cursor%3A%20pointer%3B%0A%09flex%3A%200%200%20auto%3B%0A%7D%0A%0A.picker%20%7B%0A%09position%3A%20absolute%3B%0A%09opacity%3A%200%3B%0A%09pointer-events%3A%20none%3B%0A%09width%3A%200%3B%0A%09height%3A%200%3B%0A%7D%0A%0A.root.is-color.swatch-right%20.swatch%20%7B%0A%09order%3A%203%3B%0A%7D%0A%0A.root.is-color.swatch-hidden%20.swatch%20%7B%0A%09display%3A%20none%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = `
			<button class="swatch" part="swatch" type="button" aria-label="Pick color"></button>
			<input class="field" part="input" />
			<select class="format" part="format" aria-label="Color format">
				<option value="hex">HEX</option>
				<option value="rgba">RGBA</option>
			</select>
			<input class="picker" part="picker" type="color" tabindex="-1" aria-hidden="true" />
		`;
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._field = root.querySelector(".field");
    this._swatch = root.querySelector(".swatch");
    this._format = root.querySelector(".format");
    this._picker = root.querySelector(".picker");
    this._field.addEventListener("input", this._onInput);
    this._field.addEventListener("change", this._onChange);
    this._format.addEventListener("change", this._onFormatChange);
    this._picker.addEventListener("input", this._onPickerInput);
    this._swatch.addEventListener("click", this._onSwatchClick);
    if (!this.hasAttribute("value")) {
      const fallbackValue = this.textContent?.trim();
      if (fallbackValue) {
        this.setAttribute("value", fallbackValue);
      }
    }
    this._syncState();
  }
  attributeChangedCallback(name) {
    if (name === "value" && this._reflectingValue) {
      return;
    }
    this._syncState();
  }
  get value() {
    return this._field?.value || "";
  }
  set value(nextValue) {
    this.setAttribute("value", `${nextValue ?? ""}`);
  }
  _reflectValueAttribute() {
    const next = this._field.value;
    if (this.getAttribute("value") === next) {
      return;
    }
    this._reflectingValue = true;
    this.setAttribute("value", next);
    this._reflectingValue = false;
  }
  _onInput() {
    if (this._isColorType()) {
      this._tryConsumeColorString(this._field.value);
    }
    this._reflectValueAttribute();
    this.dispatchEvent(
      new CustomEvent("bf-input", {
        bubbles: true,
        composed: true,
        detail: {
          value: this._field.value
        }
      })
    );
  }
  _onChange() {
    if (this._isColorType()) {
      if (!this._tryConsumeColorString(this._field.value)) {
        this._field.value = this._serializeColor(this._colorFormat, this._color);
      }
      this._renderColorUi();
    }
    this._reflectValueAttribute();
    this.dispatchEvent(
      new CustomEvent("bf-change", {
        bubbles: true,
        composed: true,
        detail: {
          value: this._field.value
        }
      })
    );
  }
  _onFormatChange() {
    if (!this._isColorType()) {
      return;
    }
    this._colorFormat = this._format.value;
    this._field.value = this._serializeColor(this._colorFormat, this._color);
    this._reflectValueAttribute();
  }
  _onPickerInput() {
    if (!this._isColorType()) {
      return;
    }
    const parsed = this._parseHex(this._picker.value);
    if (!parsed) {
      return;
    }
    this._color = { ...parsed, a: this._color.a };
    this._field.value = this._serializeColor(this._colorFormat, this._color);
    this._renderColorUi();
    this._reflectValueAttribute();
    this.dispatchEvent(
      new CustomEvent("bf-input", {
        bubbles: true,
        composed: true,
        detail: {
          value: this._field.value
        }
      })
    );
  }
  _onSwatchClick() {
    if (this._isColorType() && !this.hasAttribute("disabled")) {
      this._picker.click();
    }
  }
  _isColorType() {
    return (this.getAttribute("type") || "text").toLowerCase() === "color";
  }
  _allowedColorFormats() {
    const hasHex = this.hasAttribute("hex");
    const hasRgba = this.hasAttribute("rgba");
    if (hasHex && hasRgba) {
      return ["hex", "rgba"];
    }
    if (hasHex) {
      return ["hex"];
    }
    if (hasRgba) {
      return ["rgba"];
    }
    const explicit = (this.getAttribute("format") || "").toLowerCase();
    if (explicit === "hex") {
      return ["hex"];
    }
    if (explicit === "rgba") {
      return ["rgba"];
    }
    return ["hex", "rgba"];
  }
  _resolveColorFormat(allowed) {
    const explicit = (this.getAttribute("format") || "").toLowerCase();
    if (allowed.includes(explicit)) {
      return explicit;
    }
    if (allowed.includes(this._colorFormat)) {
      return this._colorFormat;
    }
    return allowed[0] || "hex";
  }
  _resolveSwatchPosition() {
    const explicit = (this.getAttribute("swatch") || "").toLowerCase();
    if (explicit === "left" || explicit === "right" || explicit === "hidden") {
      return explicit;
    }
    if (this.hasAttribute("swatch-hidden")) {
      return "hidden";
    }
    if (this.hasAttribute("right")) {
      return "right";
    }
    if (this.hasAttribute("left")) {
      return "left";
    }
    return "left";
  }
  _normalizeHex(hexValue) {
    return this._serializeColor("hex", this._parseHex(hexValue) || this._color);
  }
  _renderColorUi() {
    const swatchPosition = this._resolveSwatchPosition();
    const allowedFormats = this._allowedColorFormats();
    this._colorFormat = this._resolveColorFormat(allowedFormats);
    this._root.classList.add("is-color");
    this._root.classList.toggle("swatch-right", swatchPosition === "right");
    this._root.classList.toggle("swatch-hidden", swatchPosition === "hidden");
    this._format.innerHTML = allowedFormats.map((value) => `<option value="${value}">${value.toUpperCase()}</option>`).join("");
    this._format.value = this._colorFormat;
    this._format.hidden = allowedFormats.length <= 1;
    this._picker.value = this._normalizeHex(this._serializeColor("hex", this._color));
    this._swatch.style.background = this._serializeColor("rgba", this._color);
  }
  _renderDefaultUi() {
    this._root.classList.remove("is-color", "swatch-right", "swatch-hidden");
  }
  _clampChannel(value) {
    return Math.min(255, Math.max(0, value));
  }
  _clampAlpha(value) {
    return Math.min(1, Math.max(0, value));
  }
  _parseHex(value) {
    const raw = `${value || ""}`.trim().replace(/^#/, "");
    if (!raw) {
      return null;
    }
    if (raw.length === 3 || raw.length === 4) {
      const r = Number.parseInt(raw[0] + raw[0], 16);
      const g = Number.parseInt(raw[1] + raw[1], 16);
      const b = Number.parseInt(raw[2] + raw[2], 16);
      const a = raw.length === 4 ? Number.parseInt(raw[3] + raw[3], 16) / 255 : 1;
      if ([r, g, b, a].some((v) => Number.isNaN(v))) {
        return null;
      }
      return { r, g, b, a };
    }
    if (raw.length === 6 || raw.length === 8) {
      const r = Number.parseInt(raw.slice(0, 2), 16);
      const g = Number.parseInt(raw.slice(2, 4), 16);
      const b = Number.parseInt(raw.slice(4, 6), 16);
      const a = raw.length === 8 ? Number.parseInt(raw.slice(6, 8), 16) / 255 : 1;
      if ([r, g, b, a].some((v) => Number.isNaN(v))) {
        return null;
      }
      return { r, g, b, a };
    }
    return null;
  }
  _parseRgba(value) {
    const match = `${value || ""}`.trim().match(/^rgba?\(\s*([^\)]+)\s*\)$/i);
    if (!match) {
      return null;
    }
    const parts = match[1].split(",").map((part) => part.trim());
    if (parts.length !== 3 && parts.length !== 4) {
      return null;
    }
    const r = Number.parseFloat(parts[0]);
    const g = Number.parseFloat(parts[1]);
    const b = Number.parseFloat(parts[2]);
    const a = parts.length === 4 ? Number.parseFloat(parts[3]) : 1;
    if ([r, g, b, a].some((v) => Number.isNaN(v))) {
      return null;
    }
    return {
      r: this._clampChannel(r),
      g: this._clampChannel(g),
      b: this._clampChannel(b),
      a: this._clampAlpha(a)
    };
  }
  _tryConsumeColorString(value) {
    const parsedHex = this._parseHex(value);
    if (parsedHex) {
      this._color = parsedHex;
      this._renderColorUi();
      return true;
    }
    const parsedRgba = this._parseRgba(value);
    if (parsedRgba) {
      this._color = parsedRgba;
      this._renderColorUi();
      return true;
    }
    return false;
  }
  _toHexChannel(value) {
    return Math.round(this._clampChannel(value)).toString(16).padStart(2, "0");
  }
  _toAlphaString(value) {
    const rounded = Math.round(this._clampAlpha(value) * 1e3) / 1e3;
    return `${rounded}`;
  }
  _serializeColor(format, color) {
    if (format === "rgba") {
      return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(
        color.b
      )}, ${this._toAlphaString(color.a)})`;
    }
    return `#${this._toHexChannel(color.r)}${this._toHexChannel(color.g)}${this._toHexChannel(color.b)}`;
  }
  _syncState() {
    if (!this._field || !this._root) {
      return;
    }
    const type = (this.getAttribute("type") || "text").toLowerCase();
    const value = this.getAttribute("value") || "";
    this._field.type = type === "color" ? "text" : type;
    this._field.value = value;
    this._field.placeholder = this.getAttribute("placeholder") || "";
    this._field.disabled = this.hasAttribute("disabled");
    this._field.required = this.hasAttribute("required");
    this._field.readOnly = this.hasAttribute("readonly");
    this._field.name = this.getAttribute("name") || "";
    this._field.min = this.getAttribute("min") || "";
    this._field.max = this.getAttribute("max") || "";
    this._field.step = this.getAttribute("step") || "";
    if (this.getAttribute("label")) {
      this._field.setAttribute("aria-label", this.getAttribute("label"));
    } else {
      this._field.removeAttribute("aria-label");
    }
    if (type === "color") {
      if (!this._tryConsumeColorString(value)) {
        if (!value) {
          this._color = { r: 0, g: 0, b: 0, a: 1 };
        }
      }
      this._renderColorUi();
      this._field.value = this._serializeColor(this._colorFormat, this._color);
      this._reflectValueAttribute();
    } else {
      this._renderDefaultUi();
    }
  }
};
__publicField(BfInput, "observedAttributes", [
  "type",
  "value",
  "placeholder",
  "disabled",
  "required",
  "readonly",
  "name",
  "label",
  "min",
  "max",
  "step",
  "swatch",
  "swatch-hidden",
  "left",
  "right",
  "format",
  "hex",
  "rgba"
]);
customElements.define("bf-input", BfInput);

// src/key-value-list/key-value-list.js
var BfKeyValueList = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-key-value-list-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-key-value-list-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-key-value-list-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-key-value-list-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-key-value-list-border-color%3A%20var(--bf-theme-key-value-list-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-key-value-list-bg%3A%20var(--bf-theme-key-value-list-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-key-value-list-color%3A%20var(--bf-theme-key-value-list-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-key-value-list-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-key-value-list-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-key-value-list-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-key-value-list-font)%3B%0A%09color%3A%20var(--bf-key-value-list-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-key-value-list-bg)%3B%0A%09color%3A%20var(--bf-key-value-list-color)%3B%0A%09border-width%3A%20var(--bf-key-value-list-border-width)%3B%0A%09border-style%3A%20var(--bf-key-value-list-border-style)%3B%0A%09border-color%3A%20var(--bf-key-value-list-border-color)%3B%0A%09border-radius%3A%20var(--bf-key-value-list-radius)%3B%0A%09padding%3A%20var(--bf-key-value-list-padding-y)%20var(--bf-key-value-list-padding-x)%3B%0A%09transition%3A%20var(--bf-key-value-list-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "key-value list";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-key-value-list", BfKeyValueList);

// src/link/link.js
var BfLink = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-link-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-link-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-link-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-link-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-link-border-color%3A%20var(--bf-theme-link-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-link-bg%3A%20var(--bf-theme-link-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-link-color%3A%20var(--bf-theme-link-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-link-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-link-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-link-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-link-font)%3B%0A%09color%3A%20var(--bf-link-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-link-bg)%3B%0A%09color%3A%20var(--bf-link-color)%3B%0A%09border-width%3A%20var(--bf-link-border-width)%3B%0A%09border-style%3A%20var(--bf-link-border-style)%3B%0A%09border-color%3A%20var(--bf-link-border-color)%3B%0A%09border-radius%3A%20var(--bf-link-radius)%3B%0A%09padding%3A%20var(--bf-link-padding-y)%20var(--bf-link-padding-x)%3B%0A%09transition%3A%20var(--bf-link-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "link";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-link", BfLink);

// src/list/list.js
var BfList = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onSlotChange = this._onSlotChange.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-list-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-list-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-list-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-list-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-list-border-color%3A%20var(--bf-theme-list-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-list-bg%3A%20var(--bf-theme-list-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-list-color%3A%20var(--bf-theme-list-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-list-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-list-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-list-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-list-font)%3B%0A%09color%3A%20var(--bf-list-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-list-bg)%3B%0A%09color%3A%20var(--bf-list-color)%3B%0A%09border-width%3A%20var(--bf-list-border-width)%3B%0A%09border-style%3A%20var(--bf-list-border-style)%3B%0A%09border-color%3A%20var(--bf-list-border-color)%3B%0A%09border-radius%3A%20var(--bf-list-radius)%3B%0A%09padding%3A%20var(--bf-list-padding-y)%20var(--bf-list-padding-x)%3B%0A%09transition%3A%20var(--bf-list-transition)%3B%0A%7D%0A%0A.root%20%3A%3Aslotted(%5Bitem%5D)%20%7B%0A%09display%3A%20block%3B%0A%09padding%3A%200.45rem%200.6rem%3B%0A%09border-radius%3A%200.4rem%3B%0A%09cursor%3A%20pointer%3B%0A%7D%0A%0A.root%20%3A%3Aslotted(%5Bitem%5D%3Ahover)%20%7B%0A%09background%3A%20var(--bf-theme-surface-2%2C%20%23f8fafc)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "list";
    }
    this.shadowRoot.replaceChildren(link, root);
    this._slot = root.querySelector("slot");
    this._slot.addEventListener("slotchange", this._onSlotChange);
    this._onSlotChange();
  }
  _onSlotChange() {
    if (!this._slot) {
      return;
    }
    const items = this._slot.assignedElements({ flatten: true }).filter((element) => element.hasAttribute("item"));
    for (const [index, item] of items.entries()) {
      item.setAttribute("role", item.getAttribute("role") || "listitem");
      if (!item.hasAttribute("tabindex")) {
        item.setAttribute("tabindex", "0");
      }
      if (item.dataset.bfListBound === "true") {
        continue;
      }
      item.dataset.bfListBound = "true";
      item.addEventListener("click", () => this._emitSelect(item, index));
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this._emitSelect(item, index);
        }
      });
    }
  }
  _emitSelect(item, index) {
    this.dispatchEvent(
      new CustomEvent("bf-select", {
        bubbles: true,
        composed: true,
        detail: {
          index,
          id: item.id || "",
          value: item.getAttribute("value") || item.textContent?.trim() || ""
        }
      })
    );
  }
};
customElements.define("bf-list", BfList);

// src/loading-indicator/loading-indicator.js
var BfLoadingIndicator = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-loading-indicator-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-loading-indicator-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-loading-indicator-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-loading-indicator-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-loading-indicator-border-color%3A%20var(--bf-theme-loading-indicator-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-loading-indicator-bg%3A%20var(--bf-theme-loading-indicator-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-loading-indicator-color%3A%20var(--bf-theme-loading-indicator-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-loading-indicator-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-loading-indicator-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-loading-indicator-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-loading-indicator-font)%3B%0A%09color%3A%20var(--bf-loading-indicator-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-loading-indicator-bg)%3B%0A%09color%3A%20var(--bf-loading-indicator-color)%3B%0A%09border-width%3A%20var(--bf-loading-indicator-border-width)%3B%0A%09border-style%3A%20var(--bf-loading-indicator-border-style)%3B%0A%09border-color%3A%20var(--bf-loading-indicator-border-color)%3B%0A%09border-radius%3A%20var(--bf-loading-indicator-radius)%3B%0A%09padding%3A%20var(--bf-loading-indicator-padding-y)%20var(--bf-loading-indicator-padding-x)%3B%0A%09transition%3A%20var(--bf-loading-indicator-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "loading indicator";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-loading-indicator", BfLoadingIndicator);

// src/map/map.js
var BfMap = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-map-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-map-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-map-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-map-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-map-border-color%3A%20var(--bf-theme-map-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-map-bg%3A%20var(--bf-theme-map-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-map-color%3A%20var(--bf-theme-map-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-map-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-map-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-map-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-map-font)%3B%0A%09color%3A%20var(--bf-map-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-map-bg)%3B%0A%09color%3A%20var(--bf-map-color)%3B%0A%09border-width%3A%20var(--bf-map-border-width)%3B%0A%09border-style%3A%20var(--bf-map-border-style)%3B%0A%09border-color%3A%20var(--bf-map-border-color)%3B%0A%09border-radius%3A%20var(--bf-map-radius)%3B%0A%09padding%3A%20var(--bf-map-padding-y)%20var(--bf-map-padding-x)%3B%0A%09transition%3A%20var(--bf-map-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "map";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-map", BfMap);

// src/menu/menu.js
var BfMenu = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onSlotChange = this._onSlotChange.bind(this);
    this._onDocumentClick = this._onDocumentClick.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._sync();
      this._onSlotChange();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-menu-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-menu-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-menu-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-menu-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-menu-border-color%3A%20var(--bf-theme-menu-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-menu-bg%3A%20var(--bf-theme-menu-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-menu-color%3A%20var(--bf-theme-menu-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-menu-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-menu-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-menu-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-menu-font)%3B%0A%09color%3A%20var(--bf-menu-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-menu-bg)%3B%0A%09color%3A%20var(--bf-menu-color)%3B%0A%09border-width%3A%20var(--bf-menu-border-width)%3B%0A%09border-style%3A%20var(--bf-menu-border-style)%3B%0A%09border-color%3A%20var(--bf-menu-border-color)%3B%0A%09border-radius%3A%20var(--bf-menu-radius)%3B%0A%09padding%3A%20var(--bf-menu-padding-y)%20var(--bf-menu-padding-x)%3B%0A%09transition%3A%20var(--bf-menu-transition)%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'context'%5D%5Bdata-open%3D'false'%5D%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'context'%5D%20%7B%0A%09min-width%3A%2011rem%3B%0A%09box-shadow%3A%200%2014px%2036px%20rgba(2%2C%206%2C%2023%2C%200.2)%3B%0A%7D%0A%0A.root%20%3A%3Aslotted(%5Bitem%5D)%20%7B%0A%09display%3A%20block%3B%0A%09padding%3A%200.45rem%200.6rem%3B%0A%09border-radius%3A%200.4rem%3B%0A%09cursor%3A%20pointer%3B%0A%7D%0A%0A.root%20%3A%3Aslotted(%5Bitem%5D%3Ahover)%20%7B%0A%09background%3A%20var(--bf-theme-surface-2%2C%20%23f8fafc)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "menu";
    }
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._slot = root.querySelector("slot");
    this._slot.addEventListener("slotchange", this._onSlotChange);
    this._bindContextTarget();
    document.addEventListener("click", this._onDocumentClick);
    this._onSlotChange();
    this._sync();
  }
  disconnectedCallback() {
    document.removeEventListener("click", this._onDocumentClick);
    if (this._contextTarget) {
      this._contextTarget.removeEventListener("contextmenu", this._boundContextMenuHandler);
    }
  }
  attributeChangedCallback(name) {
    if (name === "for") {
      this._bindContextTarget();
    }
    this._sync();
  }
  open() {
    this.setAttribute("open", "");
  }
  close() {
    this.removeAttribute("open");
  }
  toggle() {
    if (this.hasAttribute("open")) {
      this.close();
      return;
    }
    this.open();
  }
  _isContextMode() {
    const variant = (this.getAttribute("variant") || "").toLowerCase();
    return variant === "context" || this.hasAttribute("context");
  }
  _bindContextTarget() {
    if (!this._isContextMode()) {
      return;
    }
    if (this._contextTarget && this._boundContextMenuHandler) {
      this._contextTarget.removeEventListener("contextmenu", this._boundContextMenuHandler);
    }
    const targetId = this.getAttribute("for");
    this._contextTarget = targetId ? document.getElementById(targetId) : this.parentElement;
    if (!this._contextTarget) {
      return;
    }
    this._boundContextMenuHandler = (event) => {
      event.preventDefault();
      this.setAttribute("x", `${event.clientX}`);
      this.setAttribute("y", `${event.clientY}`);
      this.open();
    };
    this._contextTarget.addEventListener("contextmenu", this._boundContextMenuHandler);
  }
  _onDocumentClick(event) {
    if (!this._isContextMode() || !this.hasAttribute("open")) {
      return;
    }
    const path = event.composedPath();
    if (path.includes(this)) {
      return;
    }
    this.close();
  }
  _onSlotChange() {
    if (!this._slot) {
      return;
    }
    const items = this._slot.assignedElements({ flatten: true }).filter((element) => element.hasAttribute("item"));
    for (const [index, item] of items.entries()) {
      item.setAttribute("role", item.getAttribute("role") || "menuitem");
      if (!item.hasAttribute("tabindex")) {
        item.setAttribute("tabindex", "0");
      }
      if (item.dataset.bfMenuBound === "true") {
        continue;
      }
      item.dataset.bfMenuBound = "true";
      item.addEventListener("click", () => this._emitSelect(item, index));
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this._emitSelect(item, index);
        }
      });
    }
  }
  _emitSelect(item, index) {
    this.dispatchEvent(
      new CustomEvent("bf-select", {
        bubbles: true,
        composed: true,
        detail: {
          index,
          id: item.id || "",
          value: item.getAttribute("value") || item.textContent?.trim() || ""
        }
      })
    );
    if (this._isContextMode()) {
      this.close();
    }
  }
  _sync() {
    if (!this._root) {
      return;
    }
    const context = this._isContextMode();
    this._root.setAttribute("data-variant", context ? "context" : "menu");
    this._root.setAttribute("data-open", this.hasAttribute("open") ? "true" : "false");
    if (context) {
      this.style.position = "fixed";
      this.style.left = `${Number.parseFloat(this.getAttribute("x") || "0") || 0}px`;
      this.style.top = `${Number.parseFloat(this.getAttribute("y") || "0") || 0}px`;
      this.style.zIndex = "1300";
    } else {
      this.style.position = "";
      this.style.left = "";
      this.style.top = "";
      this.style.zIndex = "";
    }
  }
};
__publicField(BfMenu, "observedAttributes", ["variant", "context", "open", "x", "y", "for"]);
customElements.define("bf-menu", BfMenu);

// src/message/message.js
var BfMessage = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-message-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-message-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-message-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-message-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-message-border-color%3A%20var(--bf-theme-message-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-message-bg%3A%20var(--bf-theme-message-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-message-color%3A%20var(--bf-theme-message-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-message-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-message-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-message-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-message-font)%3B%0A%09color%3A%20var(--bf-message-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-message-bg)%3B%0A%09color%3A%20var(--bf-message-color)%3B%0A%09border-width%3A%20var(--bf-message-border-width)%3B%0A%09border-style%3A%20var(--bf-message-border-style)%3B%0A%09border-color%3A%20var(--bf-message-border-color)%3B%0A%09border-radius%3A%20var(--bf-message-radius)%3B%0A%09padding%3A%20var(--bf-message-padding-y)%20var(--bf-message-padding-x)%3B%0A%09transition%3A%20var(--bf-message-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "message";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-message", BfMessage);

// src/metric-card/metric-card.js
var BfMetricCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-metric-card-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-metric-card-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-metric-card-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-metric-card-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-metric-card-border-color%3A%20var(--bf-theme-metric-card-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-metric-card-bg%3A%20var(--bf-theme-metric-card-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-metric-card-color%3A%20var(--bf-theme-metric-card-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-metric-card-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-metric-card-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-metric-card-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-metric-card-font)%3B%0A%09color%3A%20var(--bf-metric-card-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-metric-card-bg)%3B%0A%09color%3A%20var(--bf-metric-card-color)%3B%0A%09border-width%3A%20var(--bf-metric-card-border-width)%3B%0A%09border-style%3A%20var(--bf-metric-card-border-style)%3B%0A%09border-color%3A%20var(--bf-metric-card-border-color)%3B%0A%09border-radius%3A%20var(--bf-metric-card-radius)%3B%0A%09padding%3A%20var(--bf-metric-card-padding-y)%20var(--bf-metric-card-padding-x)%3B%0A%09transition%3A%20var(--bf-metric-card-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "metric card";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-metric-card", BfMetricCard);

// src/modal/modal.js
var BfModal = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onBackdropClick = this._onBackdropClick.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._sync();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-modal-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-modal-bg%3A%20var(--bf-theme-modal-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-modal-color%3A%20var(--bf-theme-modal-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-modal-border-color%3A%20var(--bf-theme-modal-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-modal-radius%3A%20var(--bf-theme-radius-md%2C%2010px)%3B%0A%09--bf-modal-backdrop%3A%20rgba(2%2C%206%2C%2023%2C%200.48)%3B%0A%09--bf-modal-max-w%3A%2034rem%3B%0A%09--bf-modal-shadow%3A%200%2018px%2044px%20rgba(2%2C%206%2C%2023%2C%200.28)%3B%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-modal-font)%3B%0A%09z-index%3A%201200%3B%0A%7D%0A%0A.root%20%7B%0A%09position%3A%20fixed%3B%0A%09inset%3A%200%3B%0A%09display%3A%20grid%3B%0A%09align-items%3A%20center%3B%0A%09justify-items%3A%20center%3B%0A%09padding%3A%201rem%3B%0A%7D%0A%0A.root%5Bdata-open%3D'false'%5D%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.backdrop%20%7B%0A%09position%3A%20absolute%3B%0A%09inset%3A%200%3B%0A%09background%3A%20var(--bf-modal-backdrop)%3B%0A%7D%0A%0A.panel%20%7B%0A%09position%3A%20relative%3B%0A%09width%3A%20min(100%25%2C%20var(--bf-modal-max-w))%3B%0A%09background%3A%20var(--bf-modal-bg)%3B%0A%09color%3A%20var(--bf-modal-color)%3B%0A%09border%3A%201px%20solid%20var(--bf-modal-border-color)%3B%0A%09border-radius%3A%20var(--bf-modal-radius)%3B%0A%09padding%3A%201rem%3B%0A%09box-shadow%3A%20var(--bf-modal-shadow)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = `
			<div class="backdrop" part="backdrop"></div>
			<div class="panel" part="panel"><slot></slot></div>
		`;
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._backdrop = root.querySelector(".backdrop");
    this._backdrop.addEventListener("click", this._onBackdropClick);
    if (!this.textContent?.trim()) {
      this.textContent = "modal";
    }
    this._sync();
  }
  attributeChangedCallback() {
    this._sync();
  }
  open() {
    this.setAttribute("open", "");
  }
  close() {
    this.removeAttribute("open");
  }
  toggle() {
    if (this.hasAttribute("open")) {
      this.close();
      return;
    }
    this.open();
  }
  _onBackdropClick() {
    if (this.hasAttribute("persistent")) {
      return;
    }
    this.close();
  }
  _shouldOpenByDefault() {
    return !this.hasAttribute("id");
  }
  _sync() {
    if (!this._root) {
      return;
    }
    if (!this.hasAttribute("open") && this._shouldOpenByDefault()) {
      this.setAttribute("open", "");
      return;
    }
    const isOpen = this.hasAttribute("open");
    this.hidden = !isOpen;
    this._root.setAttribute("data-open", isOpen ? "true" : "false");
    this.setAttribute("aria-hidden", String(!isOpen));
    this.setAttribute("role", "dialog");
    this.setAttribute("aria-modal", "true");
    if (this.getAttribute("label")) {
      this.setAttribute("aria-label", this.getAttribute("label"));
    }
  }
};
__publicField(BfModal, "observedAttributes", ["open", "label"]);
customElements.define("bf-modal", BfModal);

// src/nav/nav.js
var BfNav = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-nav-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-nav-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-nav-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-nav-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-nav-border-color%3A%20var(--bf-theme-nav-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-nav-bg%3A%20var(--bf-theme-nav-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-nav-color%3A%20var(--bf-theme-nav-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-nav-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-nav-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-nav-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-nav-font)%3B%0A%09color%3A%20var(--bf-nav-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09display%3A%20flex%3B%0A%09align-items%3A%20center%3B%0A%09justify-content%3A%20space-between%3B%0A%09gap%3A%20var(--bf-nav-padding-x)%3B%0A%09background%3A%20var(--bf-nav-bg)%3B%0A%09color%3A%20var(--bf-nav-color)%3B%0A%09border-width%3A%20var(--bf-nav-border-width)%3B%0A%09border-style%3A%20var(--bf-nav-border-style)%3B%0A%09border-color%3A%20var(--bf-nav-border-color)%3B%0A%09border-radius%3A%20var(--bf-nav-radius)%3B%0A%09padding%3A%20var(--bf-nav-padding-y)%20var(--bf-nav-padding-x)%3B%0A%09transition%3A%20var(--bf-nav-transition)%3B%0A%7D%0A%0A%3A%3Aslotted(%5Bcol%5D)%2C%0A%3A%3Aslotted(%5Bnav-col%5D)%20%7B%0A%09display%3A%20flex%3B%0A%09align-items%3A%20center%3B%0A%09gap%3A%20var(--bf-nav-padding-x)%3B%0A%09min-width%3A%200%3B%0A%7D%0A%0A%3A%3Aslotted(%5Bcol%5D%3Afirst-child)%2C%0A%3A%3Aslotted(%5Bnav-col%5D%3Afirst-child)%20%7B%0A%09justify-content%3A%20flex-start%3B%0A%09flex%3A%201%201%200%3B%0A%7D%0A%0A%3A%3Aslotted(%5Bcol%5D%3Anth-child(2))%2C%0A%3A%3Aslotted(%5Bnav-col%5D%3Anth-child(2))%20%7B%0A%09justify-content%3A%20center%3B%0A%09flex%3A%201%201%200%3B%0A%7D%0A%0A%3A%3Aslotted(%5Bcol%5D%3Alast-child)%2C%0A%3A%3Aslotted(%5Bnav-col%5D%3Alast-child)%20%7B%0A%09justify-content%3A%20flex-end%3B%0A%09flex%3A%201%201%200%3B%0A%7D%0A%0A%3A%3Aslotted(%5Brow%5D)%2C%0A%3A%3Aslotted(%5Bnav-row%5D)%20%7B%0A%09display%3A%20flex%3B%0A%09align-items%3A%20center%3B%0A%09justify-content%3A%20space-between%3B%0A%09gap%3A%20var(--bf-nav-padding-x)%3B%0A%09width%3A%20100%25%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "nav";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-nav", BfNav);

// src/number-field/number-field.js
var BfNumberField = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-number-field-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-number-field-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-number-field-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-number-field-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-number-field-border-color%3A%20var(--bf-theme-number-field-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-number-field-bg%3A%20var(--bf-theme-number-field-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-number-field-color%3A%20var(--bf-theme-number-field-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-number-field-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-number-field-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-number-field-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-number-field-font)%3B%0A%09color%3A%20var(--bf-number-field-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-number-field-bg)%3B%0A%09color%3A%20var(--bf-number-field-color)%3B%0A%09border-width%3A%20var(--bf-number-field-border-width)%3B%0A%09border-style%3A%20var(--bf-number-field-border-style)%3B%0A%09border-color%3A%20var(--bf-number-field-border-color)%3B%0A%09border-radius%3A%20var(--bf-number-field-radius)%3B%0A%09padding%3A%20var(--bf-number-field-padding-y)%20var(--bf-number-field-padding-x)%3B%0A%09transition%3A%20var(--bf-number-field-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "number field";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-number-field", BfNumberField);

// src/otp-input/otp-input.js
var BfOtpInput = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-otp-input-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-otp-input-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-otp-input-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-otp-input-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-otp-input-border-color%3A%20var(--bf-theme-otp-input-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-otp-input-bg%3A%20var(--bf-theme-otp-input-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-otp-input-color%3A%20var(--bf-theme-otp-input-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-otp-input-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-otp-input-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-otp-input-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-otp-input-font)%3B%0A%09color%3A%20var(--bf-otp-input-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-otp-input-bg)%3B%0A%09color%3A%20var(--bf-otp-input-color)%3B%0A%09border-width%3A%20var(--bf-otp-input-border-width)%3B%0A%09border-style%3A%20var(--bf-otp-input-border-style)%3B%0A%09border-color%3A%20var(--bf-otp-input-border-color)%3B%0A%09border-radius%3A%20var(--bf-otp-input-radius)%3B%0A%09padding%3A%20var(--bf-otp-input-padding-y)%20var(--bf-otp-input-padding-x)%3B%0A%09transition%3A%20var(--bf-otp-input-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "otp input";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-otp-input", BfOtpInput);

// src/pagination/pagination.js
var BfPagination = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-pagination-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-pagination-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-pagination-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-pagination-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-pagination-border-color%3A%20var(--bf-theme-pagination-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-pagination-bg%3A%20var(--bf-theme-pagination-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-pagination-color%3A%20var(--bf-theme-pagination-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-pagination-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-pagination-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-pagination-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-pagination-font)%3B%0A%09color%3A%20var(--bf-pagination-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-pagination-bg)%3B%0A%09color%3A%20var(--bf-pagination-color)%3B%0A%09border-width%3A%20var(--bf-pagination-border-width)%3B%0A%09border-style%3A%20var(--bf-pagination-border-style)%3B%0A%09border-color%3A%20var(--bf-pagination-border-color)%3B%0A%09border-radius%3A%20var(--bf-pagination-radius)%3B%0A%09padding%3A%20var(--bf-pagination-padding-y)%20var(--bf-pagination-padding-x)%3B%0A%09transition%3A%20var(--bf-pagination-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "pagination";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-pagination", BfPagination);

// src/progress/progress.js
var BfProgress = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onSlotChange = this._onSlotChange.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._sync();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-progress-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-progress-bg%3A%20var(--bf-theme-progress-bar-bg%2C%20var(--bf-theme-surface-2%2C%20%23e2e8f0))%3B%0A%09--bf-progress-color%3A%20var(--bf-theme-progress-bar-color%2C%20var(--bf-theme-button-primary-bg%2C%20%232563eb))%3B%0A%09--bf-progress-ring-bg%3A%20var(--bf-theme-progress-circle-bg%2C%20var(--bf-theme-surface-2%2C%20%23e2e8f0))%3B%0A%09--bf-progress-ring-color%3A%20var(--bf-theme-progress-circle-color%2C%20var(--bf-theme-button-primary-bg%2C%20%232563eb))%3B%0A%09--bf-progress-radius%3A%20var(--bf-theme-radius-md%2C%20999px)%3B%0A%09--bf-progress-track-height%3A%200.7rem%3B%0A%09--bf-progress-size-sm%3A%202rem%3B%0A%09--bf-progress-size-md%3A%203rem%3B%0A%09--bf-progress-size-lg%3A%204rem%3B%0A%0A%09display%3A%20inline-flex%3B%0A%09font%3A%20var(--bf-progress-font)%3B%0A%09color%3A%20var(--bf-theme-text-1%2C%20%230f172a)%3B%0A%7D%0A%0A.root%20%7B%0A%09display%3A%20inline-flex%3B%0A%09align-items%3A%20center%3B%0A%09gap%3A%200.5rem%3B%0A%7D%0A%0A.linear%20%7B%0A%09display%3A%20inline-block%3B%0A%09min-width%3A%208rem%3B%0A%7D%0A%0A.track%20%7B%0A%09width%3A%20100%25%3B%0A%09height%3A%20var(--bf-progress-track-height)%3B%0A%09border-radius%3A%20var(--bf-progress-radius)%3B%0A%09background%3A%20var(--bf-progress-bg)%3B%0A%09overflow%3A%20hidden%3B%0A%7D%0A%0A.fill%20%7B%0A%09height%3A%20100%25%3B%0A%09width%3A%200%3B%0A%09background%3A%20var(--bf-progress-color)%3B%0A%09transition%3A%20width%20160ms%20ease%3B%0A%7D%0A%0A.circular%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.circular%20svg%20%7B%0A%09width%3A%20var(--bf-progress-size-md)%3B%0A%09height%3A%20var(--bf-progress-size-md)%3B%0A%09transform%3A%20rotate(-90deg)%3B%0A%7D%0A%0A.ring%2C%0A.meter%20%7B%0A%09fill%3A%20none%3B%0A%09stroke-width%3A%2010%3B%0A%7D%0A%0A.ring%20%7B%0A%09stroke%3A%20var(--bf-progress-ring-bg)%3B%0A%7D%0A%0A.meter%20%7B%0A%09stroke%3A%20var(--bf-progress-ring-color)%3B%0A%09stroke-linecap%3A%20round%3B%0A%09transition%3A%20stroke-dashoffset%20180ms%20ease%3B%0A%7D%0A%0A.meta%3Aempty%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'circular'%5D%20.linear%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'circular'%5D%20.circular%20%7B%0A%09display%3A%20inline-block%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'striped'%5D%20.fill%20%7B%0A%09background-image%3A%20linear-gradient(%0A%09%0945deg%2C%0A%09%09rgba(255%2C%20255%2C%20255%2C%200.25)%2025%25%2C%0A%09%09transparent%2025%25%2C%0A%09%09transparent%2050%25%2C%0A%09%09rgba(255%2C%20255%2C%20255%2C%200.25)%2050%25%2C%0A%09%09rgba(255%2C%20255%2C%20255%2C%200.25)%2075%25%2C%0A%09%09transparent%2075%25%2C%0A%09%09transparent%0A%09)%3B%0A%09background-size%3A%200.9rem%200.9rem%3B%0A%7D%0A%0A.root%5Bdata-tone%3D'primary'%5D%20%7B%0A%09--bf-progress-color%3A%20var(--bf-theme-button-primary-bg%2C%20%232563eb)%3B%0A%09--bf-progress-ring-color%3A%20var(--bf-theme-button-primary-bg%2C%20%232563eb)%3B%0A%7D%0A%0A.root%5Bdata-tone%3D'secondary'%5D%20%7B%0A%09--bf-progress-color%3A%20var(--bf-theme-button-secondary-color%2C%20%231d4ed8)%3B%0A%09--bf-progress-ring-color%3A%20var(--bf-theme-button-secondary-color%2C%20%231d4ed8)%3B%0A%7D%0A%0A.root%5Bdata-loading%3D'true'%5D%5Bdata-variant%3D'striped'%5D%20.fill%2C%0A.root%5Bdata-loading%3D'true'%5D%5Bdata-loading-variant%3D'stripe'%5D%20.fill%20%7B%0A%09animation%3A%20bf-progress-stripes%20700ms%20linear%20infinite%3B%0A%7D%0A%0A.root%5Bdata-loading%3D'true'%5D%5Bdata-loading-variant%3D'pulse'%5D%20.fill%20%7B%0A%09animation%3A%20bf-progress-pulse%20900ms%20ease-in-out%20infinite%3B%0A%7D%0A%0A.root%5Bdata-loading%3D'true'%5D%5Bdata-loading-variant%3D'bounce'%5D%20.fill%20%7B%0A%09transform-origin%3A%20left%20center%3B%0A%09animation%3A%20bf-progress-bounce%20900ms%20ease-in-out%20infinite%3B%0A%7D%0A%0A.root%5Bdata-loading%3D'true'%5D%5Bdata-variant%3D'circular'%5D%20.circular%20svg%2C%0A.root%5Bdata-loading%3D'true'%5D%5Bdata-loading-variant%3D'spin'%5D%5Bdata-variant%3D'circular'%5D%20.circular%20svg%20%7B%0A%09animation%3A%20bf-progress-spin%201s%20linear%20infinite%3B%0A%7D%0A%0A.root%5Bdata-loading%3D'true'%5D%5Bdata-variant%3D'circular'%5D%20.meter%20%7B%0A%09animation%3A%20bf-progress-meter%201.1s%20ease-in-out%20infinite%3B%0A%7D%0A%0A.root%5Bdata-size%3D'sm'%5D%20.circular%20svg%20%7B%0A%09width%3A%20var(--bf-progress-size-sm)%3B%0A%09height%3A%20var(--bf-progress-size-sm)%3B%0A%7D%0A%0A.root%5Bdata-size%3D'lg'%5D%20.circular%20svg%20%7B%0A%09width%3A%20var(--bf-progress-size-lg)%3B%0A%09height%3A%20var(--bf-progress-size-lg)%3B%0A%7D%0A%0A%40keyframes%20bf-progress-indeterminate%20%7B%0A%090%25%20%7B%0A%09%09transform%3A%20translateX(-120%25)%3B%0A%09%7D%0A%09100%25%20%7B%0A%09%09transform%3A%20translateX(260%25)%3B%0A%09%7D%0A%7D%0A%0A%40keyframes%20bf-progress-stripes%20%7B%0A%090%25%20%7B%0A%09%09background-position%3A%200%200%3B%0A%09%7D%0A%09100%25%20%7B%0A%09%09background-position%3A%200.9rem%200%3B%0A%09%7D%0A%7D%0A%0A%40keyframes%20bf-progress-pulse%20%7B%0A%090%25%2C%0A%09100%25%20%7B%0A%09%09opacity%3A%201%3B%0A%09%7D%0A%0950%25%20%7B%0A%09%09opacity%3A%200.45%3B%0A%09%7D%0A%7D%0A%0A%40keyframes%20bf-progress-bounce%20%7B%0A%090%25%2C%0A%09100%25%20%7B%0A%09%09transform%3A%20scaleX(1)%3B%0A%09%7D%0A%0950%25%20%7B%0A%09%09transform%3A%20scaleX(0.7)%3B%0A%09%7D%0A%7D%0A%0A%40keyframes%20bf-progress-spin%20%7B%0A%090%25%20%7B%0A%09%09transform%3A%20rotate(-90deg)%3B%0A%09%7D%0A%09100%25%20%7B%0A%09%09transform%3A%20rotate(270deg)%3B%0A%09%7D%0A%7D%0A%0A%40keyframes%20bf-progress-meter%20%7B%0A%090%25%20%7B%0A%09%09stroke-dashoffset%3A%20220%3B%0A%09%7D%0A%0950%25%20%7B%0A%09%09stroke-dashoffset%3A%2080%3B%0A%09%7D%0A%09100%25%20%7B%0A%09%09stroke-dashoffset%3A%20220%3B%0A%09%7D%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = `
			<div class="linear" part="linear">
				<div class="track" part="track">
					<div class="fill" part="fill"></div>
				</div>
			</div>
			<div class="circular" part="circular">
				<svg viewBox="0 0 100 100" aria-hidden="true">
					<circle class="ring" cx="50" cy="50" r="42"></circle>
					<circle class="meter" cx="50" cy="50" r="42"></circle>
				</svg>
			</div>
			<div class="meta" part="meta"><slot></slot></div>
		`;
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._fill = root.querySelector(".fill");
    this._meter = root.querySelector(".meter");
    this._slot = root.querySelector("slot");
    this._slot.addEventListener("slotchange", this._onSlotChange);
    this._sync();
  }
  disconnectedCallback() {
    this._stopLoading();
  }
  attributeChangedCallback() {
    this._sync();
  }
  get value() {
    return this._value();
  }
  set value(nextValue) {
    this.setAttribute("value", String(nextValue));
  }
  get max() {
    return this._max();
  }
  set max(nextValue) {
    this.setAttribute("max", String(nextValue));
  }
  get variant() {
    return this._variant();
  }
  set variant(nextValue) {
    this.setAttribute("variant", String(nextValue));
  }
  get size() {
    return this.getAttribute("size") || "md";
  }
  set size(nextValue) {
    this.setAttribute("size", String(nextValue));
  }
  get tone() {
    return this._tone();
  }
  set tone(nextValue) {
    this.setAttribute("tone", String(nextValue));
  }
  get loading() {
    return this.hasAttribute("loading");
  }
  set loading(nextValue) {
    if (nextValue) {
      this.setAttribute("loading", "");
      return;
    }
    this.removeAttribute("loading");
  }
  _onSlotChange() {
    this._renderValueTokens();
  }
  _variant() {
    let variant = (this.getAttribute("variant") || "").toLowerCase();
    if (!variant) {
      if (this.hasAttribute("circular")) {
        variant = "circular";
      } else if (this.hasAttribute("striped")) {
        variant = "striped";
      } else if (this.hasAttribute("linear")) {
        variant = "linear";
      }
    }
    if (!variant) {
      variant = "linear";
    }
    if (variant === "circlular") {
      variant = "circular";
    }
    if (variant === "indeterminate") {
      return "linear";
    }
    if (["linear", "circular", "striped"].includes(variant)) {
      return variant;
    }
    return "linear";
  }
  _tone() {
    const explicit = (this.getAttribute("tone") || "").toLowerCase();
    if (explicit === "secondary") {
      return "secondary";
    }
    if (explicit === "primary") {
      return "primary";
    }
    if (this.hasAttribute("secondary")) {
      return "secondary";
    }
    if (this.hasAttribute("primary")) {
      return "primary";
    }
    return "default";
  }
  _hasMax() {
    return this.hasAttribute("max");
  }
  _max() {
    const parsed = Number.parseFloat(this.getAttribute("max") || "");
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 100;
    }
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 100;
  }
  _value() {
    const parsed = Number.parseFloat(this.getAttribute("value") || "0");
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    const upper = this._hasMax() ? this._max() : 100;
    return Math.min(upper, Math.max(0, parsed));
  }
  _percent() {
    if (!this._hasMax()) {
      return this._value();
    }
    return this._value() / this._max() * 100;
  }
  _loadingVariant() {
    const explicit = (this.getAttribute("loading-variant") || "").toLowerCase();
    const attrValue = (this.getAttribute("loading") || "").toLowerCase();
    const candidate = explicit || attrValue || "loop";
    if (["loop", "pulse", "stripe", "bounce", "spin"].includes(candidate)) {
      return candidate;
    }
    return "loop";
  }
  _loadingMs() {
    const parsed = Number.parseInt(this.getAttribute("loading-ms") || "450", 10);
    return Number.isFinite(parsed) && parsed >= 80 ? parsed : 450;
  }
  _isLoading() {
    const legacyVariant = (this.getAttribute("variant") || "").toLowerCase() === "indeterminate";
    return this.hasAttribute("loading") || this.hasAttribute("indeterminate") || legacyVariant;
  }
  _startLoading() {
    const ms = this._loadingMs();
    if (this._loadingTimer && this._loadingTimerMs === ms) {
      return;
    }
    this._stopLoading();
    this._loadingTimerMs = ms;
    this._loadingTimer = setInterval(() => {
      const ceiling = this._hasMax() ? this._max() : 100;
      const step = ceiling / 10;
      let next = this._value() + step;
      if (next > ceiling) {
        next = 0;
      }
      this.value = Number(next.toFixed(4));
    }, ms);
  }
  _stopLoading() {
    if (!this._loadingTimer) {
      return;
    }
    clearInterval(this._loadingTimer);
    this._loadingTimer = null;
    this._loadingTimerMs = null;
  }
  _formatValueLabel() {
    if (this._hasMax()) {
      return `${Math.round(this._percent())}%`;
    }
    const raw = this._value();
    return Number.isInteger(raw) ? `${raw}` : `${raw.toFixed(2)}`;
  }
  _renderValueTokens() {
    const tokens = this.querySelectorAll("value");
    if (!tokens.length) {
      return;
    }
    const display = this._formatValueLabel();
    for (const token of tokens) {
      token.textContent = display;
    }
  }
  _sync() {
    if (!this._root) {
      return;
    }
    const variant = this._variant();
    const percent = this._percent();
    const size = this.getAttribute("size") || "md";
    const tone = this._tone();
    const loading = this._isLoading();
    const loadingVariant = this._loadingVariant();
    this._root.setAttribute("data-variant", variant);
    this._root.setAttribute("data-size", size);
    this._root.setAttribute("data-tone", tone);
    this._root.setAttribute("data-loading", loading ? "true" : "false");
    this._root.setAttribute("data-loading-variant", loadingVariant);
    this.setAttribute("role", "progressbar");
    this.setAttribute("aria-valuemin", "0");
    this.setAttribute("aria-valuemax", String(this._hasMax() ? this._max() : 100));
    this.setAttribute("aria-valuenow", String(this._value()));
    if (this.getAttribute("label")) {
      this.setAttribute("aria-label", this.getAttribute("label"));
    }
    this._fill.style.width = `${percent}%`;
    const circumference = 2 * Math.PI * 42;
    const dash = circumference - percent / 100 * circumference;
    this._meter.style.strokeDasharray = `${circumference}`;
    this._meter.style.strokeDashoffset = `${dash}`;
    this._renderValueTokens();
    if (loading) {
      this._startLoading();
    } else {
      this._stopLoading();
    }
  }
};
__publicField(BfProgress, "observedAttributes", [
  "variant",
  "value",
  "max",
  "label",
  "size",
  "loading",
  "loading-variant",
  "loading-ms",
  "linear",
  "circular",
  "indeterminate",
  "striped",
  "tone",
  "primary",
  "secondary"
]);
customElements.define("bf-progress", BfProgress);

// src/quick-actions/quick-actions.js
var BfQuickActions = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-quick-actions-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-quick-actions-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-quick-actions-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-quick-actions-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-quick-actions-border-color%3A%20var(--bf-theme-quick-actions-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-quick-actions-bg%3A%20var(--bf-theme-quick-actions-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-quick-actions-color%3A%20var(--bf-theme-quick-actions-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-quick-actions-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-quick-actions-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-quick-actions-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-quick-actions-font)%3B%0A%09color%3A%20var(--bf-quick-actions-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-quick-actions-bg)%3B%0A%09color%3A%20var(--bf-quick-actions-color)%3B%0A%09border-width%3A%20var(--bf-quick-actions-border-width)%3B%0A%09border-style%3A%20var(--bf-quick-actions-border-style)%3B%0A%09border-color%3A%20var(--bf-quick-actions-border-color)%3B%0A%09border-radius%3A%20var(--bf-quick-actions-radius)%3B%0A%09padding%3A%20var(--bf-quick-actions-padding-y)%20var(--bf-quick-actions-padding-x)%3B%0A%09transition%3A%20var(--bf-quick-actions-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "quick actions";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-quick-actions", BfQuickActions);

// src/radio/radio.js
var BfRadio = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onInputChange = this._onInputChange.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._syncState();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-radio-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-radio-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-radio-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-radio-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-radio-border-color%3A%20var(--bf-theme-radio-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-radio-bg%3A%20var(--bf-theme-radio-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-radio-color%3A%20var(--bf-theme-radio-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-radio-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-radio-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-radio-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20inline-block%3B%0A%09font%3A%20var(--bf-radio-font)%3B%0A%09color%3A%20var(--bf-radio-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09display%3A%20inline-flex%3B%0A%09align-items%3A%20center%3B%0A%09gap%3A%200.5rem%3B%0A%09cursor%3A%20pointer%3B%0A%09background%3A%20var(--bf-radio-bg)%3B%0A%09color%3A%20var(--bf-radio-color)%3B%0A%09border-width%3A%20var(--bf-radio-border-width)%3B%0A%09border-style%3A%20var(--bf-radio-border-style)%3B%0A%09border-color%3A%20var(--bf-radio-border-color)%3B%0A%09border-radius%3A%20var(--bf-radio-radius)%3B%0A%09padding%3A%20var(--bf-radio-padding-y)%20var(--bf-radio-padding-x)%3B%0A%09transition%3A%20var(--bf-radio-transition)%3B%0A%7D%0A%0Ainput%20%7B%0A%09position%3A%20absolute%3B%0A%09opacity%3A%200%3B%0A%09width%3A%200%3B%0A%09height%3A%200%3B%0A%7D%0A%0A.dot%20%7B%0A%09width%3A%200.95rem%3B%0A%09height%3A%200.95rem%3B%0A%09border-radius%3A%20999px%3B%0A%09border%3A%202px%20solid%20var(--bf-radio-border-color)%3B%0A%09display%3A%20inline-block%3B%0A%09position%3A%20relative%3B%0A%7D%0A%0A.dot%3A%3Aafter%20%7B%0A%09content%3A%20''%3B%0A%09position%3A%20absolute%3B%0A%09inset%3A%200.15rem%3B%0A%09border-radius%3A%20999px%3B%0A%09background%3A%20var(--bf-theme-button-primary-bg%2C%20%232563eb)%3B%0A%09transform%3A%20scale(0)%3B%0A%09transition%3A%20transform%20120ms%20ease%3B%0A%7D%0A%0Ainput%3Achecked%20%2B%20.dot%3A%3Aafter%20%7B%0A%09transform%3A%20scale(1)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("label");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = `
			<input type="radio" part="input" />
			<span class="dot" part="dot"></span>
			<span class="text" part="text"><slot></slot></span>
		`;
    this.shadowRoot.replaceChildren(link, root);
    this._input = this.shadowRoot.querySelector("input");
    this._input.addEventListener("change", this._onInputChange);
    this._syncState();
  }
  attributeChangedCallback() {
    this._syncState();
  }
  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(value) {
    if (value) {
      this.setAttribute("checked", "");
      return;
    }
    this.removeAttribute("checked");
  }
  _onInputChange() {
    if (this._input.checked) {
      this.checked = true;
      this._uncheckPeers();
    }
    this.dispatchEvent(
      new CustomEvent("bf-change", {
        bubbles: true,
        composed: true,
        detail: {
          group: this._effectiveGroup(),
          value: this.value,
          checked: this.checked
        }
      })
    );
  }
  _uncheckPeers() {
    const group = this._effectiveGroup();
    if (!group) {
      return;
    }
    const peers = document.querySelectorAll(`bf-radio[group="${CSS.escape(group)}"]`);
    for (const peer of peers) {
      if (peer !== this) {
        peer.checked = false;
      }
    }
  }
  _effectiveGroup() {
    return this.getAttribute("group") || "";
  }
  get value() {
    return this.getAttribute("value") || this.textContent?.trim() || "";
  }
  _syncState() {
    if (!this._input) {
      return;
    }
    const group = this._effectiveGroup();
    this._input.name = group;
    this._input.value = this.value;
    this._input.checked = this.checked;
    this._input.disabled = this.hasAttribute("disabled");
    const hasLabelText = (this.textContent || "").trim().length > 0;
    if (!hasLabelText && !this.getAttribute("label")) {
      this.setAttribute("label", "radio");
    }
    if (this.getAttribute("label")) {
      this.setAttribute("aria-label", this.getAttribute("label"));
    }
  }
};
__publicField(BfRadio, "observedAttributes", ["checked", "disabled", "label", "value", "group"]);
customElements.define("bf-radio", BfRadio);

// src/range/range.js
var BfRange = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onSingleInput = this._onSingleInput.bind(this);
    this._onRangeInput = this._onRangeInput.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._sync();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-range-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-range-track%3A%20var(--bf-theme-surface-2%2C%20%23e2e8f0)%3B%0A%09--bf-range-fill%3A%20var(--bf-theme-button-primary-bg%2C%20%232563eb)%3B%0A%09--bf-range-rating-active%3A%20var(--bf-theme-button-primary-bg%2C%20%232563eb)%3B%0A%09--bf-range-rating-muted%3A%20var(--bf-theme-border-1%2C%20%23cbd5e1)%3B%0A%09display%3A%20inline-flex%3B%0A%09font%3A%20var(--bf-range-font)%3B%0A%7D%0A%0A.root%20%7B%0A%09display%3A%20inline-flex%3B%0A%09flex-direction%3A%20column%3B%0A%09gap%3A%200.4rem%3B%0A%09min-width%3A%2012rem%3B%0A%7D%0A%0A.single%2C%0A.dual%2C%0A.rating%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.root%5Bdata-mode%3D'slider'%5D%20.single%20%7B%0A%09display%3A%20block%3B%0A%7D%0A%0A.root%5Bdata-mode%3D'range'%5D%20.dual%20%7B%0A%09display%3A%20block%3B%0A%09position%3A%20relative%3B%0A%09padding-block%3A%200.35rem%3B%0A%7D%0A%0A.root%5Bdata-mode%3D'rating'%5D%20.rating%20%7B%0A%09display%3A%20inline-flex%3B%0A%09gap%3A%200.25rem%3B%0A%7D%0A%0Ainput%5Btype%3D'range'%5D%20%7B%0A%09width%3A%20100%25%3B%0A%09accent-color%3A%20var(--bf-range-fill)%3B%0A%7D%0A%0A.dual-track%20%7B%0A%09position%3A%20absolute%3B%0A%09inset%3A%2050%25%200%20auto%3B%0A%09height%3A%200.35rem%3B%0A%09transform%3A%20translateY(-50%25)%3B%0A%09background%3A%20var(--bf-range-track)%3B%0A%09border-radius%3A%20999px%3B%0A%7D%0A%0A.dual-fill%20%7B%0A%09position%3A%20absolute%3B%0A%09height%3A%20100%25%3B%0A%09background%3A%20var(--bf-range-fill)%3B%0A%09border-radius%3A%20inherit%3B%0A%7D%0A%0A.dual%20input%5Btype%3D'range'%5D%20%7B%0A%09position%3A%20absolute%3B%0A%09left%3A%200%3B%0A%09right%3A%200%3B%0A%09top%3A%2050%25%3B%0A%09transform%3A%20translateY(-50%25)%3B%0A%09background%3A%20transparent%3B%0A%09pointer-events%3A%20none%3B%0A%7D%0A%0A.dual%20input%5Btype%3D'range'%5D%3A%3A-webkit-slider-thumb%20%7B%0A%09pointer-events%3A%20auto%3B%0A%7D%0A%0A.dual%20input%5Btype%3D'range'%5D%3A%3A-moz-range-thumb%20%7B%0A%09pointer-events%3A%20auto%3B%0A%7D%0A%0A.star%20%7B%0A%09border%3A%200%3B%0A%09background%3A%20transparent%3B%0A%09color%3A%20var(--bf-range-rating-muted)%3B%0A%09font%3A%20inherit%3B%0A%09font-size%3A%201.1rem%3B%0A%09cursor%3A%20pointer%3B%0A%09padding%3A%200%3B%0A%09line-height%3A%201%3B%0A%7D%0A%0A.star.is-active%20%7B%0A%09color%3A%20var(--bf-range-rating-active)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = `
			<div class="single" part="single">
				<input class="single-input" type="range" part="input" />
			</div>
			<div class="dual" part="dual">
				<div class="dual-track" part="track">
					<div class="dual-fill" part="fill"></div>
				</div>
				<input class="dual-low" type="range" part="low" />
				<input class="dual-high" type="range" part="high" />
			</div>
			<div class="rating" part="rating"></div>
			<div class="meta" part="meta"><slot></slot></div>
		`;
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._single = root.querySelector(".single-input");
    this._dualLow = root.querySelector(".dual-low");
    this._dualHigh = root.querySelector(".dual-high");
    this._dualFill = root.querySelector(".dual-fill");
    this._rating = root.querySelector(".rating");
    this._single.addEventListener("input", this._onSingleInput);
    this._single.addEventListener("change", this._onSingleInput);
    this._dualLow.addEventListener("input", this._onRangeInput);
    this._dualLow.addEventListener("change", this._onRangeInput);
    this._dualHigh.addEventListener("input", this._onRangeInput);
    this._dualHigh.addEventListener("change", this._onRangeInput);
    this._sync();
  }
  attributeChangedCallback() {
    this._sync();
  }
  _mode() {
    const explicit = (this.getAttribute("mode") || "").toLowerCase();
    if (["slider", "range", "rating"].includes(explicit)) {
      return explicit;
    }
    if (this.hasAttribute("rating")) {
      return "rating";
    }
    if (this.hasAttribute("range")) {
      return "range";
    }
    return "slider";
  }
  _min() {
    const parsed = Number.parseFloat(this.getAttribute("min") || "0");
    return Number.isFinite(parsed) ? parsed : 0;
  }
  _max() {
    const parsed = Number.parseFloat(this.getAttribute("max") || "100");
    return Number.isFinite(parsed) && parsed > this._min() ? parsed : this._min() + 100;
  }
  _step() {
    const parsed = Number.parseFloat(this.getAttribute("step") || "1");
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }
  _parseValue(attrName, fallback) {
    const parsed = Number.parseFloat(this.getAttribute(attrName) || `${fallback}`);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return Math.min(this._max(), Math.max(this._min(), parsed));
  }
  _count() {
    const parsed = Number.parseInt(this.getAttribute("count") || "5", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
  }
  _setValueAttr(attrName, value) {
    const next = `${value}`;
    if (this.getAttribute(attrName) === next) {
      return;
    }
    this.setAttribute(attrName, next);
  }
  _emit(kind) {
    const mode = this._mode();
    this.dispatchEvent(
      new CustomEvent(kind, {
        bubbles: true,
        composed: true,
        detail: {
          mode,
          value: mode === "range" ? [this._parseValue("low", this._min()), this._parseValue("high", this._max())] : this._parseValue("value", this._min())
        }
      })
    );
  }
  _onSingleInput(event) {
    this._setValueAttr("value", event.target.value);
    this._emit(event.type === "change" ? "bf-change" : "bf-input");
  }
  _onRangeInput(event) {
    let low = this._parseValue("low", this._min());
    let high = this._parseValue("high", this._max());
    const next = Number.parseFloat(event.target.value);
    if (event.target === this._dualLow) {
      low = Math.min(next, high);
    } else {
      high = Math.max(next, low);
    }
    this._setValueAttr("low", low);
    this._setValueAttr("high", high);
    this._sync();
    this._emit(event.type === "change" ? "bf-change" : "bf-input");
  }
  _renderRating() {
    this._rating.replaceChildren();
    const count = this._count();
    const current = this._parseValue("value", 0);
    const disabled = this.hasAttribute("disabled");
    for (let i = 1; i <= count; i += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "star";
      button.textContent = "*";
      button.disabled = disabled;
      button.setAttribute("aria-label", `${i}`);
      if (i <= current) {
        button.classList.add("is-active");
      }
      button.addEventListener("click", () => {
        this._setValueAttr("value", i);
        this._sync();
        this._emit("bf-change");
      });
      this._rating.append(button);
    }
  }
  _syncDualFill() {
    const min = this._min();
    const max = this._max();
    const low = this._parseValue("low", min);
    const high = this._parseValue("high", max);
    const left = (low - min) / (max - min) * 100;
    const width = (high - low) / (max - min) * 100;
    this._dualFill.style.left = `${left}%`;
    this._dualFill.style.width = `${width}%`;
  }
  _sync() {
    if (!this._root) {
      return;
    }
    const mode = this._mode();
    const min = this._min();
    const max = this._max();
    const step = this._step();
    const disabled = this.hasAttribute("disabled");
    const label = this.getAttribute("label") || "";
    const name = this.getAttribute("name") || "";
    this._root.setAttribute("data-mode", mode);
    this._single.min = `${min}`;
    this._single.max = `${max}`;
    this._single.step = `${step}`;
    this._single.value = `${this._parseValue("value", min)}`;
    this._single.disabled = disabled;
    this._single.name = name;
    this._dualLow.min = `${min}`;
    this._dualLow.max = `${max}`;
    this._dualLow.step = `${step}`;
    this._dualLow.value = `${this._parseValue("low", min)}`;
    this._dualLow.disabled = disabled;
    this._dualLow.name = `${name ? `${name}-` : ""}low`;
    this._dualHigh.min = `${min}`;
    this._dualHigh.max = `${max}`;
    this._dualHigh.step = `${step}`;
    this._dualHigh.value = `${this._parseValue("high", max)}`;
    this._dualHigh.disabled = disabled;
    this._dualHigh.name = `${name ? `${name}-` : ""}high`;
    this._syncDualFill();
    this._renderRating();
    if (label) {
      this._single.setAttribute("aria-label", label);
      this._dualLow.setAttribute("aria-label", `${label} low`);
      this._dualHigh.setAttribute("aria-label", `${label} high`);
      this._rating.setAttribute("aria-label", label);
    }
  }
};
__publicField(BfRange, "observedAttributes", [
  "mode",
  "slider",
  "range",
  "rating",
  "value",
  "low",
  "high",
  "min",
  "max",
  "step",
  "count",
  "disabled",
  "label",
  "name"
]);
customElements.define("bf-range", BfRange);

// src/search/search.js
var BfSearch = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-search-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-search-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-search-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-search-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-search-border-color%3A%20var(--bf-theme-search-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-search-bg%3A%20var(--bf-theme-search-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-search-color%3A%20var(--bf-theme-search-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-search-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-search-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-search-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-search-font)%3B%0A%09color%3A%20var(--bf-search-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-search-bg)%3B%0A%09color%3A%20var(--bf-search-color)%3B%0A%09border-width%3A%20var(--bf-search-border-width)%3B%0A%09border-style%3A%20var(--bf-search-border-style)%3B%0A%09border-color%3A%20var(--bf-search-border-color)%3B%0A%09border-radius%3A%20var(--bf-search-radius)%3B%0A%09padding%3A%20var(--bf-search-padding-y)%20var(--bf-search-padding-x)%3B%0A%09transition%3A%20var(--bf-search-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "search";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-search", BfSearch);

// src/segmented-control/segmented-control.js
var BfSegmentedControl = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-segmented-control-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-segmented-control-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-segmented-control-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-segmented-control-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-segmented-control-border-color%3A%20var(--bf-theme-segmented-control-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-segmented-control-bg%3A%20var(--bf-theme-segmented-control-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-segmented-control-color%3A%20var(--bf-theme-segmented-control-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-segmented-control-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-segmented-control-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-segmented-control-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-segmented-control-font)%3B%0A%09color%3A%20var(--bf-segmented-control-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-segmented-control-bg)%3B%0A%09color%3A%20var(--bf-segmented-control-color)%3B%0A%09border-width%3A%20var(--bf-segmented-control-border-width)%3B%0A%09border-style%3A%20var(--bf-segmented-control-border-style)%3B%0A%09border-color%3A%20var(--bf-segmented-control-border-color)%3B%0A%09border-radius%3A%20var(--bf-segmented-control-radius)%3B%0A%09padding%3A%20var(--bf-segmented-control-padding-y)%20var(--bf-segmented-control-padding-x)%3B%0A%09transition%3A%20var(--bf-segmented-control-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "segmented control";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-segmented-control", BfSegmentedControl);

// src/select/select.js
var BfSelect = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onChange = this._onChange.bind(this);
    this._onLightDomMutate = this._onLightDomMutate.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._syncOptions();
      this._syncState();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-select-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-select-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-select-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-select-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-select-border-color%3A%20var(--bf-theme-select-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-select-bg%3A%20var(--bf-theme-select-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-select-color%3A%20var(--bf-theme-select-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-select-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-select-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-select-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-select-font)%3B%0A%09color%3A%20var(--bf-select-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09position%3A%20relative%3B%0A%09background%3A%20var(--bf-select-bg)%3B%0A%09color%3A%20var(--bf-select-color)%3B%0A%09border-width%3A%20var(--bf-select-border-width)%3B%0A%09border-style%3A%20var(--bf-select-border-style)%3B%0A%09border-color%3A%20var(--bf-select-border-color)%3B%0A%09border-radius%3A%20var(--bf-select-radius)%3B%0A%09transition%3A%20var(--bf-select-transition)%3B%0A%7D%0A%0Aselect%20%7B%0A%09appearance%3A%20none%3B%0A%09-webkit-appearance%3A%20none%3B%0A%09width%3A%20100%25%3B%0A%09border%3A%200%3B%0A%09outline%3A%200%3B%0A%09background%3A%20transparent%3B%0A%09color%3A%20inherit%3B%0A%09font%3A%20inherit%3B%0A%09padding%3A%20var(--bf-select-padding-y)%20calc(var(--bf-select-padding-x)%20*%202.1)%0A%09%09var(--bf-select-padding-y)%20var(--bf-select-padding-x)%3B%0A%7D%0A%0A.root.is-multi%20select%20%7B%0A%09padding-right%3A%20var(--bf-select-padding-x)%3B%0A%7D%0A%0A.chevron%20%7B%0A%09position%3A%20absolute%3B%0A%09top%3A%2050%25%3B%0A%09right%3A%20var(--bf-select-padding-x)%3B%0A%09width%3A%200.6rem%3B%0A%09height%3A%200.6rem%3B%0A%09transform%3A%20translateY(-60%25)%20rotate(45deg)%3B%0A%09border-right%3A%202px%20solid%20currentColor%3B%0A%09border-bottom%3A%202px%20solid%20currentColor%3B%0A%09opacity%3A%200.7%3B%0A%09pointer-events%3A%20none%3B%0A%7D%0A%0A.root.is-multi%20.chevron%20%7B%0A%09display%3A%20none%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = `
			<select part="select"></select>
			<span class="chevron" part="chevron" aria-hidden="true"></span>
		`;
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._select = root.querySelector("select");
    this._select.addEventListener("change", this._onChange);
    this._observer = new MutationObserver(this._onLightDomMutate);
    this._observer.observe(this, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["value", "selected", "disabled", "label"]
    });
    this._syncOptions();
    this._syncState();
  }
  disconnectedCallback() {
    if (this._observer) {
      this._observer.disconnect();
    }
  }
  attributeChangedCallback(name) {
    if (name === "value" && this._reflectingValue) {
      return;
    }
    this._syncState();
  }
  get value() {
    if (this._isMulti()) {
      return this.values;
    }
    return this._select?.value || "";
  }
  set value(nextValue) {
    if (Array.isArray(nextValue)) {
      this.setAttribute("value", nextValue.join(","));
      return;
    }
    this.setAttribute("value", `${nextValue ?? ""}`);
  }
  get values() {
    if (!this._select) {
      return [];
    }
    return [...this._select.selectedOptions].map((option) => option.value);
  }
  _onLightDomMutate() {
    this._syncOptions();
    this._syncState();
  }
  _onChange() {
    this._enforceMultiLimit();
    this._reflectValueAttribute();
    this.dispatchEvent(
      new CustomEvent("bf-change", {
        bubbles: true,
        composed: true,
        detail: {
          value: this._isMulti() ? this.values : this._select.value,
          values: this.values,
          multiple: this._isMulti(),
          multi: this._multiLimit()
        }
      })
    );
  }
  _isMulti() {
    return this.hasAttribute("multi");
  }
  _multiLimit() {
    if (!this._isMulti()) {
      return 1;
    }
    const raw = this.getAttribute("multi");
    if (raw === "" || raw === null) {
      return Infinity;
    }
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : Infinity;
  }
  _parsedValueAttribute() {
    const raw = this.getAttribute("value");
    if (raw === null) {
      return [];
    }
    if (this._isMulti()) {
      return raw.split(",").map((value) => value.trim()).filter(Boolean);
    }
    return [raw];
  }
  cloneLightDomOptions() {
    const fragment = document.createDocumentFragment();
    let count = 0;
    for (const child of this.children) {
      const tag = child.tagName.toLowerCase();
      if (tag === "option") {
        fragment.append(this._cloneOption(child));
        count += 1;
        continue;
      }
      if (tag === "optgroup") {
        const group = document.createElement("optgroup");
        const label = child.getAttribute("label");
        if (label) {
          group.label = label;
        }
        for (const option of child.querySelectorAll("option")) {
          group.append(this._cloneOption(option));
          count += 1;
        }
        fragment.append(group);
      }
    }
    return { fragment, count };
  }
  _cloneOption(option) {
    const clone = document.createElement("option");
    clone.value = option.getAttribute("value") ?? option.textContent?.trim() ?? "";
    clone.textContent = option.textContent?.trim() ?? "";
    clone.disabled = option.hasAttribute("disabled");
    clone.defaultSelected = option.hasAttribute("selected");
    clone.selected = option.hasAttribute("selected");
    return clone;
  }
  _syncOptions() {
    if (!this._select) {
      return;
    }
    const { fragment, count } = this.cloneLightDomOptions();
    this._select.replaceChildren();
    const placeholder = this.getAttribute("placeholder");
    const hasPlaceholder = Boolean(placeholder && !this._isMulti());
    if (hasPlaceholder) {
      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = placeholder;
      this._select.append(placeholderOption);
    }
    if (count > 0) {
      this._select.append(fragment);
    } else {
      const fallback = this.textContent?.trim();
      if (fallback) {
        const option = document.createElement("option");
        option.value = fallback;
        option.textContent = fallback;
        this._select.append(option);
      }
    }
  }
  _applyValueAttribute() {
    if (!this.hasAttribute("value")) {
      return;
    }
    const values = new Set(this._parsedValueAttribute());
    if (this._isMulti()) {
      for (const option of this._select.options) {
        option.selected = values.has(option.value);
      }
      return;
    }
    const first = this._parsedValueAttribute()[0] ?? "";
    this._select.value = first;
  }
  _enforceMultiLimit() {
    if (!this._isMulti()) {
      return;
    }
    const limit = this._multiLimit();
    if (limit === Infinity) {
      return;
    }
    const selected = [...this._select.options].filter((option) => option.selected);
    if (selected.length <= limit) {
      return;
    }
    for (let index = limit; index < selected.length; index += 1) {
      selected[index].selected = false;
    }
  }
  _reflectValueAttribute() {
    if (!this._select) {
      return;
    }
    const nextValue = this._isMulti() ? this.values.join(",") : this._select.value;
    if (this.getAttribute("value") === nextValue) {
      return;
    }
    this._reflectingValue = true;
    this.setAttribute("value", nextValue);
    this._reflectingValue = false;
  }
  _syncState() {
    if (!this._select || !this._root) {
      return;
    }
    this._select.multiple = this._isMulti();
    this._root.classList.toggle("is-multi", this._isMulti());
    this._select.disabled = this.hasAttribute("disabled");
    this._select.required = this.hasAttribute("required");
    this._select.name = this.getAttribute("name") || "";
    if (this.getAttribute("label")) {
      this._select.setAttribute("aria-label", this.getAttribute("label"));
    } else {
      this._select.removeAttribute("aria-label");
    }
    this._applyValueAttribute();
    this._enforceMultiLimit();
    this._reflectValueAttribute();
  }
};
__publicField(BfSelect, "observedAttributes", [
  "value",
  "multi",
  "disabled",
  "required",
  "placeholder",
  "label",
  "name"
]);
customElements.define("bf-select", BfSelect);

// src/skeleton/skeleton.js
var BfSkeleton = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      this._sync();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-skeleton-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-skeleton-width%3A%20100%25%3B%0A%09--bf-skeleton-height%3A%200.9rem%3B%0A%09--bf-skeleton-base%3A%20color-mix(in%20srgb%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1)%2055%25%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-skeleton-highlight%3A%20color-mix(in%20srgb%2C%20var(--bf-theme-surface-1%2C%20%23ffffff)%2086%25%2C%20transparent)%3B%0A%09--bf-skeleton-speed%3A%201.15s%3B%0A%0A%09display%3A%20block%3B%0A%7D%0A%0A.root%20%7B%0A%09position%3A%20relative%3B%0A%09overflow%3A%20hidden%3B%0A%09width%3A%20var(--bf-skeleton-width)%3B%0A%09height%3A%20var(--bf-skeleton-height)%3B%0A%09background%3A%20var(--bf-skeleton-base)%3B%0A%09border-radius%3A%20var(--bf-skeleton-radius)%3B%0A%09color%3A%20transparent%3B%0A%09user-select%3A%20none%3B%0A%7D%0A%0A.root%5Bdata-animate%3D'on'%5D%3A%3Aafter%20%7B%0A%09content%3A%20''%3B%0A%09position%3A%20absolute%3B%0A%09inset%3A%200%3B%0A%09background%3A%20linear-gradient(%0A%09%09100deg%2C%0A%09%09transparent%200%25%2C%0A%09%09var(--bf-skeleton-highlight)%2045%25%2C%0A%09%09transparent%2080%25%0A%09)%3B%0A%09transform%3A%20translateX(-100%25)%3B%0A%09animation%3A%20bf-skeleton-shimmer%20var(--bf-skeleton-speed)%20ease-in-out%20infinite%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'title'%5D%20%7B%0A%09--bf-skeleton-height%3A%201.05rem%3B%0A%09--bf-skeleton-width%3A%2058%25%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'avatar'%5D%20%7B%0A%09--bf-skeleton-width%3A%202.5rem%3B%0A%09--bf-skeleton-height%3A%202.5rem%3B%0A%09--bf-skeleton-radius%3A%20999px%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'button'%5D%20%7B%0A%09--bf-skeleton-width%3A%208rem%3B%0A%09--bf-skeleton-height%3A%202.1rem%3B%0A%09--bf-skeleton-radius%3A%2010px%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'image'%5D%20%7B%0A%09--bf-skeleton-height%3A%20auto%3B%0A%09--bf-skeleton-width%3A%20100%25%3B%0A%09aspect-ratio%3A%2016%20%2F%209%3B%0A%09border-radius%3A%2012px%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'paragraph'%5D%20%7B%0A%09--bf-skeleton-height%3A%20auto%3B%0A%09background%3A%20transparent%3B%0A%09display%3A%20grid%3B%0A%09gap%3A%200.45rem%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'paragraph'%5D%3A%3Aafter%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.lines%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'paragraph'%5D%20.lines%20%7B%0A%09display%3A%20grid%3B%0A%09gap%3A%200.45rem%3B%0A%7D%0A%0A.line%20%7B%0A%09position%3A%20relative%3B%0A%09display%3A%20block%3B%0A%09height%3A%200.78rem%3B%0A%09border-radius%3A%20999px%3B%0A%09background%3A%20var(--bf-skeleton-base)%3B%0A%09overflow%3A%20hidden%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'paragraph'%5D%5Bdata-animate%3D'on'%5D%20.line%3A%3Aafter%20%7B%0A%09content%3A%20''%3B%0A%09position%3A%20absolute%3B%0A%09inset%3A%200%3B%0A%09background%3A%20linear-gradient(%0A%09%09100deg%2C%0A%09%09transparent%200%25%2C%0A%09%09var(--bf-skeleton-highlight)%2045%25%2C%0A%09%09transparent%2080%25%0A%09)%3B%0A%09transform%3A%20translateX(-100%25)%3B%0A%09animation%3A%20bf-skeleton-shimmer%20var(--bf-skeleton-speed)%20ease-in-out%20infinite%3B%0A%7D%0A%0Aslot%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A%40keyframes%20bf-skeleton-shimmer%20%7B%0A%09100%25%20%7B%20transform%3A%20translateX(120%25)%3B%20%7D%0A%7D%0A%0A%40media%20(prefers-reduced-motion%3A%20reduce)%20%7B%0A%09.root%3A%3Aafter%2C%0A%09.line%3A%3Aafter%20%7B%0A%09%09animation%3A%20none%20!important%3B%0A%09%7D%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = '<div class="lines" part="lines"></div><slot></slot>';
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._lines = root.querySelector(".lines");
    this._sync();
  }
  attributeChangedCallback() {
    this._sync();
  }
  _sync() {
    if (!this._root || !this._lines) {
      return;
    }
    const rawVariant = (this.getAttribute("variant") || "text").toLowerCase();
    const lines = Math.max(1, Number.parseInt(this.getAttribute("lines") || "1", 10) || 1);
    const variant = rawVariant === "text" && lines > 1 ? "paragraph" : rawVariant;
    this._root.dataset.variant = variant;
    this._root.dataset.animate = this.hasAttribute("static") ? "off" : "on";
    this._setSizeVar("--bf-skeleton-width", this.getAttribute("width"));
    this._setSizeVar("--bf-skeleton-height", this.getAttribute("height"));
    this._setSizeVar("--bf-skeleton-radius", this.getAttribute("radius"));
    if (variant !== "paragraph") {
      this._lines.replaceChildren();
      return;
    }
    const widths = ["96%", "90%", "94%", "86%", "92%", "84%"];
    const nodes = [];
    for (let i = 0; i < lines; i += 1) {
      const line = document.createElement("span");
      line.className = "line";
      const width = i === lines - 1 ? "68%" : widths[i % widths.length];
      line.style.width = width;
      nodes.push(line);
    }
    this._lines.replaceChildren(...nodes);
  }
  _setSizeVar(name, value) {
    if (!value) {
      this.style.removeProperty(name);
      return;
    }
    const trimmed = value.trim();
    if (/^-?\d*\.?\d+$/.test(trimmed)) {
      this.style.setProperty(name, `${trimmed}px`);
      return;
    }
    this.style.setProperty(name, trimmed);
  }
};
__publicField(BfSkeleton, "observedAttributes", ["variant", "lines", "width", "height", "radius", "static"]);
customElements.define("bf-skeleton", BfSkeleton);

// src/split-button/split-button.js
var BfSplitButton = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-split-button-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-split-button-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-split-button-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-split-button-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-split-button-border-color%3A%20var(--bf-theme-split-button-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-split-button-bg%3A%20var(--bf-theme-split-button-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-split-button-color%3A%20var(--bf-theme-split-button-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-split-button-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-split-button-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-split-button-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-split-button-font)%3B%0A%09color%3A%20var(--bf-split-button-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-split-button-bg)%3B%0A%09color%3A%20var(--bf-split-button-color)%3B%0A%09border-width%3A%20var(--bf-split-button-border-width)%3B%0A%09border-style%3A%20var(--bf-split-button-border-style)%3B%0A%09border-color%3A%20var(--bf-split-button-border-color)%3B%0A%09border-radius%3A%20var(--bf-split-button-radius)%3B%0A%09padding%3A%20var(--bf-split-button-padding-y)%20var(--bf-split-button-padding-x)%3B%0A%09transition%3A%20var(--bf-split-button-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "split button";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-split-button", BfSplitButton);

// src/splitter/splitter.js
var BfSplitter = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-splitter-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-splitter-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-splitter-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-splitter-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-splitter-border-color%3A%20var(--bf-theme-splitter-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-splitter-bg%3A%20var(--bf-theme-splitter-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-splitter-color%3A%20var(--bf-theme-splitter-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-splitter-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-splitter-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-splitter-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-splitter-font)%3B%0A%09color%3A%20var(--bf-splitter-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-splitter-bg)%3B%0A%09color%3A%20var(--bf-splitter-color)%3B%0A%09border-width%3A%20var(--bf-splitter-border-width)%3B%0A%09border-style%3A%20var(--bf-splitter-border-style)%3B%0A%09border-color%3A%20var(--bf-splitter-border-color)%3B%0A%09border-radius%3A%20var(--bf-splitter-radius)%3B%0A%09padding%3A%20var(--bf-splitter-padding-y)%20var(--bf-splitter-padding-x)%3B%0A%09transition%3A%20var(--bf-splitter-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "splitter";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-splitter", BfSplitter);

// src/stack/stack.js
var BfStack = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-stack-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-stack-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-stack-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-stack-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-stack-border-color%3A%20var(--bf-theme-stack-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-stack-bg%3A%20var(--bf-theme-stack-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-stack-color%3A%20var(--bf-theme-stack-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-stack-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-stack-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-stack-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-stack-font)%3B%0A%09color%3A%20var(--bf-stack-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-stack-bg)%3B%0A%09color%3A%20var(--bf-stack-color)%3B%0A%09border-width%3A%20var(--bf-stack-border-width)%3B%0A%09border-style%3A%20var(--bf-stack-border-style)%3B%0A%09border-color%3A%20var(--bf-stack-border-color)%3B%0A%09border-radius%3A%20var(--bf-stack-radius)%3B%0A%09padding%3A%20var(--bf-stack-padding-y)%20var(--bf-stack-padding-x)%3B%0A%09transition%3A%20var(--bf-stack-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "stack";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-stack", BfStack);

// src/tab/tab.js
var BfTab = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onClick = this._onClick.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._syncState();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-tab-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-tab-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-tab-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-tab-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-tab-border-color%3A%20var(--bf-theme-tab-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-tab-bg%3A%20var(--bf-theme-tab-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-tab-color%3A%20var(--bf-theme-tab-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-tab-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-tab-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-tab-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20inline-block%3B%0A%09font%3A%20var(--bf-tab-font)%3B%0A%09color%3A%20var(--bf-tab-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09font%3A%20inherit%3B%0A%09cursor%3A%20pointer%3B%0A%09background%3A%20var(--bf-tab-bg)%3B%0A%09color%3A%20var(--bf-tab-color)%3B%0A%09border-width%3A%20var(--bf-tab-border-width)%3B%0A%09border-style%3A%20var(--bf-tab-border-style)%3B%0A%09border-color%3A%20var(--bf-tab-border-color)%3B%0A%09border-radius%3A%20var(--bf-tab-radius)%3B%0A%09padding%3A%20var(--bf-tab-padding-y)%20var(--bf-tab-padding-x)%3B%0A%09transition%3A%20var(--bf-tab-transition)%3B%0A%7D%0A%0A.root.is-selected%20%7B%0A%09background%3A%20var(--bf-theme-button-primary-bg%2C%20%232563eb)%3B%0A%09color%3A%20var(--bf-theme-button-primary-color%2C%20%23ffffff)%3B%0A%09border-color%3A%20var(--bf-theme-button-primary-border-color%2C%20%231d4ed8)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("button");
    root.className = "root";
    root.setAttribute("part", "root");
    root.type = "button";
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "tab";
    }
    this.shadowRoot.replaceChildren(link, root);
    this._button = root;
    root.addEventListener("click", this._onClick);
    this._syncState();
  }
  attributeChangedCallback() {
    this._syncState();
  }
  get selected() {
    return this.hasAttribute("selected");
  }
  set selected(value) {
    if (value) {
      this.setAttribute("selected", "");
      return;
    }
    this.removeAttribute("selected");
  }
  get value() {
    return this.getAttribute("value") || this.textContent?.trim() || "";
  }
  _onClick() {
    const group = this.getAttribute("group");
    if (group) {
      const peers = document.querySelectorAll(`bf-tab[group="${CSS.escape(group)}"]`);
      for (const peer of peers) {
        peer.selected = peer === this;
      }
    } else {
      this.selected = true;
    }
    this.dispatchEvent(
      new CustomEvent("bf-change", {
        bubbles: true,
        composed: true,
        detail: {
          group: group || "",
          value: this.value,
          selected: this.selected
        }
      })
    );
  }
  _syncState() {
    if (!this._button) {
      return;
    }
    if (this.getAttribute("label")) {
      this._button.setAttribute("aria-label", this.getAttribute("label"));
    }
    this._button.disabled = this.hasAttribute("disabled");
    this._button.setAttribute("aria-selected", String(this.selected));
    this._button.setAttribute("role", "tab");
    this._button.classList.toggle("is-selected", this.selected);
  }
};
__publicField(BfTab, "observedAttributes", ["selected", "disabled", "group", "label", "value"]);
customElements.define("bf-tab", BfTab);

// src/table/table.js
var BfTable = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-table-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-table-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-table-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-table-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-table-border-color%3A%20var(--bf-theme-table-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-table-bg%3A%20var(--bf-theme-table-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-table-color%3A%20var(--bf-theme-table-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-table-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-table-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-table-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-table-font)%3B%0A%09color%3A%20var(--bf-table-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-table-bg)%3B%0A%09color%3A%20var(--bf-table-color)%3B%0A%09border-width%3A%20var(--bf-table-border-width)%3B%0A%09border-style%3A%20var(--bf-table-border-style)%3B%0A%09border-color%3A%20var(--bf-table-border-color)%3B%0A%09border-radius%3A%20var(--bf-table-radius)%3B%0A%09padding%3A%20var(--bf-table-padding-y)%20var(--bf-table-padding-x)%3B%0A%09transition%3A%20var(--bf-table-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "table";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-table", BfTable);

// src/tag/tag.js
var BfTag = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      this._sync();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-tag-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-tag-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-tag-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-tag-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-tag-border-color%3A%20var(--bf-theme-tag-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-tag-bg%3A%20var(--bf-theme-tag-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-tag-color%3A%20var(--bf-theme-tag-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-tag-padding-y%3A%200.35rem%3B%0A%09--bf-tag-padding-x%3A%200.55rem%3B%0A%09--bf-tag-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20inline-block%3B%0A%09font%3A%20var(--bf-tag-font)%3B%0A%09color%3A%20var(--bf-tag-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09display%3A%20inline-flex%3B%0A%09align-items%3A%20center%3B%0A%09justify-content%3A%20center%3B%0A%09gap%3A%200.3rem%3B%0A%09line-height%3A%201%3B%0A%09font-size%3A%200.82rem%3B%0A%09font-weight%3A%20600%3B%0A%09background%3A%20var(--bf-tag-bg)%3B%0A%09color%3A%20var(--bf-tag-color)%3B%0A%09border-width%3A%20var(--bf-tag-border-width)%3B%0A%09border-style%3A%20var(--bf-tag-border-style)%3B%0A%09border-color%3A%20var(--bf-tag-border-color)%3B%0A%09border-radius%3A%20var(--bf-tag-radius)%3B%0A%09padding%3A%20var(--bf-tag-padding-y)%20var(--bf-tag-padding-x)%3B%0A%09transition%3A%20var(--bf-tag-transition)%3B%0A%7D%0A%0A.root%5Bdata-size%3D'sm'%5D%20%7B%0A%09font-size%3A%200.74rem%3B%0A%09padding%3A%200.22rem%200.42rem%3B%0A%7D%0A%0A.root%5Bdata-size%3D'lg'%5D%20%7B%0A%09font-size%3A%200.9rem%3B%0A%09padding%3A%200.45rem%200.68rem%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'badge'%5D%20%7B%0A%09font-size%3A%200.72rem%3B%0A%09font-weight%3A%20700%3B%0A%09min-width%3A%201.35rem%3B%0A%09padding%3A%200.14rem%200.42rem%3B%0A%09border-radius%3A%20999px%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'pill'%5D%20%7B%0A%09border-radius%3A%20999px%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'chip'%5D%20%7B%0A%09padding-right%3A%200.75rem%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "tag";
    }
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._sync();
  }
  attributeChangedCallback() {
    this._sync();
  }
  _sync() {
    if (!this._root) {
      return;
    }
    const explicit = (this.getAttribute("variant") || "").toLowerCase();
    let variant = "tag";
    if (["tag", "badge", "chip", "pill"].includes(explicit)) {
      variant = explicit;
    } else if (this.hasAttribute("badge")) {
      variant = "badge";
    } else if (this.hasAttribute("chip")) {
      variant = "chip";
    } else if (this.hasAttribute("pill")) {
      variant = "pill";
    }
    this._root.dataset.variant = variant;
    const size = (this.getAttribute("size") || "md").toLowerCase();
    this._root.dataset.size = ["sm", "md", "lg"].includes(size) ? size : "md";
  }
};
__publicField(BfTag, "observedAttributes", ["variant", "badge", "chip", "pill", "size"]);
customElements.define("bf-tag", BfTag);

// src/textarea/textarea.js
var BfTextarea = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-textarea-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-textarea-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-textarea-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-textarea-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-textarea-border-color%3A%20var(--bf-theme-textarea-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-textarea-bg%3A%20var(--bf-theme-textarea-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-textarea-color%3A%20var(--bf-theme-textarea-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-textarea-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-textarea-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-textarea-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-textarea-font)%3B%0A%09color%3A%20var(--bf-textarea-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-textarea-bg)%3B%0A%09color%3A%20var(--bf-textarea-color)%3B%0A%09border-width%3A%20var(--bf-textarea-border-width)%3B%0A%09border-style%3A%20var(--bf-textarea-border-style)%3B%0A%09border-color%3A%20var(--bf-textarea-border-color)%3B%0A%09border-radius%3A%20var(--bf-textarea-radius)%3B%0A%09padding%3A%20var(--bf-textarea-padding-y)%20var(--bf-textarea-padding-x)%3B%0A%09transition%3A%20var(--bf-textarea-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "textarea";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-textarea", BfTextarea);

// src/timeline/timeline.js
var BfTimeline = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-timeline-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-timeline-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-timeline-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-timeline-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-timeline-border-color%3A%20var(--bf-theme-timeline-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-timeline-bg%3A%20var(--bf-theme-timeline-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-timeline-color%3A%20var(--bf-theme-timeline-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-timeline-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-timeline-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-timeline-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-timeline-font)%3B%0A%09color%3A%20var(--bf-timeline-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-timeline-bg)%3B%0A%09color%3A%20var(--bf-timeline-color)%3B%0A%09border-width%3A%20var(--bf-timeline-border-width)%3B%0A%09border-style%3A%20var(--bf-timeline-border-style)%3B%0A%09border-color%3A%20var(--bf-timeline-border-color)%3B%0A%09border-radius%3A%20var(--bf-timeline-radius)%3B%0A%09padding%3A%20var(--bf-timeline-padding-y)%20var(--bf-timeline-padding-x)%3B%0A%09transition%3A%20var(--bf-timeline-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "timeline";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-timeline", BfTimeline);

// src/toast/toast.js
var BfToast = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onCloseClick = this._onCloseClick.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._syncState();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-toast-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-toast-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-toast-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-toast-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-toast-border-color%3A%20var(--bf-theme-toast-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-toast-bg%3A%20var(--bf-theme-toast-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-toast-color%3A%20var(--bf-theme-toast-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-toast-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-toast-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-toast-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09--bf-toast-success-bg%3A%20var(--bf-theme-success-bg%2C%20%23dcfce7)%3B%0A%09--bf-toast-success-color%3A%20var(--bf-theme-success-color%2C%20%23166534)%3B%0A%09--bf-toast-warning-bg%3A%20var(--bf-theme-warning-bg%2C%20%23fef3c7)%3B%0A%09--bf-toast-warning-color%3A%20var(--bf-theme-warning-color%2C%20%2392400e)%3B%0A%09--bf-toast-error-bg%3A%20var(--bf-theme-error-bg%2C%20%23fee2e2)%3B%0A%09--bf-toast-error-color%3A%20var(--bf-theme-error-color%2C%20%23991b1b)%3B%0A%09--bf-toast-info-bg%3A%20var(--bf-theme-info-bg%2C%20var(--bf-toast-bg))%3B%0A%09--bf-toast-info-color%3A%20var(--bf-theme-info-color%2C%20var(--bf-toast-color))%3B%0A%09--bf-toast-snackbar-bg%3A%20var(--bf-theme-snackbar-bg%2C%20%23111827)%3B%0A%09--bf-toast-snackbar-color%3A%20var(--bf-theme-snackbar-color%2C%20%23f8fafc)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-toast-font)%3B%0A%09color%3A%20var(--bf-toast-color)%3B%0A%09z-index%3A%201000%3B%0A%7D%0A%0A.root%20%7B%0A%09display%3A%20grid%3B%0A%09grid-template-columns%3A%20auto%201fr%20auto%3B%0A%09align-items%3A%20start%3B%0A%09gap%3A%200.5rem%3B%0A%09min-width%3A%2016rem%3B%0A%09max-width%3A%2030rem%3B%0A%09background%3A%20var(--bf-toast-bg)%3B%0A%09color%3A%20var(--bf-toast-color)%3B%0A%09border-width%3A%20var(--bf-toast-border-width)%3B%0A%09border-style%3A%20var(--bf-toast-border-style)%3B%0A%09border-color%3A%20var(--bf-toast-border-color)%3B%0A%09border-radius%3A%20var(--bf-toast-radius)%3B%0A%09padding%3A%20var(--bf-toast-padding-y)%20var(--bf-toast-padding-x)%3B%0A%09transition%3A%20var(--bf-toast-transition)%3B%0A%09box-shadow%3A%200%208px%2028px%20rgba(15%2C%2023%2C%2042%2C%200.18)%3B%0A%7D%0A%0A.icon%20%7B%0A%09width%3A%201.1rem%3B%0A%09height%3A%201.1rem%3B%0A%09display%3A%20inline-flex%3B%0A%09align-items%3A%20center%3B%0A%09justify-content%3A%20center%3B%0A%09font-weight%3A%20700%3B%0A%09line-height%3A%201%3B%0A%09margin-top%3A%200.1rem%3B%0A%7D%0A%0A.content%20%7B%0A%09min-width%3A%200%3B%0A%7D%0A%0A.close%20%7B%0A%09border%3A%200%3B%0A%09background%3A%20transparent%3B%0A%09color%3A%20currentColor%3B%0A%09font%3A%20inherit%3B%0A%09line-height%3A%201%3B%0A%09cursor%3A%20pointer%3B%0A%09padding%3A%200%3B%0A%09opacity%3A%200.75%3B%0A%7D%0A%0A.close%3Ahover%20%7B%0A%09opacity%3A%201%3B%0A%7D%0A%0A.root%5Bdata-open%3D'false'%5D%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'alert'%5D%20%7B%0A%09border-left-width%3A%204px%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'notification'%5D%20%7B%0A%09border-radius%3A%20calc(var(--bf-toast-radius)%20%2B%204px)%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'snackbar'%5D%20%7B%0A%09background%3A%20var(--bf-toast-snackbar-bg)%3B%0A%09color%3A%20var(--bf-toast-snackbar-color)%3B%0A%09border-color%3A%20transparent%3B%0A%09border-radius%3A%20999px%3B%0A%09padding-inline%3A%200.9rem%3B%0A%09min-width%3A%2014rem%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'snackbar'%5D%20.icon%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'banner'%5D%20%7B%0A%09width%3A%20min(100%25%2C%2064rem)%3B%0A%09max-width%3A%2064rem%3B%0A%09border-radius%3A%2010px%3B%0A%09box-shadow%3A%20none%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'banner'%5D%20.icon%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.root%5Bdata-type%3D'success'%5D%20%7B%0A%09background%3A%20var(--bf-toast-success-bg)%3B%0A%09color%3A%20var(--bf-toast-success-color)%3B%0A%7D%0A%0A.root%5Bdata-type%3D'warning'%5D%20%7B%0A%09background%3A%20var(--bf-toast-warning-bg)%3B%0A%09color%3A%20var(--bf-toast-warning-color)%3B%0A%7D%0A%0A.root%5Bdata-type%3D'error'%5D%20%7B%0A%09background%3A%20var(--bf-toast-error-bg)%3B%0A%09color%3A%20var(--bf-toast-error-color)%3B%0A%7D%0A%0A.root%5Bdata-type%3D'info'%5D%20%7B%0A%09background%3A%20var(--bf-toast-info-bg)%3B%0A%09color%3A%20var(--bf-toast-info-color)%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'snackbar'%5D%5Bdata-type%3D'success'%5D%2C%0A.root%5Bdata-variant%3D'snackbar'%5D%5Bdata-type%3D'warning'%5D%2C%0A.root%5Bdata-variant%3D'snackbar'%5D%5Bdata-type%3D'error'%5D%2C%0A.root%5Bdata-variant%3D'snackbar'%5D%5Bdata-type%3D'info'%5D%20%7B%0A%09background%3A%20var(--bf-toast-snackbar-bg)%3B%0A%09color%3A%20var(--bf-toast-snackbar-color)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = `
			<span class="icon" part="icon" aria-hidden="true"></span>
			<div class="content" part="content"><slot></slot></div>
			<button class="close" part="close" type="button" aria-label="Close">&times;</button>
		`;
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._icon = root.querySelector(".icon");
    this._close = root.querySelector(".close");
    this._close.addEventListener("click", this._onCloseClick);
    if (!this.textContent?.trim()) {
      this.textContent = "toast";
    }
    this._syncState();
  }
  disconnectedCallback() {
    this._clearDurationTimer();
  }
  attributeChangedCallback() {
    this._syncState();
  }
  get open() {
    return this.hasAttribute("open");
  }
  set open(next) {
    if (next) {
      this.setAttribute("open", "");
      return;
    }
    this.removeAttribute("open");
  }
  show() {
    this.open = true;
  }
  hide() {
    this.open = false;
  }
  _onCloseClick() {
    this.hide();
    this.dispatchEvent(
      new CustomEvent("bf-close", {
        bubbles: true,
        composed: true,
        detail: { id: this.id || "" }
      })
    );
  }
  _variant() {
    const explicit = (this.getAttribute("variant") || "").toLowerCase();
    if (["toast", "alert", "notification", "snackbar", "banner"].includes(explicit)) {
      return explicit;
    }
    if (this.hasAttribute("alert")) {
      return "alert";
    }
    if (this.hasAttribute("notification")) {
      return "notification";
    }
    if (this.hasAttribute("snackbar")) {
      return "snackbar";
    }
    if (this.hasAttribute("banner")) {
      return "banner";
    }
    return "toast";
  }
  _type() {
    const explicit = (this.getAttribute("type") || "").toLowerCase();
    if (["success", "warning", "error", "info"].includes(explicit)) {
      return explicit;
    }
    if (this.hasAttribute("success")) {
      return "success";
    }
    if (this.hasAttribute("warning")) {
      return "warning";
    }
    if (this.hasAttribute("error")) {
      return "error";
    }
    return "info";
  }
  _position() {
    const variant = this._variant();
    const explicit = (this.getAttribute("position") || "").toLowerCase().replace(/\s+/g, "-");
    if (explicit && this._isValidPosition(explicit)) {
      return explicit;
    }
    if (variant === "snackbar" && !this.hasAttribute("top") && !this.hasAttribute("bottom") && !this.hasAttribute("left") && !this.hasAttribute("right") && !this.hasAttribute("center") && !this.hasAttribute("position")) {
      return "bottom-center";
    }
    if (variant === "banner" && !this.hasAttribute("top") && !this.hasAttribute("bottom") && !this.hasAttribute("left") && !this.hasAttribute("right") && !this.hasAttribute("center") && !this.hasAttribute("position")) {
      return "top-center";
    }
    const y = this.hasAttribute("bottom") ? "bottom" : "top";
    let x = "right";
    if (this.hasAttribute("left")) {
      x = "left";
    }
    if (this.hasAttribute("center")) {
      x = "center";
    }
    if (this.hasAttribute("right")) {
      x = "right";
    }
    return `${y}-${x}`;
  }
  _isValidPosition(position) {
    return [
      "top-left",
      "top-center",
      "top-right",
      "bottom-left",
      "bottom-center",
      "bottom-right"
    ].includes(position);
  }
  _duration() {
    const parsed = Number.parseInt(this.getAttribute("duration") || "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }
  _iconSymbol() {
    const type = this._type();
    if (type === "success") {
      return "\u2713";
    }
    if (type === "warning") {
      return "!";
    }
    if (type === "error") {
      return "x";
    }
    return "i";
  }
  _clearDurationTimer() {
    if (!this._durationTimer) {
      return;
    }
    clearTimeout(this._durationTimer);
    this._durationTimer = null;
  }
  _scheduleAutoHide() {
    this._clearDurationTimer();
    const ms = this._duration();
    if (!this.open || ms <= 0) {
      return;
    }
    this._durationTimer = setTimeout(() => {
      this.hide();
    }, ms);
  }
  _syncState() {
    if (!this._root) {
      return;
    }
    const variant = this._variant();
    const type = this._type();
    const position = this._position();
    if (!this.hasAttribute("open")) {
      this.setAttribute("open", "");
    }
    this._root.setAttribute("data-variant", variant);
    this._root.setAttribute("data-type", type);
    this._root.setAttribute("data-position", position);
    this._root.setAttribute("data-open", this.open ? "true" : "false");
    this._icon.textContent = this._iconSymbol();
    this._applyPosition(position);
    this.setAttribute("role", variant === "alert" ? "alert" : "status");
    this.setAttribute("aria-live", variant === "alert" ? "assertive" : "polite");
    this._scheduleAutoHide();
  }
  _applyPosition(position) {
    const anchored = this.hasAttribute("position") || this.hasAttribute("top") || this.hasAttribute("bottom") || this.hasAttribute("left") || this.hasAttribute("right") || this.hasAttribute("center");
    if (!anchored) {
      this.style.position = "";
      this.style.top = "";
      this.style.bottom = "";
      this.style.left = "";
      this.style.right = "";
      this.style.transform = "";
      return;
    }
    this.style.position = "fixed";
    this.style.zIndex = "1000";
    this.style.top = "";
    this.style.bottom = "";
    this.style.left = "";
    this.style.right = "";
    this.style.transform = "";
    const [y, x] = position.split("-");
    this.style[y] = "1rem";
    if (x === "left") {
      this.style.left = "1rem";
    } else if (x === "right") {
      this.style.right = "1rem";
    } else {
      this.style.left = "50%";
      this.style.transform = "translateX(-50%)";
    }
  }
};
__publicField(BfToast, "observedAttributes", [
  "variant",
  "position",
  "type",
  "duration",
  "open",
  "alert",
  "notification",
  "snackbar",
  "banner",
  "top",
  "bottom",
  "left",
  "right",
  "center",
  "success",
  "warning",
  "error",
  "info"
]);
customElements.define("bf-toast", BfToast);

// src/toggle/toggle.js
var BfToggle = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onClick = this._onClick.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._sync();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-toggle-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-toggle-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-toggle-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-toggle-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-toggle-border-color%3A%20var(--bf-theme-toggle-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-toggle-bg%3A%20var(--bf-theme-toggle-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-toggle-color%3A%20var(--bf-theme-toggle-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-toggle-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-toggle-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-toggle-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-toggle-font)%3B%0A%09color%3A%20var(--bf-toggle-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09display%3A%20inline-flex%3B%0A%09align-items%3A%20center%3B%0A%09gap%3A%200.55rem%3B%0A%09background%3A%20var(--bf-toggle-bg)%3B%0A%09color%3A%20var(--bf-toggle-color)%3B%0A%09border-width%3A%20var(--bf-toggle-border-width)%3B%0A%09border-style%3A%20var(--bf-toggle-border-style)%3B%0A%09border-color%3A%20var(--bf-toggle-border-color)%3B%0A%09border-radius%3A%20var(--bf-toggle-radius)%3B%0A%09padding%3A%20var(--bf-toggle-padding-y)%20var(--bf-toggle-padding-x)%3B%0A%09transition%3A%20var(--bf-toggle-transition)%3B%0A%09cursor%3A%20pointer%3B%0A%7D%0A%0A.track%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'switch'%5D%20%7B%0A%09border-color%3A%20transparent%3B%0A%09background%3A%20transparent%3B%0A%09padding%3A%200%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'switch'%5D%20.track%20%7B%0A%09display%3A%20inline-flex%3B%0A%09align-items%3A%20center%3B%0A%09width%3A%202.2rem%3B%0A%09height%3A%201.3rem%3B%0A%09border-radius%3A%20999px%3B%0A%09background%3A%20var(--bf-theme-surface-2%2C%20%23cbd5e1)%3B%0A%09padding%3A%200.15rem%3B%0A%09transition%3A%20background-color%20140ms%20ease%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'switch'%5D%20.thumb%20%7B%0A%09width%3A%201rem%3B%0A%09height%3A%201rem%3B%0A%09border-radius%3A%2050%25%3B%0A%09background%3A%20%23fff%3B%0A%09box-shadow%3A%200%201px%202px%20rgba(0%2C%200%2C%200%2C%200.2)%3B%0A%09transform%3A%20translateX(0)%3B%0A%09transition%3A%20transform%20140ms%20ease%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'switch'%5D.is-checked%20.track%20%7B%0A%09background%3A%20var(--bf-theme-button-primary-bg%2C%20%232563eb)%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'switch'%5D.is-checked%20.thumb%20%7B%0A%09transform%3A%20translateX(0.9rem)%3B%0A%7D%0A%0A.root%5Bdata-variant%3D'toggle'%5D.is-checked%20%7B%0A%09background%3A%20color-mix(in%20srgb%2C%20var(--bf-theme-button-primary-bg%2C%20%232563eb)%2012%25%2C%20var(--bf-toggle-bg))%3B%0A%09border-color%3A%20var(--bf-theme-button-primary-bg%2C%20%232563eb)%3B%0A%7D%0A%0A.root%3Adisabled%20%7B%0A%09opacity%3A%200.55%3B%0A%09cursor%3A%20not-allowed%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("button");
    root.className = "root";
    root.setAttribute("part", "root");
    root.type = "button";
    root.innerHTML = `
			<span class="track" part="track"><span class="thumb" part="thumb"></span></span>
			<span class="text" part="text"><slot></slot></span>
		`;
    this.shadowRoot.replaceChildren(link, root);
    this._root = root;
    this._text = root.querySelector(".text");
    this._root.addEventListener("click", this._onClick);
    if (!this.textContent?.trim()) {
      this.textContent = "toggle";
    }
    this._sync();
  }
  attributeChangedCallback() {
    this._sync();
  }
  get checked() {
    return this.hasAttribute("checked");
  }
  set checked(next) {
    if (next) {
      this.setAttribute("checked", "");
      return;
    }
    this.removeAttribute("checked");
  }
  _onClick() {
    if (this.hasAttribute("disabled")) {
      return;
    }
    this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent("bf-change", {
        bubbles: true,
        composed: true,
        detail: {
          checked: this.checked
        }
      })
    );
  }
  _variant() {
    const variant = (this.getAttribute("variant") || "").toLowerCase();
    if (variant === "switch" || this.hasAttribute("switch")) {
      return "switch";
    }
    return "toggle";
  }
  _sync() {
    if (!this._root) {
      return;
    }
    const variant = this._variant();
    this._root.setAttribute("data-variant", variant);
    this._root.setAttribute("aria-pressed", String(this.checked));
    this._root.setAttribute("role", "switch");
    this._root.setAttribute("aria-checked", String(this.checked));
    this._root.disabled = this.hasAttribute("disabled");
    this._root.classList.toggle("is-checked", this.checked);
    if (this.getAttribute("label")) {
      this._root.setAttribute("aria-label", this.getAttribute("label"));
    }
    this._text.hidden = variant === "switch" && !(this.textContent || "").trim();
  }
};
__publicField(BfToggle, "observedAttributes", ["checked", "disabled", "label", "switch", "variant"]);
customElements.define("bf-toggle", BfToggle);

// src/toolbar/toolbar.js
var BfToolbar = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-toolbar-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-toolbar-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-toolbar-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-toolbar-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-toolbar-border-color%3A%20var(--bf-theme-toolbar-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-toolbar-bg%3A%20var(--bf-theme-toolbar-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-toolbar-color%3A%20var(--bf-theme-toolbar-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-toolbar-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-toolbar-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-toolbar-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-toolbar-font)%3B%0A%09color%3A%20var(--bf-toolbar-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-toolbar-bg)%3B%0A%09color%3A%20var(--bf-toolbar-color)%3B%0A%09border-width%3A%20var(--bf-toolbar-border-width)%3B%0A%09border-style%3A%20var(--bf-toolbar-border-style)%3B%0A%09border-color%3A%20var(--bf-toolbar-border-color)%3B%0A%09border-radius%3A%20var(--bf-toolbar-radius)%3B%0A%09padding%3A%20var(--bf-toolbar-padding-y)%20var(--bf-toolbar-padding-x)%3B%0A%09transition%3A%20var(--bf-toolbar-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "toolbar";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-toolbar", BfToolbar);

// src/tree-view/tree-view.js
var BfTreeView = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-tree-view-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-tree-view-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-tree-view-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-tree-view-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-tree-view-border-color%3A%20var(--bf-theme-tree-view-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-tree-view-bg%3A%20var(--bf-theme-tree-view-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-tree-view-color%3A%20var(--bf-theme-tree-view-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-tree-view-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-tree-view-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-tree-view-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-tree-view-font)%3B%0A%09color%3A%20var(--bf-tree-view-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-tree-view-bg)%3B%0A%09color%3A%20var(--bf-tree-view-color)%3B%0A%09border-width%3A%20var(--bf-tree-view-border-width)%3B%0A%09border-style%3A%20var(--bf-tree-view-border-style)%3B%0A%09border-color%3A%20var(--bf-tree-view-border-color)%3B%0A%09border-radius%3A%20var(--bf-tree-view-radius)%3B%0A%09padding%3A%20var(--bf-tree-view-padding-y)%20var(--bf-tree-view-padding-x)%3B%0A%09transition%3A%20var(--bf-tree-view-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "tree view";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-tree-view", BfTreeView);

// src/video-player/video-player.js
var BfVideoPlayer = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-video-player-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-video-player-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-video-player-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-video-player-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-video-player-border-color%3A%20var(--bf-theme-video-player-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-video-player-bg%3A%20var(--bf-theme-video-player-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-video-player-color%3A%20var(--bf-theme-video-player-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-video-player-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-video-player-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-video-player-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-video-player-font)%3B%0A%09color%3A%20var(--bf-video-player-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-video-player-bg)%3B%0A%09color%3A%20var(--bf-video-player-color)%3B%0A%09border-width%3A%20var(--bf-video-player-border-width)%3B%0A%09border-style%3A%20var(--bf-video-player-border-style)%3B%0A%09border-color%3A%20var(--bf-video-player-border-color)%3B%0A%09border-radius%3A%20var(--bf-video-player-radius)%3B%0A%09padding%3A%20var(--bf-video-player-padding-y)%20var(--bf-video-player-padding-x)%3B%0A%09transition%3A%20var(--bf-video-player-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "video player";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-video-player", BfVideoPlayer);

// src/virtual-list/virtual-list.js
var BfVirtualList = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-virtual-list-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-virtual-list-radius%3A%20var(--bf-theme-radius-md%2C%208px)%3B%0A%09--bf-virtual-list-border-width%3A%20var(--bf-theme-border-width%2C%201px)%3B%0A%09--bf-virtual-list-border-style%3A%20var(--bf-theme-border-style%2C%20solid)%3B%0A%09--bf-virtual-list-border-color%3A%20var(--bf-theme-virtual-list-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-virtual-list-bg%3A%20var(--bf-theme-virtual-list-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-virtual-list-color%3A%20var(--bf-theme-virtual-list-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-virtual-list-padding-y%3A%20var(--bf-theme-space-2%2C%200.6rem)%3B%0A%09--bf-virtual-list-padding-x%3A%20var(--bf-theme-space-3%2C%200.9rem)%3B%0A%09--bf-virtual-list-transition%3A%0A%09%09var(--bf-theme-transition-bg%2C%20background-color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-color%2C%20color%20120ms%20ease)%2C%0A%09%09var(--bf-theme-transition-border%2C%20border-color%20120ms%20ease)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-virtual-list-font)%3B%0A%09color%3A%20var(--bf-virtual-list-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-virtual-list-bg)%3B%0A%09color%3A%20var(--bf-virtual-list-color)%3B%0A%09border-width%3A%20var(--bf-virtual-list-border-width)%3B%0A%09border-style%3A%20var(--bf-virtual-list-border-style)%3B%0A%09border-color%3A%20var(--bf-virtual-list-border-color)%3B%0A%09border-radius%3A%20var(--bf-virtual-list-radius)%3B%0A%09padding%3A%20var(--bf-virtual-list-padding-y)%20var(--bf-virtual-list-padding-x)%3B%0A%09transition%3A%20var(--bf-virtual-list-transition)%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
    root.innerHTML = "<slot></slot>";
    if (!this.innerHTML.trim()) {
      root.textContent = "virtual list";
    }
    this.shadowRoot.replaceChildren(link, root);
  }
};
customElements.define("bf-virtual-list", BfVirtualList);

// src/wizard/wizard.js
var BfWizard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._onPrev = this._onPrev.bind(this);
    this._onNext = this._onNext.bind(this);
  }
  connectedCallback() {
    if (this._initialized) {
      this._sync();
      return;
    }
    this._initialized = true;
    const cssUrl = new URL("data:text/css;charset=utf-8,%3Ahost%20%7B%0A%09--bf-wizard-font%3A%20var(--bf-theme-font-family%2C%20inherit)%3B%0A%09--bf-wizard-radius%3A%20var(--bf-theme-radius-md%2C%2010px)%3B%0A%09--bf-wizard-border-color%3A%20var(--bf-theme-wizard-border-color%2C%20var(--bf-theme-border-1%2C%20%23cbd5e1))%3B%0A%09--bf-wizard-bg%3A%20var(--bf-theme-wizard-bg%2C%20var(--bf-theme-surface-1%2C%20%23ffffff))%3B%0A%09--bf-wizard-color%3A%20var(--bf-theme-wizard-color%2C%20var(--bf-theme-text-1%2C%20%230f172a))%3B%0A%09--bf-wizard-accent%3A%20var(--bf-theme-button-primary-bg%2C%20%232563eb)%3B%0A%09--bf-wizard-muted%3A%20var(--bf-theme-text-2%2C%20%2364748b)%3B%0A%0A%09display%3A%20block%3B%0A%09font%3A%20var(--bf-wizard-font)%3B%0A%09color%3A%20var(--bf-wizard-color)%3B%0A%7D%0A%0A.root%20%7B%0A%09background%3A%20var(--bf-wizard-bg)%3B%0A%09color%3A%20var(--bf-wizard-color)%3B%0A%09border%3A%201px%20solid%20var(--bf-wizard-border-color)%3B%0A%09border-radius%3A%20var(--bf-wizard-radius)%3B%0A%09padding%3A%200.85rem%3B%0A%09display%3A%20grid%3B%0A%09gap%3A%200.8rem%3B%0A%7D%0A%0A.steps%20%7B%0A%09list-style%3A%20none%3B%0A%09margin%3A%200%3B%0A%09padding%3A%200%3B%0A%09display%3A%20flex%3B%0A%09flex-wrap%3A%20wrap%3B%0A%09gap%3A%200.55rem%3B%0A%7D%0A%0A.steps%20li%20%7B%0A%09display%3A%20inline-flex%3B%0A%09align-items%3A%20center%3B%0A%09gap%3A%200.4rem%3B%0A%09color%3A%20var(--bf-wizard-muted)%3B%0A%7D%0A%0A.steps%20.dot%20%7B%0A%09width%3A%201.4rem%3B%0A%09height%3A%201.4rem%3B%0A%09border-radius%3A%20999px%3B%0A%09border%3A%201px%20solid%20var(--bf-wizard-border-color)%3B%0A%09display%3A%20inline-flex%3B%0A%09align-items%3A%20center%3B%0A%09justify-content%3A%20center%3B%0A%09font-size%3A%200.78rem%3B%0A%7D%0A%0A.steps%20li.current%20%7B%0A%09color%3A%20var(--bf-wizard-color)%3B%0A%09font-weight%3A%20600%3B%0A%7D%0A%0A.steps%20li.current%20.dot%20%7B%0A%09background%3A%20var(--bf-wizard-accent)%3B%0A%09color%3A%20%23fff%3B%0A%09border-color%3A%20var(--bf-wizard-accent)%3B%0A%7D%0A%0A.steps%20li.done%20.dot%20%7B%0A%09border-color%3A%20var(--bf-wizard-accent)%3B%0A%09color%3A%20var(--bf-wizard-accent)%3B%0A%7D%0A%0A.content.is-empty%20%7B%0A%09display%3A%20none%3B%0A%7D%0A%0A.actions%20%7B%0A%09display%3A%20flex%3B%0A%09justify-content%3A%20space-between%3B%0A%09gap%3A%200.6rem%3B%0A%7D%0A%0A.actions%20button%20%7B%0A%09border%3A%201px%20solid%20var(--bf-wizard-border-color)%3B%0A%09background%3A%20var(--bf-theme-surface-1%2C%20%23fff)%3B%0A%09color%3A%20inherit%3B%0A%09border-radius%3A%207px%3B%0A%09padding%3A%200.35rem%200.7rem%3B%0A%09cursor%3A%20pointer%3B%0A%7D%0A%0A.actions%20button%3Adisabled%20%7B%0A%09opacity%3A%200.55%3B%0A%09cursor%3A%20not-allowed%3B%0A%7D%0A%0A.root%5Bdata-mode%3D'stepper'%5D%20.content%2C%0A.root%5Bdata-mode%3D'stepper'%5D%20.actions%20%7B%0A%09display%3A%20none%3B%0A%7D%0A", import.meta.url);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl.href;
    const root = document.createElement("div");
    root.className = "root";
    root.setAttribute("part", "root");
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
    this._stepsEl = root.querySelector(".steps");
    this._content = root.querySelector(".content");
    this._prevBtn = root.querySelector(".prev");
    this._nextBtn = root.querySelector(".next");
    this._slot = root.querySelector("slot");
    this._prevBtn.addEventListener("click", this._onPrev);
    this._nextBtn.addEventListener("click", this._onNext);
    this._slot.addEventListener("slotchange", () => this._sync());
    this._sync();
  }
  attributeChangedCallback() {
    this._sync();
  }
  get step() {
    return this._step();
  }
  set step(next) {
    this.setAttribute("step", `${next}`);
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
      new CustomEvent("bf-change", {
        bubbles: true,
        composed: true,
        detail: {
          step: this._step(),
          mode: this._mode()
        }
      })
    );
  }
  _mode() {
    const mode = (this.getAttribute("mode") || "").toLowerCase();
    if (mode === "stepper" || this.hasAttribute("stepper")) {
      return "stepper";
    }
    return "wizard";
  }
  _items() {
    const explicit = (this.getAttribute("steps") || "").split(",").map((item) => item.trim()).filter(Boolean);
    if (explicit.length) {
      return explicit;
    }
    const panels = [...this.children].filter((child) => child.tagName.toLowerCase() === "section").map((panel) => panel.getAttribute("title") || panel.id || "Step");
    if (panels.length) {
      return panels;
    }
    return ["Step 1", "Step 2", "Step 3"];
  }
  _step() {
    const parsed = Number.parseInt(this.getAttribute("step") || "1", 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return 1;
    }
    return Math.min(parsed, this._items().length);
  }
  _renderSteps(items, current) {
    this._stepsEl.replaceChildren();
    items.forEach((label, index) => {
      const li = document.createElement("li");
      const stepNumber = index + 1;
      if (stepNumber === current) {
        li.classList.add("current");
      } else if (stepNumber < current) {
        li.classList.add("done");
      }
      li.innerHTML = `<span class="dot">${stepNumber}</span><span class="label">${label}</span>`;
      this._stepsEl.append(li);
    });
  }
  _syncPanels(current) {
    const panels = [...this.children].filter((child) => child.tagName.toLowerCase() === "section");
    if (!panels.length) {
      this._content.classList.add("is-empty");
      return;
    }
    this._content.classList.remove("is-empty");
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
    this._root.setAttribute("data-mode", mode);
    this._renderSteps(items, current);
    this._syncPanels(current);
    this._prevBtn.hidden = mode === "stepper";
    this._nextBtn.hidden = mode === "stepper";
    this._prevBtn.disabled = current <= 1;
    this._nextBtn.disabled = current >= items.length;
  }
};
__publicField(BfWizard, "observedAttributes", ["mode", "step", "steps", "linear", "stepper"]);
customElements.define("bf-wizard", BfWizard);

// src/runtime/runtime.js
var BF_ID_PREFIX = "bf";
var BF_TRANSLATE_DEFAULT = "en";
var skeletonState = /* @__PURE__ */ new WeakMap();
function slugFromTagName(tagName) {
  return tagName.toLowerCase().replace(/^bf-/, "");
}
function ensureUniqueIdForElement(element, seenIds) {
  const existing = element.getAttribute("id");
  if (existing && !seenIds.has(existing)) {
    seenIds.add(existing);
    return existing;
  }
  const prefix = `${BF_ID_PREFIX}-${slugFromTagName(element.tagName)}`;
  let counter = 1;
  let nextId = `${prefix}-${counter}`;
  while (seenIds.has(nextId) || document.getElementById(nextId)) {
    counter += 1;
    nextId = `${prefix}-${counter}`;
  }
  if (existing && seenIds.has(existing)) {
    console.warn(`[bareframe] Duplicate id "${existing}" replaced with "${nextId}".`);
  }
  element.id = nextId;
  seenIds.add(nextId);
  return nextId;
}
function applyTestingAndI18nDefaults(element, seenIds) {
  const id = ensureUniqueIdForElement(element, seenIds);
  if (!element.hasAttribute("data-qa")) {
    element.setAttribute("data-qa", `test-${id}`);
  }
  if (!element.hasAttribute("data-translate")) {
    const translateLocale = document.documentElement.lang || BF_TRANSLATE_DEFAULT;
    element.setAttribute("data-translate", translateLocale);
  }
}
function applyDefaultsUnder(root, seenIds) {
  if (!(root instanceof Element)) {
    return;
  }
  if (root.tagName.toLowerCase().startsWith("bf-")) {
    applyTestingAndI18nDefaults(root, seenIds);
  }
  for (const element of root.querySelectorAll("*")) {
    if (element.tagName.toLowerCase().startsWith("bf-")) {
      applyTestingAndI18nDefaults(element, seenIds);
    }
  }
}
function parseTargetExpression(value) {
  const normalized = (value || "").trim();
  if (!normalized) {
    return { targetId: "", itemId: "" };
  }
  const [targetId, itemId] = normalized.split(":");
  return { targetId, itemId: itemId || "" };
}
function resolveTarget(value) {
  const { targetId, itemId } = parseTargetExpression(value);
  if (!targetId) {
    return { element: null, itemId: "" };
  }
  return { element: document.getElementById(targetId), itemId };
}
function openElementById(value) {
  const { element, itemId } = resolveTarget(value);
  if (!element) {
    return;
  }
  if (typeof element.openItem === "function" && itemId) {
    element.openItem(itemId);
    return;
  }
  if (typeof element.open === "function") {
    element.open();
    return;
  }
  element.setAttribute("open", "");
}
function closeElementById(value) {
  const { element, itemId } = resolveTarget(value);
  if (!element) {
    return;
  }
  if (typeof element.closeItem === "function" && itemId) {
    element.closeItem(itemId);
    return;
  }
  if (typeof element.close === "function") {
    element.close();
    return;
  }
  element.removeAttribute("open");
}
function toggleElementById(value) {
  const { element, itemId } = resolveTarget(value);
  if (!element) {
    return;
  }
  if (typeof element.toggleItem === "function" && itemId) {
    element.toggleItem(itemId);
    return;
  }
  if (typeof element.toggle === "function") {
    element.toggle();
    return;
  }
  if (element.hasAttribute("open")) {
    element.removeAttribute("open");
    return;
  }
  element.setAttribute("open", "");
}
function parseSkeletonDuration(value) {
  const raw = `${value ?? ""}`.trim();
  if (!raw) {
    return null;
  }
  if (/^-?\d*\.?\d+$/.test(raw)) {
    const ms = Number(raw);
    return Number.isFinite(ms) && ms > 0 ? ms : null;
  }
  if (raw.endsWith("ms")) {
    const ms = Number.parseFloat(raw.slice(0, -2));
    return Number.isFinite(ms) && ms > 0 ? ms : null;
  }
  if (raw.endsWith("s")) {
    const ms = Number.parseFloat(raw.slice(0, -1)) * 1e3;
    return Number.isFinite(ms) && ms > 0 ? ms : null;
  }
  return null;
}
function skeletonVariantForElement(element, height) {
  const explicit = (element.getAttribute("skeleton-variant") || "").toLowerCase();
  if (explicit) {
    return explicit;
  }
  const tag = element.tagName.toLowerCase();
  if (tag.includes("image") || tag.includes("video") || tag.includes("canvas") || tag === "img" || tag === "video") {
    return "image";
  }
  if (element.querySelector("img,video,canvas,svg")) {
    return "image";
  }
  if (height >= 56) {
    return "image";
  }
  if (height >= 34) {
    return "button";
  }
  return "text";
}
function applySkeletonForElement(element) {
  if (!(element instanceof Element)) {
    return;
  }
  if (!element.hasAttribute("skeleton")) {
    return;
  }
  if (element.tagName.toLowerCase() === "bf-skeleton") {
    return;
  }
  if (skeletonState.has(element)) {
    return;
  }
  const computed = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const isInline = computed.display.startsWith("inline");
  const width = rect.width > 0 ? rect.width : null;
  const height = rect.height > 0 ? rect.height : null;
  const placeholder = document.createElement("bf-skeleton");
  const variant = skeletonVariantForElement(element, height || 0);
  if (variant) {
    placeholder.setAttribute("variant", variant);
  }
  if (width) {
    placeholder.setAttribute("width", `${Math.round(width)}`);
  } else if (isInline) {
    placeholder.setAttribute("width", "8rem");
  } else {
    placeholder.setAttribute("width", "100%");
  }
  if (height) {
    placeholder.setAttribute("height", `${Math.max(1, Math.round(height))}`);
  }
  if (isInline) {
    placeholder.style.display = "inline-block";
  }
  element.parentNode?.insertBefore(placeholder, element);
  const previousVisibility = element.style.visibility;
  const previousAriaBusy = element.getAttribute("aria-busy");
  element.style.visibility = "hidden";
  element.setAttribute("aria-busy", "true");
  const duration = parseSkeletonDuration(element.getAttribute("skeleton"));
  let timeoutId = null;
  if (duration) {
    timeoutId = window.setTimeout(() => {
      if (element.isConnected) {
        element.removeAttribute("skeleton");
      }
    }, duration);
  }
  skeletonState.set(element, {
    placeholder,
    timeoutId,
    previousVisibility,
    previousAriaBusy
  });
}
function clearSkeletonForElement(element) {
  const state = skeletonState.get(element);
  if (!state) {
    return;
  }
  if (state.timeoutId) {
    window.clearTimeout(state.timeoutId);
  }
  state.placeholder.remove();
  if (state.previousVisibility) {
    element.style.visibility = state.previousVisibility;
  } else {
    element.style.removeProperty("visibility");
  }
  if (state.previousAriaBusy == null) {
    element.removeAttribute("aria-busy");
  } else {
    element.setAttribute("aria-busy", state.previousAriaBusy);
  }
  skeletonState.delete(element);
}
function refreshSkeletonForElement(element) {
  clearSkeletonForElement(element);
  if (element.hasAttribute("skeleton")) {
    requestAnimationFrame(() => applySkeletonForElement(element));
  }
}
function refreshSkeletonUnder(root) {
  if (!(root instanceof Element)) {
    return;
  }
  if (root.hasAttribute("skeleton")) {
    refreshSkeletonForElement(root);
  }
  for (const element of root.querySelectorAll("[skeleton]")) {
    refreshSkeletonForElement(element);
  }
}
function clearSkeletonUnder(root) {
  if (!(root instanceof Element)) {
    return;
  }
  clearSkeletonForElement(root);
  for (const element of root.querySelectorAll("*")) {
    clearSkeletonForElement(element);
  }
}
function setupBareframeRuntime() {
  const seenIds = /* @__PURE__ */ new Set();
  applyDefaultsUnder(document.documentElement, seenIds);
  refreshSkeletonUnder(document.documentElement);
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          applyDefaultsUnder(node, seenIds);
          refreshSkeletonUnder(node);
        }
        for (const node of mutation.removedNodes) {
          clearSkeletonUnder(node);
        }
      }
      if (mutation.type === "attributes" && mutation.target instanceof Element && mutation.attributeName === "skeleton") {
        refreshSkeletonForElement(mutation.target);
      }
    }
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["skeleton"]
  });
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) {
      return;
    }
    const openTrigger = target.closest("[bf-open]");
    if (openTrigger) {
      openElementById(openTrigger.getAttribute("bf-open"));
      return;
    }
    const closeTrigger = target.closest("[bf-close]");
    if (closeTrigger) {
      closeElementById(closeTrigger.getAttribute("bf-close"));
      return;
    }
    const toggleTrigger = target.closest("[bf-toggle]");
    if (toggleTrigger) {
      toggleElementById(toggleTrigger.getAttribute("bf-toggle"));
    }
  });
  window.bareframe = window.bareframe || {};
  window.bareframe.openById = openElementById;
  window.bareframe.closeById = closeElementById;
  window.bareframe.toggleById = toggleElementById;
}

// src/index.js
setupBareframeRuntime();
