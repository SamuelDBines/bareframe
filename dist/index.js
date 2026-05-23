var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

// dist/_stencil/p-DAXdczoz.js
var NAMESPACE = "bareframe";
var BUILD = (
  /* bareframe */
  { hotModuleReplacement: false, hydratedSelectorName: "hydrated", lazyLoad: false, state: true, updatable: true }
);
var SVG_NS = "http://www.w3.org/2000/svg";
var HTML_NS = "http://www.w3.org/1999/xhtml";
function getPropertyDescriptor(obj, memberName, getOnly) {
  const stopAt = typeof HTMLElement !== "undefined" ? HTMLElement.prototype : null;
  while (obj && obj !== stopAt) {
    const desc = Object.getOwnPropertyDescriptor(obj, memberName);
    if (desc && (!getOnly || desc.get)) return desc;
    obj = Object.getPrototypeOf(obj);
  }
  return void 0;
}
var reWireGetterSetter = (instance, hostRef) => {
  var _a;
  const cmpMeta = hostRef.$cmpMeta$;
  const members = Object.entries((_a = cmpMeta.$members$) != null ? _a : {});
  members.map(([memberName, [memberFlags]]) => {
    if (memberFlags & 31 || memberFlags & 32) {
      const ogValue = instance[memberName];
      const ogDescriptor = getPropertyDescriptor(Object.getPrototypeOf(instance), memberName, true) || Object.getOwnPropertyDescriptor(instance, memberName);
      if (ogDescriptor) {
        Object.defineProperty(instance, memberName, {
          get() {
            return ogDescriptor.get.call(this);
          },
          set(newValue) {
            ogDescriptor.set.call(this, newValue);
          },
          configurable: true,
          enumerable: true
        });
      }
      if (hostRef.$instanceValues$.has(memberName)) {
        instance[memberName] = hostRef.$instanceValues$.get(memberName);
      } else if (ogValue !== void 0) {
        instance[memberName] = ogValue;
      }
    }
  });
};
var getHostRef = (ref) => {
  if (ref.__stencil__getHostRef) {
    return ref.__stencil__getHostRef();
  }
  return void 0;
};
var registerHost = (hostElement, cmpMeta) => {
  const hostRef = {
    $flags$: 0,
    $hostElement$: hostElement,
    $cmpMeta$: cmpMeta,
    $instanceValues$: /* @__PURE__ */ new Map(),
    $serializerValues$: /* @__PURE__ */ new Map()
  };
  {
    hostRef.$onReadyPromise$ = new Promise((r) => hostRef.$onReadyResolve$ = r);
    hostElement["s-p"] = [];
    hostElement["s-rc"] = [];
  }
  const ref = hostRef;
  hostElement.__stencil__getHostRef = () => ref;
  if (cmpMeta.$flags$ & 512 && BUILD.state) {
    reWireGetterSetter(hostElement, hostRef);
  }
  return ref;
};
var isMemberInElement = (elm, memberName) => memberName in elm;
var consoleError = (e, el) => (0, console.error)(e, el);
var styles = /* @__PURE__ */ new Map();
var SLOT_FB_CSS = "slot-fb{display:contents}slot-fb[hidden]{display:none}";
var win = typeof window !== "undefined" ? window : {};
var H = win.HTMLElement || class {
};
var plt = {
  $flags$: 0,
  $resourcesUrl$: "",
  jmp: (h2) => h2(),
  raf: (h2) => requestAnimationFrame(h2),
  ael: (el, eventName, listener, opts) => el.addEventListener(eventName, listener, opts),
  rel: (el, eventName, listener, opts) => el.removeEventListener(eventName, listener, opts),
  ce: (eventName, opts) => new CustomEvent(eventName, opts)
};
var promiseResolve = (v) => Promise.resolve(v);
var supportsConstructableStylesheets = /* @__PURE__ */ (() => {
  try {
    if (!win.document.adoptedStyleSheets) {
      return false;
    }
    new CSSStyleSheet();
    return typeof new CSSStyleSheet().replaceSync === "function";
  } catch (e) {
  }
  return false;
})();
var supportsMutableAdoptedStyleSheets = supportsConstructableStylesheets ? /* @__PURE__ */ (() => !!win.document && Object.getOwnPropertyDescriptor(win.document.adoptedStyleSheets, "length").writable)() : false;
var queuePending = false;
var queueDomReads = [];
var queueDomWrites = [];
var queueTask = (queue, write) => (cb) => {
  queue.push(cb);
  if (!queuePending) {
    queuePending = true;
    if (write && plt.$flags$ & 4) {
      nextTick(flush);
    } else {
      plt.raf(flush);
    }
  }
};
var consume = (queue) => {
  for (let i2 = 0; i2 < queue.length; i2++) {
    try {
      queue[i2](performance.now());
    } catch (e) {
      consoleError(e);
    }
  }
  queue.length = 0;
};
var flush = () => {
  consume(queueDomReads);
  {
    consume(queueDomWrites);
    if (queuePending = queueDomReads.length > 0) {
      plt.raf(flush);
    }
  }
};
var nextTick = (cb) => promiseResolve().then(cb);
var writeTask = /* @__PURE__ */ queueTask(queueDomWrites, true);
function createStyleSheetIfNeededAndSupported(styles2) {
  return void 0;
}
var globalStyleSheet;
function createShadowRoot(cmpMeta) {
  var _a;
  const opts = { mode: "open" };
  const shadowRoot = this.attachShadow(opts);
  if (globalStyleSheet === void 0) globalStyleSheet = (_a = createStyleSheetIfNeededAndSupported()) != null ? _a : null;
  if (globalStyleSheet) {
    if (supportsMutableAdoptedStyleSheets) {
      shadowRoot.adoptedStyleSheets.push(globalStyleSheet);
    } else {
      shadowRoot.adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets, globalStyleSheet];
    }
  }
}
var createTime = (fnName, tagName = "") => {
  {
    return () => {
      return;
    };
  }
};
function queryNonceMetaTagContent(doc) {
  var _a, _b, _c;
  return (_c = (_b = (_a = doc.head) == null ? void 0 : _a.querySelector('meta[name="csp-nonce"]')) == null ? void 0 : _b.getAttribute("content")) != null ? _c : void 0;
}
var rootAppliedStyles = /* @__PURE__ */ new WeakMap();
var registerStyle = (scopeId2, cssText, allowCS) => {
  let style = styles.get(scopeId2);
  if (supportsConstructableStylesheets && allowCS) {
    style = style || new CSSStyleSheet();
    if (typeof style === "string") {
      style = cssText;
    } else {
      style.replaceSync(cssText);
    }
  } else {
    style = cssText;
  }
  styles.set(scopeId2, style);
};
var addStyle = (styleContainerNode, cmpMeta, mode) => {
  var _a, _b, _c;
  const scopeId2 = getScopeId(cmpMeta);
  const style = styles.get(scopeId2);
  if (!win.document) {
    return scopeId2;
  }
  styleContainerNode = styleContainerNode.nodeType === 11 ? styleContainerNode : win.document;
  if (style) {
    if (typeof style === "string") {
      styleContainerNode = styleContainerNode.head || styleContainerNode;
      let appliedStyles = rootAppliedStyles.get(styleContainerNode);
      let styleElm;
      if (!appliedStyles) {
        rootAppliedStyles.set(styleContainerNode, appliedStyles = /* @__PURE__ */ new Set());
      }
      if (!appliedStyles.has(scopeId2)) {
        styleElm = win.document.createElement("style");
        styleElm.textContent = style;
        const nonce = (_a = plt.$nonce$) != null ? _a : queryNonceMetaTagContent(win.document);
        if (nonce != null) {
          styleElm.setAttribute("nonce", nonce);
        }
        if (!(cmpMeta.$flags$ & 1)) {
          if (styleContainerNode.nodeName === "HEAD") {
            const preconnectLinks = styleContainerNode.querySelectorAll("link[rel=preconnect]");
            const referenceNode2 = preconnectLinks.length > 0 ? preconnectLinks[preconnectLinks.length - 1].nextSibling : styleContainerNode.querySelector("style");
            styleContainerNode.insertBefore(
              styleElm,
              (referenceNode2 == null ? void 0 : referenceNode2.parentNode) === styleContainerNode ? referenceNode2 : null
            );
          } else if ("host" in styleContainerNode) {
            if (supportsConstructableStylesheets) {
              const currentWindow = (_b = styleContainerNode.defaultView) != null ? _b : styleContainerNode.ownerDocument.defaultView;
              const stylesheet = new currentWindow.CSSStyleSheet();
              stylesheet.replaceSync(style);
              if (supportsMutableAdoptedStyleSheets) {
                styleContainerNode.adoptedStyleSheets.unshift(stylesheet);
              } else {
                styleContainerNode.adoptedStyleSheets = [stylesheet, ...styleContainerNode.adoptedStyleSheets];
              }
            } else {
              const existingStyleContainer = styleContainerNode.querySelector("style");
              if (existingStyleContainer && true) {
                existingStyleContainer.textContent = style + existingStyleContainer.textContent;
              } else {
                styleContainerNode.prepend(styleElm);
              }
            }
          } else {
            styleContainerNode.append(styleElm);
          }
        }
        if (cmpMeta.$flags$ & 1) {
          styleContainerNode.insertBefore(styleElm, null);
        }
        if (cmpMeta.$flags$ & 4) {
          styleElm.textContent += SLOT_FB_CSS;
        }
        if (appliedStyles) {
          appliedStyles.add(scopeId2);
        }
      }
    } else {
      let appliedStyles = rootAppliedStyles.get(styleContainerNode);
      if (!appliedStyles) {
        rootAppliedStyles.set(styleContainerNode, appliedStyles = /* @__PURE__ */ new Set());
      }
      if (!appliedStyles.has(scopeId2)) {
        const currentWindow = (_c = styleContainerNode.defaultView) != null ? _c : styleContainerNode.ownerDocument.defaultView;
        let stylesheet;
        if (style.constructor === currentWindow.CSSStyleSheet) {
          stylesheet = style;
        } else {
          stylesheet = new currentWindow.CSSStyleSheet();
          for (let i2 = 0; i2 < style.cssRules.length; i2++) {
            stylesheet.insertRule(style.cssRules[i2].cssText, i2);
          }
        }
        if (supportsMutableAdoptedStyleSheets) {
          styleContainerNode.adoptedStyleSheets.push(stylesheet);
        } else {
          styleContainerNode.adoptedStyleSheets = [...styleContainerNode.adoptedStyleSheets, stylesheet];
        }
        appliedStyles.add(scopeId2);
      }
    }
  }
  return scopeId2;
};
var attachStyles = (hostRef) => {
  const cmpMeta = hostRef.$cmpMeta$;
  const elm = hostRef.$hostElement$;
  const flags = cmpMeta.$flags$;
  const endAttachStyles = createTime("attachStyles", cmpMeta.$tagName$);
  const scopeId2 = addStyle(
    elm.shadowRoot ? elm.shadowRoot : elm.getRootNode(),
    cmpMeta
  );
  if (flags & 10) {
    elm["s-sc"] = scopeId2;
    elm.classList.add(scopeId2 + "-h");
  }
  endAttachStyles();
};
var getScopeId = (cmp, mode) => "sc-" + cmp.$tagName$;
var isComplexType = (o) => {
  o = typeof o;
  return o === "object" || o === "function";
};
var h = (nodeName, vnodeData, ...children) => {
  if (typeof nodeName === "string") {
    nodeName = transformTag(nodeName);
  }
  let child = null;
  let key = null;
  let simple = false;
  let lastSimple = false;
  const vNodeChildren = [];
  const walk = (c) => {
    for (let i2 = 0; i2 < c.length; i2++) {
      child = c[i2];
      if (Array.isArray(child)) {
        walk(child);
      } else if (child != null && typeof child !== "boolean") {
        if (simple = typeof nodeName !== "function" && !isComplexType(child)) {
          child = String(child);
        }
        if (simple && lastSimple) {
          vNodeChildren[vNodeChildren.length - 1].$text$ += child;
        } else {
          vNodeChildren.push(simple ? newVNode(null, child) : child);
        }
        lastSimple = simple;
      }
    }
  };
  walk(children);
  if (vnodeData) {
    if (vnodeData.key) {
      key = vnodeData.key;
    }
    {
      const classData = vnodeData.className || vnodeData.class;
      if (classData) {
        vnodeData.class = typeof classData !== "object" ? classData : Object.keys(classData).filter((k) => classData[k]).join(" ");
      }
    }
  }
  const vnode = newVNode(nodeName, null);
  vnode.$attrs$ = vnodeData;
  if (vNodeChildren.length > 0) {
    vnode.$children$ = vNodeChildren;
  }
  {
    vnode.$key$ = key;
  }
  return vnode;
};
var newVNode = (tag, text) => {
  const vnode = {
    $flags$: 0,
    $tag$: tag,
    // Normalize undefined to null to prevent rendering "undefined" as text
    $text$: text != null ? text : null,
    $elm$: null,
    $children$: null
  };
  {
    vnode.$attrs$ = null;
  }
  {
    vnode.$key$ = null;
  }
  return vnode;
};
var Host = {};
var isHost = (node) => node && node.$tag$ === Host;
var normalizeWatchers = (raw) => {
  if (!raw) return void 0;
  const keys = Object.keys(raw);
  if (keys.length === 0) return void 0;
  let hasLegacy = false;
  for (const propName of keys) {
    if (hasLegacy) break;
    for (const h2 of raw[propName]) {
      if (typeof h2 === "string") {
        hasLegacy = true;
        break;
      }
    }
  }
  if (!hasLegacy) return raw;
  const out = {};
  for (const propName of keys) {
    out[propName] = raw[propName].map(
      (h2) => typeof h2 === "string" ? { [h2]: 0 } : h2
    );
  }
  return out;
};
var parsePropertyValue = (propValue, propType, isFormAssociated) => {
  if (propValue != null && !isComplexType(propValue)) {
    if (propType & 4) {
      {
        return propValue === "false" ? false : propValue === "" || !!propValue;
      }
    }
    if (propType & 1) {
      return String(propValue);
    }
    return propValue;
  }
  return propValue;
};
var getElement = (ref) => {
  return ref;
};
var createEvent = (ref, name, flags) => {
  const elm = getElement(ref);
  return {
    emit: (detail) => {
      return emitEvent(elm, name, {
        bubbles: true,
        composed: true,
        cancelable: true,
        detail
      });
    }
  };
};
var emitEvent = (elm, name, opts) => {
  const ev = plt.ce(name, opts);
  elm.dispatchEvent(ev);
  return ev;
};
var setAccessor = (elm, memberName, oldValue, newValue, isSvg, flags, initialRender) => {
  if (oldValue === newValue) {
    return;
  }
  let isProp = isMemberInElement(elm, memberName);
  let ln = memberName.toLowerCase();
  if (memberName === "class") {
    const classList = elm.classList;
    const oldClasses = parseClassList(oldValue);
    let newClasses = parseClassList(newValue);
    {
      classList.remove(...oldClasses.filter((c) => c && !newClasses.includes(c)));
      classList.add(...newClasses.filter((c) => c && !oldClasses.includes(c)));
    }
  } else if (memberName === "key") ;
  else if (memberName === "ref") {
    if (newValue) {
      queueRefAttachment(newValue, elm);
    }
  } else if (!elm.__lookupSetter__(memberName) && memberName[0] === "o" && memberName[1] === "n") {
    if (memberName[2] === "-") {
      memberName = memberName.slice(3);
    } else if (isMemberInElement(win, ln)) {
      memberName = ln.slice(2);
    } else {
      memberName = ln[2] + memberName.slice(3);
    }
    if (oldValue || newValue) {
      const capture = memberName.endsWith(CAPTURE_EVENT_SUFFIX);
      memberName = memberName.replace(CAPTURE_EVENT_REGEX, "");
      if (oldValue) {
        plt.rel(elm, memberName, oldValue, capture);
      }
      if (newValue) {
        plt.ael(elm, memberName, newValue, capture);
      }
    }
  } else if (memberName[0] === "a" && memberName.startsWith("attr:")) {
    const propName = memberName.slice(5);
    let attrName;
    {
      const hostRef = getHostRef(elm);
      if (hostRef && hostRef.$cmpMeta$ && hostRef.$cmpMeta$.$members$) {
        const memberMeta = hostRef.$cmpMeta$.$members$[propName];
        if (memberMeta && memberMeta[1]) {
          attrName = memberMeta[1];
        }
      }
    }
    if (!attrName) {
      attrName = propName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
    }
    if (newValue == null || newValue === false) {
      if (newValue !== false || elm.getAttribute(attrName) === "") {
        elm.removeAttribute(attrName);
      }
    } else {
      elm.setAttribute(attrName, newValue === true ? "" : newValue);
    }
    return;
  } else if (memberName[0] === "p" && memberName.startsWith("prop:")) {
    const propName = memberName.slice(5);
    try {
      elm[propName] = newValue;
    } catch (e) {
    }
    return;
  } else {
    const isComplex = isComplexType(newValue);
    if ((isProp || isComplex && newValue !== null) && !isSvg) {
      try {
        if (!elm.tagName.includes("-")) {
          const n = newValue == null ? "" : newValue;
          if (memberName === "list") {
            isProp = false;
          } else if (oldValue == null || elm[memberName] !== n) {
            if (typeof elm.__lookupSetter__(memberName) === "function") {
              elm[memberName] = n;
            } else {
              elm.setAttribute(memberName, n);
            }
          }
        } else if (elm[memberName] !== newValue) {
          elm[memberName] = newValue;
        }
      } catch (e) {
      }
    }
    if (newValue == null || newValue === false) {
      if (newValue !== false || elm.getAttribute(memberName) === "") {
        {
          elm.removeAttribute(memberName);
        }
      }
    } else if ((!isProp || flags & 4 || isSvg) && !isComplex && elm.nodeType === 1) {
      newValue = newValue === true ? "" : newValue;
      {
        elm.setAttribute(memberName, newValue);
      }
    }
  }
};
var parseClassListRegex = /\s/;
var parseClassList = (value) => {
  if (typeof value === "object" && value && "baseVal" in value) {
    value = value.baseVal;
  }
  if (!value || typeof value !== "string") {
    return [];
  }
  return value.split(parseClassListRegex);
};
var CAPTURE_EVENT_SUFFIX = "Capture";
var CAPTURE_EVENT_REGEX = new RegExp(CAPTURE_EVENT_SUFFIX + "$");
var updateElement = (oldVnode, newVnode, isSvgMode2, isInitialRender) => {
  const elm = newVnode.$elm$.nodeType === 11 && newVnode.$elm$.host ? newVnode.$elm$.host : newVnode.$elm$;
  const oldVnodeAttrs = oldVnode && oldVnode.$attrs$ || {};
  const newVnodeAttrs = newVnode.$attrs$ || {};
  {
    for (const memberName of sortedAttrNames(Object.keys(oldVnodeAttrs))) {
      if (!(memberName in newVnodeAttrs)) {
        setAccessor(
          elm,
          memberName,
          oldVnodeAttrs[memberName],
          void 0,
          isSvgMode2,
          newVnode.$flags$
        );
      }
    }
  }
  for (const memberName of sortedAttrNames(Object.keys(newVnodeAttrs))) {
    setAccessor(
      elm,
      memberName,
      oldVnodeAttrs[memberName],
      newVnodeAttrs[memberName],
      isSvgMode2,
      newVnode.$flags$
    );
  }
};
function sortedAttrNames(attrNames) {
  return attrNames.includes("ref") ? (
    // we need to sort these to ensure that `'ref'` is the last attr
    [...attrNames.filter((attr) => attr !== "ref"), "ref"]
  ) : (
    // no need to sort, return the original array
    attrNames
  );
}
var hostTagName;
var useNativeShadowDom = false;
var isSvgMode = false;
var refCallbacksToRemove = [];
var refCallbacksToAttach = [];
var createElm = (oldParentVNode, newParentVNode, childIndex) => {
  const newVNode2 = newParentVNode.$children$[childIndex];
  let i2 = 0;
  let elm;
  let childNode;
  if (newVNode2.$text$ != null) {
    elm = newVNode2.$elm$ = win.document.createTextNode(newVNode2.$text$);
  } else {
    if (!isSvgMode) {
      isSvgMode = newVNode2.$tag$ === "svg";
    }
    if (!win.document) {
      throw new Error("You are trying to render a Stencil component in an environment that doesn't support the DOM.");
    }
    elm = newVNode2.$elm$ = win.document.createElementNS(
      isSvgMode ? SVG_NS : HTML_NS,
      newVNode2.$tag$
    );
    if (isSvgMode && newVNode2.$tag$ === "foreignObject") {
      isSvgMode = false;
    }
    {
      updateElement(null, newVNode2, isSvgMode);
    }
    if (newVNode2.$children$) {
      const appendTarget = newVNode2.$tag$ === "template" ? elm.content : elm;
      for (i2 = 0; i2 < newVNode2.$children$.length; ++i2) {
        childNode = createElm(oldParentVNode, newVNode2, i2);
        if (childNode) {
          appendTarget.appendChild(childNode);
        }
      }
    }
    {
      if (newVNode2.$tag$ === "svg") {
        isSvgMode = false;
      } else if (elm.tagName === "foreignObject") {
        isSvgMode = true;
      }
    }
  }
  elm["s-hn"] = hostTagName;
  return elm;
};
var relocateToHostRoot = (parentElm) => {
  plt.$flags$ |= 1;
  const host = parentElm.closest(hostTagName.toLowerCase());
  if (host != null) {
    const contentRefNode = Array.from(host.__childNodes || host.childNodes).find(
      (ref) => ref["s-cr"]
    );
    const childNodeArray = Array.from(
      parentElm.__childNodes || parentElm.childNodes
    );
    for (const childNode of contentRefNode ? childNodeArray.reverse() : childNodeArray) {
      if (childNode["s-sh"] != null) {
        insertBefore(host, childNode, contentRefNode != null ? contentRefNode : null);
        childNode["s-sh"] = void 0;
      }
    }
  }
  plt.$flags$ &= -2;
};
var addVnodes = (parentElm, before, parentVNode, vnodes, startIdx, endIdx) => {
  let containerElm = parentElm;
  let childNode;
  if (containerElm.shadowRoot && containerElm.tagName === hostTagName) {
    containerElm = containerElm.shadowRoot;
  }
  if (parentVNode.$tag$ === "template") {
    containerElm = containerElm.content;
  }
  for (; startIdx <= endIdx; ++startIdx) {
    if (vnodes[startIdx]) {
      childNode = createElm(null, parentVNode, startIdx);
      if (childNode) {
        vnodes[startIdx].$elm$ = childNode;
        insertBefore(containerElm, childNode, before);
      }
    }
  }
};
var removeVnodes = (vnodes, startIdx, endIdx) => {
  for (let index = startIdx; index <= endIdx; ++index) {
    const vnode = vnodes[index];
    if (vnode) {
      const elm = vnode.$elm$;
      nullifyVNodeRefs(vnode);
      if (elm) {
        elm.remove();
      }
    }
  }
};
var updateChildren = (parentElm, oldCh, newVNode2, newCh, isInitialRender = false) => {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let idxInOld = 0;
  let i2 = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let node;
  let elmToMove;
  const containerElm = newVNode2.$tag$ === "template" ? parentElm.content : parentElm;
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx];
    } else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx];
    } else if (isSameVnode(oldStartVnode, newStartVnode, isInitialRender)) {
      patch(oldStartVnode, newStartVnode, isInitialRender);
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (isSameVnode(oldEndVnode, newEndVnode, isInitialRender)) {
      patch(oldEndVnode, newEndVnode, isInitialRender);
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (isSameVnode(oldStartVnode, newEndVnode, isInitialRender)) {
      patch(oldStartVnode, newEndVnode, isInitialRender);
      insertBefore(containerElm, oldStartVnode.$elm$, oldEndVnode.$elm$.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (isSameVnode(oldEndVnode, newStartVnode, isInitialRender)) {
      patch(oldEndVnode, newStartVnode, isInitialRender);
      insertBefore(containerElm, oldEndVnode.$elm$, oldStartVnode.$elm$);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      idxInOld = -1;
      {
        for (i2 = oldStartIdx; i2 <= oldEndIdx; ++i2) {
          if (oldCh[i2] && oldCh[i2].$key$ !== null && oldCh[i2].$key$ === newStartVnode.$key$) {
            idxInOld = i2;
            break;
          }
        }
      }
      if (idxInOld >= 0) {
        elmToMove = oldCh[idxInOld];
        if (elmToMove.$tag$ !== newStartVnode.$tag$) {
          node = createElm(oldCh && oldCh[newStartIdx], newVNode2, idxInOld);
        } else {
          patch(elmToMove, newStartVnode, isInitialRender);
          oldCh[idxInOld] = void 0;
          node = elmToMove.$elm$;
        }
        newStartVnode = newCh[++newStartIdx];
      } else {
        node = createElm(oldCh && oldCh[newStartIdx], newVNode2, newStartIdx);
        newStartVnode = newCh[++newStartIdx];
      }
      if (node) {
        {
          insertBefore(oldStartVnode.$elm$.parentNode, node, oldStartVnode.$elm$);
        }
      }
    }
  }
  if (oldStartIdx > oldEndIdx) {
    addVnodes(
      parentElm,
      newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].$elm$,
      newVNode2,
      newCh,
      newStartIdx,
      newEndIdx
    );
  } else if (newStartIdx > newEndIdx) {
    removeVnodes(oldCh, oldStartIdx, oldEndIdx);
  }
};
var isSameVnode = (leftVNode, rightVNode, isInitialRender = false) => {
  if (leftVNode.$tag$ === rightVNode.$tag$) {
    if (!isInitialRender) {
      return leftVNode.$key$ === rightVNode.$key$;
    }
    if (isInitialRender && !leftVNode.$key$ && rightVNode.$key$) {
      leftVNode.$key$ = rightVNode.$key$;
    }
    return true;
  }
  return false;
};
var patch = (oldVNode, newVNode2, isInitialRender = false) => {
  const elm = newVNode2.$elm$ = oldVNode.$elm$;
  const oldChildren = oldVNode.$children$;
  const newChildren = newVNode2.$children$;
  const tag = newVNode2.$tag$;
  const text = newVNode2.$text$;
  if (text == null) {
    {
      isSvgMode = tag === "svg" ? true : tag === "foreignObject" ? false : isSvgMode;
    }
    {
      if (tag === "slot" && !useNativeShadowDom) {
        if (oldVNode.$name$ !== newVNode2.$name$) {
          newVNode2.$elm$["s-sn"] = newVNode2.$name$ || "";
          relocateToHostRoot(newVNode2.$elm$.parentElement);
        }
      }
      updateElement(oldVNode, newVNode2, isSvgMode);
    }
    if (oldChildren !== null && newChildren !== null) {
      updateChildren(elm, oldChildren, newVNode2, newChildren, isInitialRender);
    } else if (newChildren !== null) {
      if (oldVNode.$text$ !== null) {
        elm.textContent = "";
      }
      addVnodes(elm, null, newVNode2, newChildren, 0, newChildren.length - 1);
    } else if (
      // don't do this on initial render as it can cause non-hydrated content to be removed
      !isInitialRender && BUILD.updatable && oldChildren !== null
    ) {
      removeVnodes(oldChildren, 0, oldChildren.length - 1);
    } else ;
    if (isSvgMode && tag === "svg") {
      isSvgMode = false;
    }
  } else if (oldVNode.$text$ !== text) {
    elm.data = text;
  }
};
var nullifyVNodeRefs = (vNode) => {
  {
    if (vNode.$attrs$ && vNode.$attrs$.ref) {
      refCallbacksToRemove.push(() => vNode.$attrs$.ref(null));
    }
    vNode.$children$ && vNode.$children$.map(nullifyVNodeRefs);
  }
};
var queueRefAttachment = (refCallback, elm) => {
  {
    refCallbacksToAttach.push(() => refCallback(elm));
  }
};
var flushQueuedRefCallbacks = () => {
  {
    refCallbacksToRemove.forEach((cb) => cb());
    refCallbacksToRemove.length = 0;
    refCallbacksToAttach.forEach((cb) => cb());
    refCallbacksToAttach.length = 0;
  }
};
var insertBefore = (parent, newNode, reference, isInitialLoad) => {
  if (parent.__insertBefore) {
    return parent.__insertBefore(newNode, reference);
  } else {
    return parent == null ? void 0 : parent.insertBefore(newNode, reference);
  }
};
var renderVdom = (hostRef, renderFnResults, isInitialLoad = false) => {
  const hostElm = hostRef.$hostElement$;
  const cmpMeta = hostRef.$cmpMeta$;
  const oldVNode = hostRef.$vnode$ || newVNode(null, null);
  const isHostElement = isHost(renderFnResults);
  const rootVnode = isHostElement ? renderFnResults : h(null, null, renderFnResults);
  hostTagName = hostElm.tagName;
  if (cmpMeta.$attrsToReflect$) {
    rootVnode.$attrs$ = rootVnode.$attrs$ || {};
    cmpMeta.$attrsToReflect$.forEach(([propName, attribute]) => {
      {
        rootVnode.$attrs$[attribute] = hostElm[propName];
      }
    });
  }
  if (isInitialLoad && rootVnode.$attrs$) {
    for (const key of Object.keys(rootVnode.$attrs$)) {
      if (hostElm.hasAttribute(key) && !["key", "ref", "style", "class"].includes(key)) {
        rootVnode.$attrs$[key] = hostElm[key];
      }
    }
  }
  rootVnode.$tag$ = null;
  rootVnode.$flags$ |= 4;
  hostRef.$vnode$ = rootVnode;
  rootVnode.$elm$ = oldVNode.$elm$ = hostElm.shadowRoot || hostElm;
  useNativeShadowDom = !!(cmpMeta.$flags$ & 1) && !(cmpMeta.$flags$ & 128);
  patch(oldVNode, rootVnode, isInitialLoad);
  flushQueuedRefCallbacks();
};
var attachToAncestor = (hostRef, ancestorComponent) => {
  if (ancestorComponent && !hostRef.$onRenderResolve$ && ancestorComponent["s-p"]) {
    const index = ancestorComponent["s-p"].push(
      new Promise(
        (r) => hostRef.$onRenderResolve$ = () => {
          ancestorComponent["s-p"].splice(index - 1, 1);
          r();
        }
      )
    );
  }
};
var scheduleUpdate = (hostRef, isInitialLoad) => {
  {
    hostRef.$flags$ |= 16;
  }
  if (hostRef.$flags$ & 4) {
    hostRef.$flags$ |= 512;
    return;
  }
  attachToAncestor(hostRef, hostRef.$ancestorComponent$);
  const dispatch = () => dispatchHooks(hostRef, isInitialLoad);
  if (isInitialLoad) {
    queueMicrotask(() => {
      dispatch();
    });
    return;
  }
  return writeTask(dispatch);
};
var dispatchHooks = (hostRef, isInitialLoad) => {
  const elm = hostRef.$hostElement$;
  const endSchedule = createTime("scheduleUpdate", hostRef.$cmpMeta$.$tagName$);
  const instance = elm;
  if (!instance) {
    throw new Error(
      `Can't render component <${elm.tagName.toLowerCase()} /> with invalid Stencil runtime! Make sure this imported component is compiled with a \`externalRuntime: true\` flag. For more information, please refer to https://stenciljs.com/docs/custom-elements#externalruntime`
    );
  }
  let maybePromise;
  if (isInitialLoad) {
    maybePromise = safeCall(instance, "componentWillLoad", void 0, elm);
  } else {
    maybePromise = safeCall(instance, "componentWillUpdate", void 0, elm);
  }
  maybePromise = enqueue(maybePromise, () => safeCall(instance, "componentWillRender", void 0, elm));
  endSchedule();
  return enqueue(maybePromise, () => updateComponent(hostRef, instance, isInitialLoad));
};
var enqueue = (maybePromise, fn) => isPromisey(maybePromise) ? maybePromise.then(fn).catch((err) => {
  console.error(err);
  fn();
}) : fn();
var isPromisey = (maybePromise) => maybePromise instanceof Promise || maybePromise && maybePromise.then && typeof maybePromise.then === "function";
var updateComponent = async (hostRef, instance, isInitialLoad) => {
  var _a;
  const elm = hostRef.$hostElement$;
  const endUpdate = createTime("update", hostRef.$cmpMeta$.$tagName$);
  const rc = elm["s-rc"];
  if (isInitialLoad) {
    attachStyles(hostRef);
  }
  const endRender = createTime("render", hostRef.$cmpMeta$.$tagName$);
  {
    callRender(hostRef, instance, elm, isInitialLoad);
  }
  if (rc) {
    rc.map((cb) => cb());
    elm["s-rc"] = void 0;
  }
  endRender();
  endUpdate();
  {
    const childrenPromises = (_a = elm["s-p"]) != null ? _a : [];
    const postUpdate = () => postUpdateComponent(hostRef);
    if (childrenPromises.length === 0) {
      postUpdate();
    } else {
      Promise.all(childrenPromises).then(postUpdate).catch(postUpdate);
      hostRef.$flags$ |= 4;
      childrenPromises.length = 0;
    }
  }
};
var callRender = (hostRef, instance, elm, isInitialLoad) => {
  try {
    instance = instance.render();
    {
      hostRef.$flags$ &= -17;
    }
    {
      hostRef.$flags$ |= 2;
    }
    {
      {
        {
          renderVdom(hostRef, instance, isInitialLoad);
        }
      }
    }
  } catch (e) {
    consoleError(e, hostRef.$hostElement$);
  }
  return null;
};
var postUpdateComponent = (hostRef) => {
  const tagName = hostRef.$cmpMeta$.$tagName$;
  const elm = hostRef.$hostElement$;
  const endPostUpdate = createTime("postUpdate", tagName);
  const instance = elm;
  const ancestorComponent = hostRef.$ancestorComponent$;
  safeCall(instance, "componentDidRender", void 0, elm);
  if (!(hostRef.$flags$ & 64)) {
    hostRef.$flags$ |= 64;
    {
      addHydratedFlag(elm);
    }
    safeCall(instance, "componentDidLoad", void 0, elm);
    endPostUpdate();
    {
      hostRef.$onReadyResolve$(elm);
      if (!ancestorComponent) {
        appDidLoad();
      }
    }
  } else {
    safeCall(instance, "componentDidUpdate", void 0, elm);
    endPostUpdate();
  }
  {
    if (hostRef.$onRenderResolve$) {
      hostRef.$onRenderResolve$();
      hostRef.$onRenderResolve$ = void 0;
    }
    if (hostRef.$flags$ & 512) {
      nextTick(() => scheduleUpdate(hostRef, false));
    }
    hostRef.$flags$ &= -517;
  }
};
var appDidLoad = (who) => {
  nextTick(() => emitEvent(win, "appload", { detail: { namespace: NAMESPACE } }));
};
var safeCall = (instance, method, arg, elm) => {
  if (instance && instance[method]) {
    try {
      return instance[method](arg);
    } catch (e) {
      consoleError(e, elm);
    }
  }
  return void 0;
};
var addHydratedFlag = (elm) => {
  var _a;
  return elm.classList.add((_a = BUILD.hydratedSelectorName) != null ? _a : "hydrated");
};
var getValue = (ref, propName) => getHostRef(ref).$instanceValues$.get(propName);
var setValue = (ref, propName, newVal, cmpMeta) => {
  const hostRef = getHostRef(ref);
  if (!hostRef) {
    return;
  }
  const elm = ref;
  const oldVal = hostRef.$instanceValues$.get(propName);
  const flags = hostRef.$flags$;
  const instance = elm;
  newVal = parsePropertyValue(
    newVal,
    cmpMeta.$members$[propName][0]
  );
  const areBothNaN = Number.isNaN(oldVal) && Number.isNaN(newVal);
  const didValueChange = newVal !== oldVal && !areBothNaN;
  if (didValueChange) {
    hostRef.$instanceValues$.set(propName, newVal);
    if (cmpMeta.$watchers$) {
      const watchMethods = cmpMeta.$watchers$[propName];
      if (watchMethods) {
        watchMethods.map((watcher) => {
          try {
            const [[watchMethodName, watcherFlags]] = Object.entries(watcher);
            if (flags & 128 || watcherFlags & 1) {
              if (!instance) {
                hostRef.$fetchedCbList$.push(() => {
                  hostRef.$lazyInstance$[watchMethodName](newVal, oldVal, propName);
                });
              } else {
                instance[watchMethodName](newVal, oldVal, propName);
              }
            }
          } catch (e) {
            consoleError(e, elm);
          }
        });
      }
    }
    if (flags & 2) {
      if (instance.componentShouldUpdate) {
        const shouldUpdate = instance.componentShouldUpdate(newVal, oldVal, propName);
        if (shouldUpdate === false && !(flags & 16)) {
          return;
        }
      }
      if (!(flags & 16)) {
        scheduleUpdate(hostRef, false);
      }
    }
  }
};
var proxyComponent = (Cstr, cmpMeta, flags) => {
  var _a, _b;
  const prototype = Cstr.prototype;
  {
    {
      if (Cstr.watchers && !cmpMeta.$watchers$) {
        cmpMeta.$watchers$ = normalizeWatchers(Cstr.watchers);
      }
      if (Cstr.deserializers && !cmpMeta.$deserializers$) {
        cmpMeta.$deserializers$ = Cstr.deserializers;
      }
      if (Cstr.serializers && !cmpMeta.$serializers$) {
        cmpMeta.$serializers$ = Cstr.serializers;
      }
    }
    const members = Object.entries((_a = cmpMeta.$members$) != null ? _a : {});
    members.map(([memberName, [memberFlags]]) => {
      if (memberFlags & 31 || memberFlags & 32) {
        const { get: origGetter, set: origSetter } = getPropertyDescriptor(prototype, memberName) || {};
        if (origGetter) cmpMeta.$members$[memberName][0] |= 2048;
        if (origSetter) cmpMeta.$members$[memberName][0] |= 4096;
        {
          Object.defineProperty(prototype, memberName, {
            get() {
              {
                return origGetter ? origGetter.apply(this) : getValue(this, memberName);
              }
            },
            configurable: true,
            enumerable: true
          });
        }
        Object.defineProperty(prototype, memberName, {
          set(newValue) {
            const ref = getHostRef(this);
            if (!ref) {
              return;
            }
            if (origSetter) {
              const currentValue = memberFlags & 32 ? this[memberName] : ref.$hostElement$[memberName];
              if (typeof currentValue === "undefined" && ref.$instanceValues$.get(memberName)) {
                newValue = ref.$instanceValues$.get(memberName);
              }
              origSetter.apply(this, [
                parsePropertyValue(
                  newValue,
                  memberFlags
                )
              ]);
              newValue = memberFlags & 32 ? this[memberName] : ref.$hostElement$[memberName];
              setValue(this, memberName, newValue, cmpMeta);
              return;
            }
            {
              setValue(this, memberName, newValue, cmpMeta);
              return;
            }
          }
        });
      }
    });
    {
      const attrNameToPropName = /* @__PURE__ */ new Map();
      prototype.attributeChangedCallback = function(attrName, oldValue, newValue) {
        plt.jmp(() => {
          var _a2;
          const propName = attrNameToPropName.get(attrName);
          const hostRef = getHostRef(this);
          if (this.hasOwnProperty(propName) && BUILD.lazyLoad) ;
          if (prototype.hasOwnProperty(propName) && typeof this[propName] === "number" && // cast type to number to avoid TS compiler issues
          this[propName] == newValue) {
            return;
          } else if (propName == null) {
            const flags2 = hostRef == null ? void 0 : hostRef.$flags$;
            if (hostRef && flags2 && !(flags2 & 8) && newValue !== oldValue) {
              const elm = this;
              const instance = elm;
              const entry = (_a2 = cmpMeta.$watchers$) == null ? void 0 : _a2[attrName];
              entry == null ? void 0 : entry.forEach((watcher) => {
                const [[watchMethodName, watcherFlags]] = Object.entries(watcher);
                if (instance[watchMethodName] != null && (flags2 & 128 || watcherFlags & 1)) {
                  instance[watchMethodName].call(instance, newValue, oldValue, attrName);
                }
              });
            }
            return;
          }
          const propFlags = members.find(([m]) => m === propName);
          const isBooleanTarget = propFlags && propFlags[1][0] & 4;
          const isSpuriousBooleanRemoval = isBooleanTarget && newValue === null && this[propName] === void 0;
          if (isBooleanTarget) {
            newValue = newValue === null || newValue === "false" ? false : true;
          }
          const propDesc = Object.getOwnPropertyDescriptor(prototype, propName);
          if (!isSpuriousBooleanRemoval && newValue != this[propName] && (!propDesc.get || !!propDesc.set)) {
            this[propName] = newValue;
          }
        });
      };
      Cstr.observedAttributes = Array.from(
        /* @__PURE__ */ new Set([
          ...Object.keys((_b = cmpMeta.$watchers$) != null ? _b : {}),
          ...members.filter(
            ([_, m]) => m[0] & 31
            /* HasAttribute */
          ).map(([propName, m]) => {
            var _a2;
            const attrName = m[1] || propName;
            attrNameToPropName.set(attrName, propName);
            if (m[0] & 512) {
              (_a2 = cmpMeta.$attrsToReflect$) == null ? void 0 : _a2.push([propName, attrName]);
            }
            return attrName;
          })
        ])
      );
    }
  }
  return Cstr;
};
var initializeComponent = async (elm, hostRef, cmpMeta, hmrVersionId) => {
  let Cstr;
  try {
    if ((hostRef.$flags$ & 32) === 0) {
      hostRef.$flags$ |= 32;
      {
        Cstr = elm.constructor;
        const cmpTag = elm.localName;
        customElements.whenDefined(cmpTag).then(
          () => hostRef.$flags$ |= 128
          /* isWatchReady */
        );
      }
      if (Cstr && Cstr.style) {
        let style;
        if (typeof Cstr.style === "string") {
          style = Cstr.style;
        }
        const scopeId2 = getScopeId(cmpMeta);
        if (!styles.has(scopeId2) || BUILD.hotModuleReplacement) {
          const endRegisterStyles = createTime("registerStyles", cmpMeta.$tagName$);
          registerStyle(scopeId2, style, !!(cmpMeta.$flags$ & 1));
          endRegisterStyles();
        }
      }
    }
    const ancestorComponent = hostRef.$ancestorComponent$;
    const schedule = () => scheduleUpdate(hostRef, true);
    if (ancestorComponent && ancestorComponent["s-rc"]) {
      ancestorComponent["s-rc"].push(schedule);
    } else {
      schedule();
    }
  } catch (e) {
    consoleError(e, elm);
    if (hostRef.$onRenderResolve$) {
      hostRef.$onRenderResolve$();
      hostRef.$onRenderResolve$ = void 0;
    }
    if (hostRef.$onReadyResolve$) {
      hostRef.$onReadyResolve$(elm);
    }
  }
};
var fireConnectedCallback = (instance, elm) => {
};
var connectedCallback = (elm) => {
  if ((plt.$flags$ & 1) === 0) {
    const hostRef = getHostRef(elm);
    if (!hostRef) {
      return;
    }
    const cmpMeta = hostRef.$cmpMeta$;
    const endConnected = createTime("connectedCallback", cmpMeta.$tagName$);
    if (!(hostRef.$flags$ & 1)) {
      hostRef.$flags$ |= 1;
      {
        let ancestorComponent = elm;
        while (ancestorComponent = ancestorComponent.parentNode || ancestorComponent.host) {
          if (ancestorComponent["s-p"]) {
            attachToAncestor(hostRef, hostRef.$ancestorComponent$ = ancestorComponent);
            break;
          }
        }
      }
      if (cmpMeta.$members$) {
        Object.entries(cmpMeta.$members$).map(([memberName, [memberFlags]]) => {
          if (memberFlags & 31 && Object.prototype.hasOwnProperty.call(elm, memberName)) {
            const value = elm[memberName];
            delete elm[memberName];
            elm[memberName] = value;
          }
        });
      }
      {
        initializeComponent(elm, hostRef, cmpMeta);
      }
    } else {
      if (hostRef == null ? void 0 : hostRef.$lazyInstance$) ;
      else if (hostRef == null ? void 0 : hostRef.$onReadyPromise$) {
        hostRef.$onReadyPromise$.then(() => fireConnectedCallback());
      }
    }
    endConnected();
  }
};
var disconnectedCallback = async (elm) => {
  if ((plt.$flags$ & 1) === 0) {
    getHostRef(elm);
  }
  if (rootAppliedStyles.has(elm)) {
    rootAppliedStyles.delete(elm);
  }
  if (elm.shadowRoot && rootAppliedStyles.has(elm.shadowRoot)) {
    rootAppliedStyles.delete(elm.shadowRoot);
  }
};
var proxyCustomElement = (Cstr, compactMeta) => {
  const cmpMeta = {
    $flags$: compactMeta[0],
    $tagName$: compactMeta[1]
  };
  try {
    {
      cmpMeta.$members$ = compactMeta[2];
    }
    {
      cmpMeta.$watchers$ = normalizeWatchers(Cstr.$watchers$);
      cmpMeta.$deserializers$ = Cstr.$deserializers$;
      cmpMeta.$serializers$ = Cstr.$serializers$;
    }
    {
      cmpMeta.$attrsToReflect$ = [];
    }
    const originalConnectedCallback = Cstr.prototype.connectedCallback;
    const originalDisconnectedCallback = Cstr.prototype.disconnectedCallback;
    Object.assign(Cstr.prototype, {
      __hasHostListenerAttached: false,
      __registerHost() {
        registerHost(this, cmpMeta);
      },
      connectedCallback() {
        if (!this.__hasHostListenerAttached) {
          const hostRef = getHostRef(this);
          if (!hostRef) {
            return;
          }
          this.__hasHostListenerAttached = true;
        }
        connectedCallback(this);
        if (originalConnectedCallback) {
          originalConnectedCallback.call(this);
        }
      },
      disconnectedCallback() {
        disconnectedCallback(this);
        if (originalDisconnectedCallback) {
          originalDisconnectedCallback.call(this);
        }
      },
      __attachShadow() {
        {
          if (!this.shadowRoot) {
            createShadowRoot.call(this, cmpMeta);
          } else {
            if (this.shadowRoot.mode !== "open") {
              throw new Error(
                `Unable to re-use existing shadow root for ${cmpMeta.$tagName$}! Mode is set to ${this.shadowRoot.mode} but Stencil only supports open shadow roots.`
              );
            }
          }
        }
      }
    });
    Object.defineProperty(Cstr, "is", {
      value: cmpMeta.$tagName$,
      configurable: true
    });
    return proxyComponent(Cstr, cmpMeta);
  } catch (e) {
    consoleError(e);
    return Cstr;
  }
};
function transformTag(tag) {
  return tag;
}

// dist/_stencil/bf-aatest.js
var bfAatestCss = () => `:host{display:block;background:red;padding:1rem}`;
var BfAaTest = /* @__PURE__ */ proxyCustomElement(class BfAaTest2 extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "14638b185a9751509679fceed2563d09add86cb2" }, h("div", { key: "b55dd0129ade4230a692250f9676bcf7381e2f91", class: "root", part: "root" }, h("slot", { key: "4ede909241b857612a78d032479f9d229f3c2138" }, "hello")));
  }
  static get style() {
    return bfAatestCss();
  }
}, [257, "bf-aatest"]);
function defineCustomElement$1() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-aatest"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-aatest":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfAaTest);
        }
        break;
    }
  });
}
var defineCustomElement = defineCustomElement$1;

// dist/_stencil/bf-accordion.js
var bfAccordionCss = () => `:host{--bf-accordion-font:var(--bf-theme-font-family, inherit);--bf-accordion-gap:var(--bf-theme-space-2, 0.5rem);--bf-accordion-radius:var(--bf-theme-radius-md, 8px);--bf-accordion-border-width:var(--bf-theme-border-width, 1px);--bf-accordion-border-style:var(--bf-theme-border-style, solid);--bf-accordion-border-color:var(--bf-theme-accordion-border-color, #cbd5e1);--bf-accordion-bg:var(--bf-theme-accordion-bg, #ffffff);--bf-accordion-color:var(--bf-theme-accordion-color, #0f172a);--bf-accordion-trigger-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-accordion-trigger-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-accordion-panel-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-accordion-panel-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-accordion-trigger-bg:var(--bf-theme-accordion-trigger-bg, #f8fafc);--bf-accordion-trigger-hover-bg:var(   --bf-theme-accordion-trigger-hover-bg,   #f1f5f9  );--bf-accordion-trigger-open-bg:var(   --bf-theme-accordion-trigger-open-bg,   #eff6ff  );--bf-accordion-trigger-color:var(--bf-theme-accordion-trigger-color, #0f172a);--bf-accordion-panel-bg:var(--bf-theme-accordion-panel-bg, #ffffff);--bf-accordion-focus-ring-width:var(--bf-theme-focus-ring-width, 2px);--bf-accordion-focus-ring-style:var(--bf-theme-focus-ring-style, solid);--bf-accordion-focus-ring-color:var(--bf-theme-focus-ring-color, #93c5fd);--bf-accordion-focus-ring-offset:var(--bf-theme-focus-ring-offset, 2px);--bf-accordion-chevron-color:var(--bf-theme-accordion-chevron-color, #475569);--bf-accordion-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-accordion-font);color:var(--bf-accordion-color)}.accordion{display:grid;gap:var(--bf-accordion-gap)}.accordion-item{border-width:var(--bf-accordion-border-width);border-style:var(--bf-accordion-border-style);border-color:var(--bf-accordion-border-color);border-radius:var(--bf-accordion-radius);background:var(--bf-accordion-bg);overflow:clip}.accordion-trigger{list-style:none;cursor:pointer;padding:var(--bf-accordion-trigger-padding-y)   var(--bf-accordion-trigger-padding-x);background:var(--bf-accordion-trigger-bg);color:var(--bf-accordion-trigger-color);transition:var(--bf-accordion-transition);display:flex;align-items:center;justify-content:space-between}.accordion-trigger::-webkit-details-marker{display:none}.accordion-trigger::after{content:'+';color:var(--bf-accordion-chevron-color);font-weight:700;line-height:1}.accordion-item[open]>.accordion-trigger::after{content:'-'}.accordion-trigger:hover{background:var(--bf-accordion-trigger-hover-bg)}.accordion-trigger:focus-visible{outline-width:var(--bf-accordion-focus-ring-width);outline-style:var(--bf-accordion-focus-ring-style);outline-color:var(--bf-accordion-focus-ring-color);outline-offset:calc(var(--bf-accordion-focus-ring-offset) * -1)}.accordion-item[open]>.accordion-trigger{background:var(--bf-accordion-trigger-open-bg)}.accordion-panel{padding:var(--bf-accordion-panel-padding-y) var(--bf-accordion-panel-padding-x);background:var(--bf-accordion-panel-bg);border-top-width:var(--bf-accordion-border-width);border-top-style:var(--bf-accordion-border-style);border-top-color:var(--bf-accordion-border-color)}.accordion-panel ::slotted(*){margin:0}`;
var BfAccordion$1 = /* @__PURE__ */ proxyCustomElement(class BfAccordion extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "accordion");
    __publicField(this, "detailsArr", []);
    __publicField(this, "itemIds", []);
    __publicField(this, "built", false);
    __publicField(this, "mo");
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.mo = new MutationObserver(() => {
      const v = this.el.getAttribute("active-id");
      if (v) {
        void this.openItem(v);
      }
    });
    this.mo.observe(this.el, {
      attributes: true,
      attributeFilter: ["active-id"]
    });
  }
  disconnectedCallback() {
    this.mo?.disconnect();
  }
  multiple() {
    return this.el.hasAttribute("multiple");
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
    this.el.dispatchEvent(new CustomEvent("bf-accordion-toggle", {
      bubbles: true,
      composed: true,
      detail: { index, id: itemId, title, open }
    }));
  }
  ensureItemId(item, index) {
    const explicit = item.getAttribute("id");
    if (explicit && !this.itemIds.includes(explicit)) {
      return explicit;
    }
    const hostId = this.el.id || this.el.getAttribute("id") || "bf-accordion";
    let counter = index + 1;
    let candidate = `${hostId}-item-${counter}`;
    while (this.itemIds.includes(candidate) || this.el.querySelector(`#${CSS.escape(candidate)}`) && this.el.querySelector(`#${CSS.escape(candidate)}`) !== item) {
      counter += 1;
      candidate = `${hostId}-item-${counter}`;
    }
    item.setAttribute("id", candidate);
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
    const container = sr.querySelector(".accordion");
    if (!(container instanceof H)) {
      return;
    }
    this.accordion = container;
    container.innerHTML = "";
    container.setAttribute("part", "accordion");
    const items = Array.from(this.el.children).filter((n) => n.nodeType === Node.ELEMENT_NODE);
    items.forEach((item, index) => {
      const title = item.getAttribute("title") || item.getAttribute("data-title") || `Section ${index + 1}`;
      const slotName = `item-${index + 1}`;
      const openByDefault = item.hasAttribute("open");
      const itemId = this.ensureItemId(item, index);
      item.setAttribute("slot", slotName);
      const details = document.createElement("details");
      details.className = "accordion-item";
      details.setAttribute("part", "item");
      details.dataset.itemId = itemId;
      details.open = openByDefault;
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
      this.detailsArr.push(details);
      this.itemIds.push(itemId);
      details.addEventListener("toggle", () => {
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
    const aid = this.el.getAttribute("active-id");
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
    return h(Host, { key: "2323d3adf5cd16a981c36d4d2c8f7d79c9cd5501" }, h("div", { key: "e15ba301e16213ef53f85fcee5e74a09ae9006ba", class: "accordion", part: "accordion" }));
  }
  static get style() {
    return bfAccordionCss();
  }
}, [257, "bf-accordion", {
  "openItem": [64],
  "closeItem": [64],
  "toggleItem": [64]
}]);
function defineCustomElement$12() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-accordion"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-accordion":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfAccordion$1);
        }
        break;
    }
  });
}
var defineCustomElement2 = defineCustomElement$12;

// dist/_stencil/bf-action-list.js
var bfActionListCss = () => `:host{--bf-action-list-font:var(--bf-theme-font-family, inherit);--bf-action-list-radius:var(--bf-theme-radius-md, 8px);--bf-action-list-border-width:var(--bf-theme-border-width, 1px);--bf-action-list-border-style:var(--bf-theme-border-style, solid);--bf-action-list-border-color:var(--bf-theme-action-list-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-action-list-bg:var(--bf-theme-action-list-bg, var(--bf-theme-surface-1, #ffffff));--bf-action-list-color:var(--bf-theme-action-list-color, var(--bf-theme-text-1, #0f172a));--bf-action-list-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-action-list-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-action-list-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-action-list-font);color:var(--bf-action-list-color)}.root{background:var(--bf-action-list-bg);color:var(--bf-action-list-color);border-width:var(--bf-action-list-border-width);border-style:var(--bf-action-list-border-style);border-color:var(--bf-action-list-border-color);border-radius:var(--bf-action-list-radius);padding:var(--bf-action-list-padding-y) var(--bf-action-list-padding-x);transition:var(--bf-action-list-transition)}`;
var BfActionList$1 = /* @__PURE__ */ proxyCustomElement(class BfActionList extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "2ee10f53b154d0a89d9a3f07ad9bf4116f6d714f" }, h("div", { key: "38c10c079a7f337cd8b008c68ef89e00085ca862", class: "root", part: "root" }, h("slot", { key: "4e3b8ec7875fe366eb496f55d1336768efedcf49" })));
  }
  static get style() {
    return bfActionListCss();
  }
}, [257, "bf-action-list"]);
function defineCustomElement$13() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-action-list"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-action-list":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfActionList$1);
        }
        break;
    }
  });
}
var defineCustomElement3 = defineCustomElement$13;

// dist/_stencil/bf-anchor.js
var bfAnchorCss = () => `:host{--bf-anchor-font:var(--bf-theme-font-family, inherit);--bf-anchor-radius:var(--bf-theme-radius-md, 8px);--bf-anchor-border-width:var(--bf-theme-border-width, 1px);--bf-anchor-border-style:var(--bf-theme-border-style, solid);--bf-anchor-border-color:var(--bf-theme-anchor-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-anchor-bg:var(--bf-theme-anchor-bg, var(--bf-theme-surface-1, #ffffff));--bf-anchor-color:var(--bf-theme-anchor-color, var(--bf-theme-text-1, #0f172a));--bf-anchor-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-anchor-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-anchor-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-anchor-font);color:var(--bf-anchor-color)}.root{background:var(--bf-anchor-bg);color:var(--bf-anchor-color);border-width:var(--bf-anchor-border-width);border-style:var(--bf-anchor-border-style);border-color:var(--bf-anchor-border-color);border-radius:var(--bf-anchor-radius);padding:var(--bf-anchor-padding-y) var(--bf-anchor-padding-x);transition:var(--bf-anchor-transition)}`;
var BfAnchor$1 = /* @__PURE__ */ proxyCustomElement(class BfAnchor extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "c8400b5833c7f5dc467d730d842330c4183c2e5e" }, h("div", { key: "8f236032d3a42c7c0f4ef68e2db5c80d6587f063", class: "root", part: "root" }, h("slot", { key: "ba9c2d7d76d6c9f0cbff63457cb63964a1716952" })));
  }
  static get style() {
    return bfAnchorCss();
  }
}, [257, "bf-anchor"]);
function defineCustomElement$14() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-anchor"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-anchor":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfAnchor$1);
        }
        break;
    }
  });
}
var defineCustomElement4 = defineCustomElement$14;

// dist/_stencil/bf-autocomplete.js
var bfAutocompleteCss = () => `:host{--bf-autocomplete-font:var(--bf-theme-font-family, inherit);--bf-autocomplete-radius:var(--bf-theme-radius-md, 8px);--bf-autocomplete-border-width:var(--bf-theme-border-width, 1px);--bf-autocomplete-border-style:var(--bf-theme-border-style, solid);--bf-autocomplete-border-color:var(   --bf-theme-autocomplete-border-color,   var(--bf-theme-border-1, #d1d5db)  );--bf-autocomplete-bg:var(   --bf-theme-autocomplete-bg,   var(--bf-theme-surface-1, #ffffff)  );--bf-autocomplete-color:var(   --bf-theme-autocomplete-color,   var(--bf-theme-text-1, #111827)  );--bf-autocomplete-placeholder:var(--bf-theme-text-2, #6b7280);--bf-autocomplete-focus:var(--bf-theme-focus-ring-color, #9ca3af);--bf-autocomplete-list-max-height:220px;--bf-autocomplete-item-hover-bg:var(--bf-theme-surface-2, #f3f4f6);--bf-autocomplete-item-active-bg:var(--bf-theme-surface-2, #e5e7eb);--bf-autocomplete-shadow:0 8px 26px rgba(15, 23, 42, 0.12);display:inline-block;width:min(100%, 420px);font:var(--bf-autocomplete-font)}.root{position:relative}.input{width:100%;box-sizing:border-box;font:inherit;color:var(--bf-autocomplete-color);background:var(--bf-autocomplete-bg);border-width:var(--bf-autocomplete-border-width);border-style:var(--bf-autocomplete-border-style);border-color:var(--bf-autocomplete-border-color);border-radius:var(--bf-autocomplete-radius);padding:0.62rem 0.8rem;outline:none}.input::placeholder{color:var(--bf-autocomplete-placeholder)}.input:focus-visible{border-color:var(--bf-autocomplete-focus);box-shadow:0 0 0 2px color-mix(in srgb, var(--bf-autocomplete-focus) 30%, transparent)}.list{position:absolute;top:calc(100% + 0.35rem);left:0;right:0;margin:0;padding:0.35rem;list-style:none;border-width:var(--bf-autocomplete-border-width);border-style:var(--bf-autocomplete-border-style);border-color:var(--bf-autocomplete-border-color);border-radius:calc(var(--bf-autocomplete-radius) - 2px);background:var(--bf-autocomplete-bg);max-height:var(--bf-autocomplete-list-max-height);overflow:auto;box-shadow:var(--bf-autocomplete-shadow);z-index:20}.item{padding:0.48rem 0.55rem;border-radius:calc(var(--bf-autocomplete-radius) - 4px);cursor:pointer}.item:hover{background:var(--bf-autocomplete-item-hover-bg)}.item.active{background:var(--bf-autocomplete-item-active-bg)}.item.empty{cursor:default;color:var(--bf-autocomplete-placeholder)}`;
var BfAutocomplete$1 = /* @__PURE__ */ proxyCustomElement(class BfAutocomplete extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "booted", false);
    __publicField(this, "listId", `ac-list-${Math.random().toString(36).slice(2, 10)}`);
    __publicField(this, "items", []);
    __publicField(this, "filtered", []);
    __publicField(this, "activeIndex", -1);
    __publicField(this, "listOpen", false);
    __publicField(this, "observer");
    __publicField(this, "inputEl");
    __publicField(this, "listEl");
    __publicField(this, "boundDocClick", (event) => this.onDocumentClick(event));
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    document.addEventListener("click", this.boundDocClick);
    this.observer = new MutationObserver(() => {
      this.refreshFromAttrs();
    });
    this.observer.observe(this.el, {
      attributes: true,
      attributeFilter: ["options", "options-csv"]
    });
  }
  disconnectedCallback() {
    document.removeEventListener("click", this.boundDocClick);
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
    this.inputEl = sr?.querySelector(".input") ?? void 0;
    this.listEl = sr?.querySelector(".list") ?? null;
  }
  setItemsFromAttributes() {
    const json = this.el.getAttribute("options");
    if (json) {
      try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          this.items = parsed.map((item) => String(item));
          return;
        }
      } catch {
      }
    }
    const csv = this.el.getAttribute("options-csv");
    if (csv) {
      this.items = csv.split(",").map((part) => part.trim()).filter(Boolean);
      return;
    }
    this.items = [
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
  filter(query) {
    const lower = query.trim().toLowerCase();
    if (!lower) {
      this.filtered = [...this.items];
    } else {
      this.filtered = this.items.filter((item) => item.toLowerCase().includes(lower));
    }
    this.activeIndex = -1;
    this.renderList();
  }
  renderList() {
    const list = this.listEl ?? this.el.shadowRoot?.querySelector(".list");
    const input = this.inputEl ?? this.el.shadowRoot?.querySelector(".input");
    if (!(list instanceof H) || !(input instanceof HTMLInputElement)) {
      return;
    }
    list.innerHTML = "";
    if (!this.filtered.length) {
      const li = document.createElement("li");
      li.className = "item empty";
      li.textContent = "No matches";
      li.setAttribute("part", "item empty");
      list.append(li);
      return;
    }
    this.filtered.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "item";
      li.textContent = item;
      li.role = "option";
      li.id = `ac-opt-${index}`;
      li.setAttribute("part", "item");
      li.onmousedown = (event) => {
        event.preventDefault();
        this.select(item);
      };
      list.append(li);
    });
    input.setAttribute("aria-controls", this.listId);
  }
  moveActive(step) {
    if (!this.filtered.length || !this.inputEl) {
      return;
    }
    const next = this.activeIndex + step;
    if (next < 0) {
      this.activeIndex = this.filtered.length - 1;
    } else if (next >= this.filtered.length) {
      this.activeIndex = 0;
    } else {
      this.activeIndex = next;
    }
    const sr = this.el.shadowRoot;
    const els = Array.from(sr?.querySelectorAll(".item:not(.empty)") ?? []);
    els.forEach((itemEl, idx) => {
      itemEl.classList.toggle("active", idx === this.activeIndex);
    });
    const activeEl = els[this.activeIndex];
    if (activeEl instanceof H) {
      this.inputEl.setAttribute("aria-activedescendant", activeEl.id);
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }
  select(value) {
    const input = this.inputEl ?? this.el.shadowRoot?.querySelector(".input");
    if (input instanceof HTMLInputElement) {
      input.value = value;
    }
    this.closeList();
    this.el.dispatchEvent(new CustomEvent("bf-select", {
      bubbles: true,
      composed: true,
      detail: { value }
    }));
  }
  openList() {
    const input = this.inputEl ?? this.el.shadowRoot?.querySelector(".input");
    const list = this.listEl ?? this.el.shadowRoot?.querySelector(".list");
    if (!(input instanceof HTMLInputElement) || !(list instanceof H)) {
      return;
    }
    this.listOpen = true;
    input.setAttribute("aria-expanded", "true");
    list.hidden = false;
  }
  closeList() {
    const input = this.inputEl ?? this.el.shadowRoot?.querySelector(".input");
    const list = this.listEl ?? this.el.shadowRoot?.querySelector(".list");
    if (!(input instanceof HTMLInputElement) || !(list instanceof H)) {
      return;
    }
    this.listOpen = false;
    this.activeIndex = -1;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    list.hidden = true;
    this.el.shadowRoot?.querySelectorAll(".item.active").forEach((itemEl) => {
      itemEl.classList.remove("active");
    });
  }
  onDocumentClick(event) {
    const path = event.composedPath();
    if (!path.includes(this.el)) {
      this.closeList();
    }
  }
  bindInputOnce() {
    const input = this.el.shadowRoot?.querySelector(".input");
    const list = this.el.shadowRoot?.querySelector(".list");
    if (input instanceof HTMLInputElement && list instanceof H && input.dataset.bfBound !== "true") {
      input.dataset.bfBound = "true";
      this.inputEl = input;
      this.listEl = list;
      input.addEventListener("focus", () => {
        this.filter(input.value);
        this.openList();
      });
      input.addEventListener("input", () => {
        const text = input.value;
        this.filter(text);
        this.openList();
        this.el.dispatchEvent(new CustomEvent("bf-change", {
          bubbles: true,
          composed: true,
          detail: { value: text }
        }));
      });
      input.addEventListener("keydown", (event) => {
        if (!this.listOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
          this.openList();
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          this.moveActive(1);
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          this.moveActive(-1);
        }
        if (event.key === "Enter" && this.activeIndex >= 0) {
          event.preventDefault();
          const item = this.filtered[this.activeIndex];
          if (item) {
            this.select(item);
          }
        }
        if (event.key === "Escape") {
          this.closeList();
        }
      });
    }
  }
  componentDidRender() {
    this.bindInputOnce();
    this.cacheDom();
    const ph = this.el.getAttribute("placeholder") || "Search...";
    const val = this.el.getAttribute("value") || "";
    if (this.inputEl) {
      this.inputEl.placeholder = ph;
      this.inputEl.setAttribute("autocomplete", "off");
      this.inputEl.setAttribute("spellcheck", "false");
      this.inputEl.setAttribute("role", "combobox");
      if (!this.booted) {
        this.inputEl.value = val;
      }
      this.inputEl.setAttribute("aria-controls", this.listId);
      this.inputEl.setAttribute("aria-expanded", String(this.listOpen));
    }
    if (this.listEl) {
      this.listEl.id = this.listId;
      this.listEl.setAttribute("role", "listbox");
      this.listEl.hidden = !this.listOpen;
    }
    if (!this.booted) {
      this.booted = true;
      this.refreshFromAttrs();
    }
  }
  render() {
    const placeholder = this.el.getAttribute("placeholder") || "Search...";
    return h(Host, { key: "558168e27e2a70dfbc1293bdac0d40df54e644ef" }, h("div", { key: "8c49ab3a10e89028fbcfdb3a591b707443102e5a", class: "root", part: "root" }, h("input", { key: "d7a8ab97142343ec768419a28c63d43174b5a885", class: "input", part: "input", type: "text", placeholder, autocomplete: "off", spellcheck: false, role: "combobox", "aria-expanded": "false", "aria-controls": this.listId, "aria-autocomplete": "list" }), h("ul", { key: "dae3c733752b89138286296ce335b43682e64305", class: "list", part: "list", id: this.listId, role: "listbox", hidden: true })));
  }
  static get style() {
    return bfAutocompleteCss();
  }
}, [1, "bf-autocomplete"]);
function defineCustomElement$15() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-autocomplete"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-autocomplete":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfAutocomplete$1);
        }
        break;
    }
  });
}
var defineCustomElement5 = defineCustomElement$15;

// dist/_stencil/bf-avatar.js
var bfAvatarCss = () => `:host{--bf-avatar-font:var(--bf-theme-font-family, inherit);--bf-avatar-size-sm:2rem;--bf-avatar-size-md:2.5rem;--bf-avatar-size-lg:3rem;--bf-avatar-size-xl:3.75rem;--bf-avatar-radius:999px;--bf-avatar-border-width:var(--bf-theme-border-width, 1px);--bf-avatar-border-style:var(--bf-theme-border-style, solid);--bf-avatar-border-color:var(   --bf-theme-avatar-border-color,   var(--bf-theme-border-1, #d1d5db)  );--bf-avatar-bg:var(   --bf-theme-avatar-bg,   var(--bf-theme-surface-2, #f3f4f6)  );--bf-avatar-color:var(   --bf-theme-avatar-color,   var(--bf-theme-text-1, #111827)  );--bf-avatar-fallback-bg:var(   --bf-theme-avatar-fallback-bg,   color-mix(in srgb, var(--bf-avatar-bg) 75%, #94a3b8 25%)  );--bf-avatar-fallback-color:var(   --bf-theme-avatar-fallback-color,   var(--bf-avatar-color)  );--bf-avatar-shadow:var(--bf-theme-avatar-shadow, 0 1px 2px rgba(15, 23, 42, 0.08));--bf-avatar-status-size:0.62rem;--bf-avatar-status-ring:var(--bf-theme-surface-1, #ffffff);--bf-avatar-status-online:#16a34a;--bf-avatar-status-away:#f59e0b;--bf-avatar-status-busy:#ef4444;--bf-avatar-status-offline:#64748b;display:inline-block;font:var(--bf-avatar-font)}.root{position:relative;width:var(--bf-avatar-size-md);height:var(--bf-avatar-size-md);border-radius:var(--bf-avatar-radius);border-width:var(--bf-avatar-border-width);border-style:var(--bf-avatar-border-style);border-color:var(--bf-avatar-border-color);overflow:hidden;background:var(--bf-avatar-bg);color:var(--bf-avatar-color);box-shadow:var(--bf-avatar-shadow)}.root.size-sm{width:var(--bf-avatar-size-sm);height:var(--bf-avatar-size-sm)}.root.size-md{width:var(--bf-avatar-size-md);height:var(--bf-avatar-size-md)}.root.size-lg{width:var(--bf-avatar-size-lg);height:var(--bf-avatar-size-lg)}.root.size-xl{width:var(--bf-avatar-size-xl);height:var(--bf-avatar-size-xl)}.image,.fallback{width:100%;height:100%}.image{display:block;object-fit:cover;background:var(--bf-avatar-bg)}.fallback{display:grid;place-items:center;font-weight:700;letter-spacing:0.02em;background:var(--bf-avatar-fallback-bg);color:var(--bf-avatar-fallback-color);user-select:none}.root.size-sm .fallback{font-size:0.7rem}.root.size-md .fallback{font-size:0.85rem}.root.size-lg .fallback{font-size:1rem}.root.size-xl .fallback{font-size:1.15rem}.hidden{display:none}.status{position:absolute;right:0.02rem;bottom:0.02rem;width:var(--bf-avatar-status-size);height:var(--bf-avatar-status-size);border-radius:999px;border:2px solid var(--bf-avatar-status-ring)}.status.online{background:var(--bf-avatar-status-online)}.status.away{background:var(--bf-avatar-status-away)}.status.busy{background:var(--bf-avatar-status-busy)}.status.offline{background:var(--bf-avatar-status-offline)}`;
var BfAvatar$1 = /* @__PURE__ */ proxyCustomElement(class BfAvatar extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "imgHidden", false);
    __publicField(this, "revision", 0);
    __publicField(this, "observer");
    __publicField(this, "onImgError", () => {
      this.imgHidden = true;
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => {
      this.imgHidden = false;
      this.revision++;
    });
    this.observer.observe(this.el, { attributes: true });
  }
  disconnectedCallback() {
    this.observer?.disconnect();
  }
  buildInitials(name) {
    if (!name.trim()) {
      return "";
    }
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part.charAt(0).toUpperCase()).join("");
  }
  render() {
    const name = this.el.getAttribute("name") || "";
    const src = this.el.getAttribute("src") || "";
    const alt = this.el.getAttribute("alt") || name || "Avatar";
    const explicitInitials = this.el.getAttribute("initials");
    const initials = explicitInitials || this.buildInitials(name);
    const size = this.el.getAttribute("size") || "md";
    const status = this.el.getAttribute("status") || "";
    const showStatus = status && ["online", "away", "busy", "offline"].includes(status);
    return h(Host, { key: "86fe594fabd2a216cbfc6962fcc4f3076974db5a" }, h("div", { key: "cbb6c5d349041b02cb19f1a3b647a0ed86122178", class: `root size-${size}`, part: "root" }, src ? h("img", { class: { image: true, hidden: this.imgHidden }, part: "image", src, alt, onError: this.onImgError }) : "", h("div", { key: "2d298f1dcc9fc9b2b205c728e3003ba3ee111da6", class: { fallback: true, hidden: Boolean(src) && !this.imgHidden }, part: "fallback", "aria-label": alt }, initials || "?"), showStatus ? h("span", { class: `status ${status}`, part: "status" }) : ""));
  }
  static get style() {
    return bfAvatarCss();
  }
}, [513, "bf-avatar", {
  "imgHidden": [32],
  "revision": [32]
}]);
function defineCustomElement$16() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-avatar"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-avatar":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfAvatar$1);
        }
        break;
    }
  });
}
var defineCustomElement6 = defineCustomElement$16;

// dist/_stencil/bf-bottom-navigation.js
var bfBottomNavigationCss = () => `:host{--bf-bottom-navigation-font:var(--bf-theme-font-family, inherit);--bf-bottom-navigation-radius:var(--bf-theme-radius-md, 8px);--bf-bottom-navigation-border-width:var(--bf-theme-border-width, 1px);--bf-bottom-navigation-border-style:var(--bf-theme-border-style, solid);--bf-bottom-navigation-border-color:var(--bf-theme-bottom-navigation-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-bottom-navigation-bg:var(--bf-theme-bottom-navigation-bg, var(--bf-theme-surface-1, #ffffff));--bf-bottom-navigation-color:var(--bf-theme-bottom-navigation-color, var(--bf-theme-text-1, #0f172a));--bf-bottom-navigation-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-bottom-navigation-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-bottom-navigation-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-bottom-navigation-font);color:var(--bf-bottom-navigation-color)}.root{background:var(--bf-bottom-navigation-bg);color:var(--bf-bottom-navigation-color);border-width:var(--bf-bottom-navigation-border-width);border-style:var(--bf-bottom-navigation-border-style);border-color:var(--bf-bottom-navigation-border-color);border-radius:var(--bf-bottom-navigation-radius);padding:var(--bf-bottom-navigation-padding-y) var(--bf-bottom-navigation-padding-x);transition:var(--bf-bottom-navigation-transition)}`;
var BfBottomNavigation$1 = /* @__PURE__ */ proxyCustomElement(class BfBottomNavigation extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "42502441ffcc6ec7be366ab2a0db371587fc35e4" }, h("div", { key: "b03e5a4d88ce4e4c6e48d8fdd228c40aa4640a0a", class: "root", part: "root" }, h("slot", { key: "e28de1bcba3d77750e4d461fc1dcb29d63d7b845" })));
  }
  static get style() {
    return bfBottomNavigationCss();
  }
}, [257, "bf-bottom-navigation"]);
function defineCustomElement$17() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-bottom-navigation"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-bottom-navigation":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfBottomNavigation$1);
        }
        break;
    }
  });
}
var defineCustomElement7 = defineCustomElement$17;

// dist/_stencil/bf-breadcrumb.js
var bfBreadcrumbCss = () => `:host{--bf-breadcrumb-font:var(--bf-theme-font-family, inherit);--bf-breadcrumb-radius:var(--bf-theme-radius-md, 7px);--bf-breadcrumb-border-color:var(--bf-theme-breadcrumb-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-breadcrumb-bg:var(--bf-theme-breadcrumb-bg, transparent);--bf-breadcrumb-color:var(--bf-theme-breadcrumb-color, var(--bf-theme-text-1, #0f172a));--bf-breadcrumb-muted:var(--bf-theme-text-2, #64748b);--bf-breadcrumb-link:var(--bf-theme-button-primary-bg, #2563eb);--bf-breadcrumb-pill-bg:var(--bf-theme-surface-1, #ffffff);display:inline-block;font:var(--bf-breadcrumb-font);color:var(--bf-breadcrumb-color)}.root{background:var(--bf-breadcrumb-bg);color:var(--bf-breadcrumb-color)}.list{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;align-items:center;gap:0.45rem}.item{display:inline-flex;align-items:center;gap:0.45rem;color:inherit}.item a,.item span{font:inherit;color:inherit;text-decoration:none}.item a{color:var(--bf-breadcrumb-link)}.item .current{color:var(--bf-breadcrumb-color);font-weight:600}.item .ellipsis{color:var(--bf-breadcrumb-muted)}.separator{color:var(--bf-breadcrumb-muted)}.root[data-variant='minimal'] .separator{opacity:0.55}.root[data-variant='pills'] .item a,.root[data-variant='pills'] .item span{border:1px solid var(--bf-breadcrumb-border-color);background:var(--bf-breadcrumb-pill-bg);border-radius:var(--bf-breadcrumb-radius);padding:0.2rem 0.5rem}.root[data-variant='pills'] .separator{margin-inline:-0.1rem 0.1rem}`;
var BfBreadcrumb$1 = /* @__PURE__ */ proxyCustomElement(class BfBreadcrumb extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "slotRef");
    __publicField(this, "mo");
    __publicField(this, "onSlotChange", () => {
      this.renderList();
    });
    __publicField(this, "attrMo");
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.mo = new MutationObserver(() => this.renderList());
    this.mo.observe(this.el, { childList: true, subtree: true, characterData: true });
    this.attrMo = new MutationObserver(() => this.renderList());
    this.attrMo.observe(this.el, { attributes: true });
  }
  variant() {
    const value = (this.el.getAttribute("variant") || "default").toLowerCase();
    if (["default", "pills", "minimal"].includes(value)) {
      return value;
    }
    return "default";
  }
  separatorText() {
    const icon = this.el.getAttribute("separator-icon");
    if (icon) {
      return icon;
    }
    const raw = this.el.getAttribute("separator");
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
  max() {
    const parsed = Number.parseInt(this.el.getAttribute("max") || "", 10);
    if (Number.isFinite(parsed) && parsed >= 2) {
      return parsed;
    }
    return Infinity;
  }
  itemsFromDom() {
    const items = [];
    const children = Array.from(this.el.children);
    for (const child of children) {
      const text = child.textContent?.trim();
      if (!text) {
        continue;
      }
      const isLink = child.tagName.toLowerCase() === "a" && child.getAttribute("href");
      items.push({
        label: text,
        href: isLink ? child.getAttribute("href") || "" : "",
        current: child.hasAttribute("current")
      });
    }
    return items;
  }
  applyCollapse(items) {
    const max = this.max();
    if (max === Infinity || items.length <= max || max < 3) {
      return items;
    }
    const head = items[0];
    const tailCount = max - 2;
    const tail = items.slice(items.length - tailCount);
    return [
      head,
      { label: "...", href: "", current: false, ellipsis: true },
      ...tail
    ];
  }
  renderList() {
    const list = this.el.shadowRoot?.querySelector(".list");
    const root = this.el.shadowRoot?.querySelector(".root");
    if (!(list instanceof H) || !(root instanceof H)) {
      return;
    }
    const items = this.applyCollapse(this.itemsFromDom());
    root.setAttribute("data-variant", this.variant());
    list.replaceChildren();
    if (!items.length) {
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
        sep.textContent = this.separatorText();
        li.append(sep);
      }
      list.append(li);
    });
  }
  componentDidLoad() {
    this.slotRef?.addEventListener("slotchange", this.onSlotChange);
    this.renderList();
  }
  disconnectedCallback() {
    this.attrMo?.disconnect();
    this.mo?.disconnect();
    this.slotRef?.removeEventListener("slotchange", this.onSlotChange);
  }
  componentDidRender() {
    this.renderList();
  }
  render() {
    return h(Host, { key: "f0205ff43e36575a09e11b819a5d2bf4cc46419c" }, h("nav", { key: "eb55a040ae2b06a658c7c4e6d5f5051dfb16548b", class: "root", part: "root", "aria-label": "Breadcrumb" }, h("ol", { key: "cfa573d015ba684eead63f0688210b4d98e8acd4", class: "list", part: "list" }), h("span", { key: "ee8a1824538dc841f47af2831228f33268c703d4", hidden: true }, h("slot", { key: "7d5eeeaf0da2aa72283f35774674944122685291", ref: (el) => this.slotRef = el }))));
  }
  static get style() {
    return bfBreadcrumbCss();
  }
}, [257, "bf-breadcrumb"]);
function defineCustomElement$18() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-breadcrumb"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-breadcrumb":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfBreadcrumb$1);
        }
        break;
    }
  });
}
var defineCustomElement8 = defineCustomElement$18;

// dist/_stencil/bf-button.js
var bfButtonCss = () => `:host{--bf-button-font:var(--bf-theme-font-family, inherit);--bf-button-border-width:var(--bf-theme-border-width, 1px);--bf-button-border-style:var(--bf-theme-border-style, solid);--bf-button-border-radius:var(--bf-theme-radius-md, 6px);--bf-button-padding-y:var(--bf-theme-space-2, 0.5rem);--bf-button-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-button-cursor:var(--bf-theme-cursor-button, pointer);--bf-button-opacity-hover:var(--bf-theme-opacity-hover, 0.95);--bf-button-active-translate-y:var(--bf-theme-active-translate-y, 1px);--bf-button-focus-outline-width:var(--bf-theme-focus-ring-width, 2px);--bf-button-focus-outline-style:var(--bf-theme-focus-ring-style, solid);--bf-button-focus-outline-color:var(--bf-theme-focus-ring-color, #93c5fd);--bf-button-focus-outline-offset:var(--bf-theme-focus-ring-offset, 2px);--bf-button-transition:var(--bf-theme-transition-transform, transform 120ms ease),   var(--bf-theme-transition-opacity, opacity 120ms ease),   var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);--bf-button-primary-bg:var(--bf-theme-button-primary-bg, #1d4ed8);--bf-button-primary-color:var(--bf-theme-button-primary-color, #ffffff);--bf-button-primary-border-color:var(   --bf-theme-button-primary-border-color,   transparent  );--bf-button-primary-hover-bg:var(--bf-button-primary-bg);--bf-button-primary-hover-color:var(--bf-button-primary-color);--bf-button-primary-hover-border-color:var(--bf-button-primary-border-color);--bf-button-primary-active-bg:var(--bf-button-primary-bg);--bf-button-primary-active-color:var(--bf-button-primary-color);--bf-button-primary-active-border-color:var(   --bf-button-primary-border-color  );--bf-button-secondary-bg:var(--bf-theme-button-secondary-bg, #ffffff);--bf-button-secondary-color:var(--bf-theme-button-secondary-color, #1d4ed8);--bf-button-secondary-border-color:var(   --bf-theme-button-secondary-border-color,   #1d4ed8  );--bf-button-secondary-hover-bg:var(--bf-button-secondary-bg);--bf-button-secondary-hover-color:var(--bf-button-secondary-color);--bf-button-secondary-hover-border-color:var(   --bf-button-secondary-border-color  );--bf-button-secondary-active-bg:var(--bf-button-secondary-bg);--bf-button-secondary-active-color:var(--bf-button-secondary-color);--bf-button-secondary-active-border-color:var(   --bf-button-secondary-border-color  );--bf-button-tertiary-bg:var(--bf-theme-button-tertiary-bg, #f3f4f6);--bf-button-tertiary-color:var(--bf-theme-button-tertiary-color, #111827);--bf-button-tertiary-border-color:var(   --bf-theme-button-tertiary-border-color,   transparent  );--bf-button-outlined-bg:var(--bf-theme-button-outlined-bg, transparent);--bf-button-outlined-color:var(--bf-theme-button-outlined-color, #1d4ed8);--bf-button-outlined-border-color:var(   --bf-theme-button-outlined-border-color,   #1d4ed8  );--bf-button-ghost-bg:var(--bf-theme-button-ghost-bg, transparent);--bf-button-ghost-color:var(--bf-theme-button-ghost-color, #1d4ed8);--bf-button-ghost-border-color:var(   --bf-theme-button-ghost-border-color,   transparent  );display:inline-block}button{--_bf-button-bg:var(--bf-button-primary-bg);--_bf-button-color:var(--bf-button-primary-color);--_bf-button-border-color:var(--bf-button-primary-border-color);--_bf-button-hover-bg:var(--bf-button-primary-hover-bg);--_bf-button-hover-color:var(--bf-button-primary-hover-color);--_bf-button-hover-border-color:var(--bf-button-primary-hover-border-color);--_bf-button-active-bg:var(--bf-button-primary-active-bg);--_bf-button-active-color:var(--bf-button-primary-active-color);--_bf-button-active-border-color:var(   --bf-button-primary-active-border-color  );font:var(--bf-button-font);border-width:var(--bf-button-border-width);border-style:var(--bf-button-border-style);border-color:var(--_bf-button-border-color);border-radius:var(--bf-button-border-radius);cursor:var(--bf-button-cursor);padding:var(--bf-button-padding-y) var(--bf-button-padding-x);transition:var(--bf-button-transition);background:var(--_bf-button-bg);color:var(--_bf-button-color)}button:hover{opacity:var(--bf-button-opacity-hover);background:var(--_bf-button-hover-bg);color:var(--_bf-button-hover-color);border-color:var(--_bf-button-hover-border-color)}button:active{transform:translateY(var(--bf-button-active-translate-y));background:var(--_bf-button-active-bg);color:var(--_bf-button-active-color);border-color:var(--_bf-button-active-border-color)}button:focus-visible{outline-width:var(--bf-button-focus-outline-width);outline-style:var(--bf-button-focus-outline-style);outline-color:var(--bf-button-focus-outline-color);outline-offset:var(--bf-button-focus-outline-offset)}button:disabled{opacity:var(--bf-button-disabled-opacity, 0.55);cursor:var(--bf-button-disabled-cursor, not-allowed)}button.primary{--_bf-button-bg:var(--bf-button-primary-bg);--_bf-button-color:var(--bf-button-primary-color);--_bf-button-border-color:var(--bf-button-primary-border-color);--_bf-button-hover-bg:var(--bf-button-primary-hover-bg);--_bf-button-hover-color:var(--bf-button-primary-hover-color);--_bf-button-hover-border-color:var(--bf-button-primary-hover-border-color);--_bf-button-active-bg:var(--bf-button-primary-active-bg);--_bf-button-active-color:var(--bf-button-primary-active-color);--_bf-button-active-border-color:var(   --bf-button-primary-active-border-color  )}button.secondary{--_bf-button-bg:var(--bf-button-secondary-bg);--_bf-button-color:var(--bf-button-secondary-color);--_bf-button-border-color:var(--bf-button-secondary-border-color);--_bf-button-hover-bg:var(--bf-button-secondary-hover-bg);--_bf-button-hover-color:var(--bf-button-secondary-hover-color);--_bf-button-hover-border-color:var(   --bf-button-secondary-hover-border-color  );--_bf-button-active-bg:var(--bf-button-secondary-active-bg);--_bf-button-active-color:var(--bf-button-secondary-active-color);--_bf-button-active-border-color:var(   --bf-button-secondary-active-border-color  )}button.tertiary{--_bf-button-bg:var(--bf-button-tertiary-bg);--_bf-button-color:var(--bf-button-tertiary-color);--_bf-button-border-color:var(--bf-button-tertiary-border-color);--_bf-button-hover-bg:color-mix(in srgb, var(--bf-button-tertiary-bg) 85%, var(--bf-button-tertiary-color));--_bf-button-hover-color:var(--bf-button-tertiary-color);--_bf-button-hover-border-color:var(--bf-button-tertiary-border-color);--_bf-button-active-bg:color-mix(in srgb, var(--bf-button-tertiary-bg) 75%, var(--bf-button-tertiary-color));--_bf-button-active-color:var(--bf-button-tertiary-color);--_bf-button-active-border-color:var(--bf-button-tertiary-border-color)}button.outlined{--_bf-button-bg:var(--bf-button-outlined-bg);--_bf-button-color:var(--bf-button-outlined-color);--_bf-button-border-color:var(--bf-button-outlined-border-color);--_bf-button-hover-bg:color-mix(in srgb, var(--bf-button-outlined-color) 12%, transparent);--_bf-button-hover-color:var(--bf-button-outlined-color);--_bf-button-hover-border-color:var(--bf-button-outlined-border-color);--_bf-button-active-bg:color-mix(in srgb, var(--bf-button-outlined-color) 20%, transparent);--_bf-button-active-color:var(--bf-button-outlined-color);--_bf-button-active-border-color:var(--bf-button-outlined-border-color)}button.ghost{--_bf-button-bg:var(--bf-button-ghost-bg);--_bf-button-color:var(--bf-button-ghost-color);--_bf-button-border-color:var(--bf-button-ghost-border-color);--_bf-button-hover-bg:color-mix(in srgb, var(--bf-button-ghost-color) 12%, transparent);--_bf-button-hover-color:var(--bf-button-ghost-color);--_bf-button-hover-border-color:var(--bf-button-ghost-border-color);--_bf-button-active-bg:color-mix(in srgb, var(--bf-button-ghost-color) 20%, transparent);--_bf-button-active-color:var(--bf-button-ghost-color);--_bf-button-active-border-color:var(--bf-button-ghost-border-color)}button.is-selected{box-shadow:inset 0 0 0 2px var(--bf-theme-focus-ring-color, #93c5fd)}:host-context(bf-dropdown[border]) button{border:none;background:transparent}`;
var BfButton$1 = /* @__PURE__ */ proxyCustomElement(class BfButton extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "label", "");
    __publicField(this, "variant", "primary");
    __publicField(this, "selected", false);
    __publicField(this, "disabled", false);
    __publicField(this, "group");
    __publicField(this, "multiple");
    __publicField(this, "bfClick");
    __publicField(this, "handleClick", () => {
      if (this.disabled)
        return;
      this.applyGroupSelection();
      const label = this.label || "";
      const variant = this.variant || "primary";
      const group = this.group || "";
      this.selected = this.el.hasAttribute("selected");
      this.bfClick.emit({
        label,
        variant,
        selected: this.selected,
        group,
        at: (/* @__PURE__ */ new Date()).toISOString()
      });
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
    this.bfClick = createEvent(this, "bf-click");
  }
  get el() {
    return this;
  }
  groupLimit() {
    const multiple = this.multiple ?? null;
    if (multiple === null || multiple === void 0) {
      return 1;
    }
    if (`${multiple}` === "") {
      return Infinity;
    }
    const parsed = Number.parseInt(String(multiple), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }
  applyGroupSelection() {
    const group = this.group?.trim();
    if (!group) {
      return;
    }
    const peers = Array.from(document.querySelectorAll(`bf-button[group="${CSS.escape(group)}"]`));
    const cap = this.groupLimit();
    if (cap === 1) {
      for (const peer of peers) {
        peer.toggleAttribute("selected", peer === this.el);
      }
      this.selected = this.el.hasAttribute("selected");
      return;
    }
    if (this.el.hasAttribute("selected")) {
      this.el.removeAttribute("selected");
      this.selected = false;
      return;
    }
    const selectedCount = peers.filter((peer) => peer.hasAttribute("selected")).length;
    if (selectedCount >= cap) {
      return;
    }
    this.el.setAttribute("selected", "");
    this.selected = true;
  }
  render() {
    const variant = this.variant || "primary";
    return h(Host, { key: "132711f233a12d074dcbebfd28755c754e3593a5" }, h("button", { key: "5739bd4e9aeae79311ad872f81181e7f1d52fb8a", part: "button", type: "button", class: {
      [variant]: true,
      "is-selected": this.selected
    }, disabled: this.disabled, "aria-pressed": String(this.selected), onClick: this.handleClick }, this.label, h("slot", { key: "fcc3a826359a9b1069a8157465b98dc367bda87b" })));
  }
  static get style() {
    return bfButtonCss();
  }
}, [769, "bf-button", {
  "label": [513],
  "variant": [513],
  "selected": [1540],
  "disabled": [516],
  "group": [513],
  "multiple": [513]
}]);
function defineCustomElement$19() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-button"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-button":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfButton$1);
        }
        break;
    }
  });
}
var defineCustomElement9 = defineCustomElement$19;

// dist/_stencil/bf-calendar.js
var bfCalendarCss = () => `:host{--bf-calendar-font:var(--bf-theme-font-family, inherit);--bf-calendar-radius:var(--bf-theme-radius-md, 8px);--bf-calendar-border-width:var(--bf-theme-border-width, 1px);--bf-calendar-border-style:var(--bf-theme-border-style, solid);--bf-calendar-border-color:var(--bf-theme-calendar-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-calendar-bg:var(--bf-theme-calendar-bg, var(--bf-theme-surface-1, #ffffff));--bf-calendar-color:var(--bf-theme-calendar-color, var(--bf-theme-text-1, #0f172a));--bf-calendar-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-calendar-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-calendar-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-calendar-font);color:var(--bf-calendar-color)}.root{background:var(--bf-calendar-bg);color:var(--bf-calendar-color);border-width:var(--bf-calendar-border-width);border-style:var(--bf-calendar-border-style);border-color:var(--bf-calendar-border-color);border-radius:var(--bf-calendar-radius);padding:var(--bf-calendar-padding-y) var(--bf-calendar-padding-x);transition:var(--bf-calendar-transition)}`;
var BfCalendar$1 = /* @__PURE__ */ proxyCustomElement(class BfCalendar extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "18585135df31bbce04e65fb813476c4611e467e9" }, h("div", { key: "a181dc975008ac0039ee36d99874f4a114ac1be3", class: "root", part: "root" }, h("slot", { key: "e00cc75032b7eca61ed2fa3d322c47639da48a32" })));
  }
  static get style() {
    return bfCalendarCss();
  }
}, [257, "bf-calendar"]);
function defineCustomElement$110() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-calendar"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-calendar":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfCalendar$1);
        }
        break;
    }
  });
}
var defineCustomElement10 = defineCustomElement$110;

// dist/_stencil/bf-canvas.js
var bfCanvasCss = () => `:host{--bf-canvas-font:var(--bf-theme-font-family, inherit);--bf-canvas-radius:var(--bf-theme-radius-md, 8px);--bf-canvas-border-width:var(--bf-theme-border-width, 1px);--bf-canvas-border-style:var(--bf-theme-border-style, solid);--bf-canvas-border-color:var(--bf-theme-canvas-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-canvas-bg:var(--bf-theme-canvas-bg, var(--bf-theme-surface-1, #ffffff));--bf-canvas-color:var(--bf-theme-canvas-color, var(--bf-theme-text-1, #0f172a));--bf-canvas-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-canvas-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-canvas-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-canvas-font);color:var(--bf-canvas-color)}.root{background:var(--bf-canvas-bg);color:var(--bf-canvas-color);border-width:var(--bf-canvas-border-width);border-style:var(--bf-canvas-border-style);border-color:var(--bf-canvas-border-color);border-radius:var(--bf-canvas-radius);padding:var(--bf-canvas-padding-y) var(--bf-canvas-padding-x);transition:var(--bf-canvas-transition)}`;
var BfCanvas$1 = /* @__PURE__ */ proxyCustomElement(class BfCanvas extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "f62735290b05e9c7bba7c5d58c567b73b7878c56" }, h("div", { key: "c6822e0e1113133981794871f97a94da6bd69786", class: "root", part: "root" }, h("slot", { key: "44c55de1de111513a46f2b4a98c8ac6375e54fc7" })));
  }
  static get style() {
    return bfCanvasCss();
  }
}, [257, "bf-canvas"]);
function defineCustomElement$111() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-canvas"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-canvas":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfCanvas$1);
        }
        break;
    }
  });
}
var defineCustomElement11 = defineCustomElement$111;

// dist/_stencil/bf-card.js
var bfCardCss = () => `:host{--bf-card-font:var(--bf-theme-font-family, inherit);--bf-card-radius:var(--bf-theme-radius-md, 8px);--bf-card-border-width:var(--bf-theme-border-width, 1px);--bf-card-border-style:var(--bf-theme-border-style, solid);--bf-card-border-color:var(--bf-theme-card-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-card-bg:var(--bf-theme-card-bg, var(--bf-theme-surface-1, #ffffff));--bf-card-color:var(--bf-theme-card-color, var(--bf-theme-text-1, #0f172a));--bf-card-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-card-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-card-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-card-font);color:var(--bf-card-color)}.root{background:var(--bf-card-bg);color:var(--bf-card-color);border-width:var(--bf-card-border-width);border-style:var(--bf-card-border-style);border-color:var(--bf-card-border-color);border-radius:var(--bf-card-radius);padding:var(--bf-card-padding-y) var(--bf-card-padding-x);transition:var(--bf-card-transition)}`;
var BfCard$1 = /* @__PURE__ */ proxyCustomElement(class BfCard extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "6907f116ce55c177fb68a3cfbd4ffd27f2826990" }, h("div", { key: "7693d04e61d530cad577b1b82ff6dc51bcb22e4b", class: "root", part: "root" }, h("slot", { key: "b31178fbeb9764f3666f804e5ddb59957a9c6b42" })));
  }
  static get style() {
    return bfCardCss();
  }
}, [257, "bf-card"]);
function defineCustomElement$112() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-card"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-card":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfCard$1);
        }
        break;
    }
  });
}
var defineCustomElement12 = defineCustomElement$112;

// dist/_stencil/bf-carousel.js
var bfCarouselCss = () => `:host{--bf-carousel-font:var(--bf-theme-font-family, inherit);--bf-carousel-radius:var(--bf-theme-radius-md, 8px);--bf-carousel-border-width:var(--bf-theme-border-width, 1px);--bf-carousel-border-style:var(--bf-theme-border-style, solid);--bf-carousel-border-color:var(--bf-theme-carousel-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-carousel-bg:var(--bf-theme-carousel-bg, var(--bf-theme-surface-1, #ffffff));--bf-carousel-color:var(--bf-theme-carousel-color, var(--bf-theme-text-1, #0f172a));--bf-carousel-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-carousel-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-carousel-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-carousel-font);color:var(--bf-carousel-color)}.root{background:var(--bf-carousel-bg);color:var(--bf-carousel-color);border-width:var(--bf-carousel-border-width);border-style:var(--bf-carousel-border-style);border-color:var(--bf-carousel-border-color);border-radius:var(--bf-carousel-radius);padding:var(--bf-carousel-padding-y) var(--bf-carousel-padding-x);transition:var(--bf-carousel-transition)}`;
var BfCarousel$1 = /* @__PURE__ */ proxyCustomElement(class BfCarousel extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "5ae1c83b8b44632f6e6f35bda255e5ce50d605a0" }, h("div", { key: "d5f25ac85a93960d720dbb4a37ece0943c517dcf", class: "root", part: "root" }, h("slot", { key: "193530e691c93e5a007ae73ba19e05ab4614c2cf" })));
  }
  static get style() {
    return bfCarouselCss();
  }
}, [257, "bf-carousel"]);
function defineCustomElement$113() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-carousel"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-carousel":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfCarousel$1);
        }
        break;
    }
  });
}
var defineCustomElement13 = defineCustomElement$113;

// dist/_stencil/bf-chart.js
var bfChartCss = () => `:host{--bf-chart-font:var(--bf-theme-font-family, inherit);--bf-chart-radius:var(--bf-theme-radius-md, 10px);--bf-chart-border-color:var(--bf-theme-chart-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-chart-bg:var(--bf-theme-chart-bg, var(--bf-theme-surface-1, #ffffff));--bf-chart-color:var(--bf-theme-chart-color, var(--bf-theme-text-1, #0f172a));--bf-chart-accent:var(--bf-theme-button-primary-bg, #2563eb);--bf-chart-muted:var(--bf-theme-surface-2, #e2e8f0);display:block;font:var(--bf-chart-font);color:var(--bf-chart-color)}.root{background:var(--bf-chart-bg);color:var(--bf-chart-color);border:1px solid var(--bf-chart-border-color);border-radius:var(--bf-chart-radius);padding:0.75rem;display:grid;gap:0.55rem}.viz{display:grid;height:130px;align-items:end}.bar{display:none;background:var(--bf-chart-accent);border-radius:6px 6px 0 0}.viz .bar:nth-child(1){height:35%}.viz .bar:nth-child(2){height:52%}.viz .bar:nth-child(3){height:74%}.viz .bar:nth-child(4){height:46%}.viz .bar:nth-child(5){height:62%}.line,.pie,.donut,.gauge,.heatmap,.treemap,.gantt,.graph{display:none}.root[data-variant='bar'] .viz,.root[data-variant='sparkline'] .viz{grid-template-columns:repeat(5, 1fr);gap:0.45rem}.root[data-variant='bar'] .bar{display:block}.root[data-variant='line'] .line,.root[data-variant='sparkline'] .line{display:block;height:70%;border-bottom:3px solid var(--bf-chart-accent);border-left:3px solid transparent;border-right:3px solid transparent;clip-path:polygon(0 70%, 18% 48%, 36% 58%, 56% 28%, 76% 42%, 100% 12%, 100% 100%, 0 100%);background:linear-gradient(to top, color-mix(in srgb, var(--bf-chart-accent) 20%, transparent), transparent)}.root[data-variant='line'] .viz,.root[data-variant='sparkline'] .viz{grid-template-columns:1fr}.root[data-variant='pie'] .pie,.root[data-variant='donut'] .donut,.root[data-variant='gauge'] .gauge{display:block;justify-self:center;width:108px;height:108px;border-radius:50%}.root[data-variant='pie'] .pie{background:conic-gradient(var(--bf-chart-accent) 0 62%, var(--bf-chart-muted) 62% 100%)}.root[data-variant='donut'] .donut{background:radial-gradient(circle at center, var(--bf-chart-bg) 46%, transparent 47%),   conic-gradient(var(--bf-chart-accent) 0 68%, var(--bf-chart-muted) 68% 100%)}.root[data-variant='gauge'] .gauge{height:64px;border-radius:64px 64px 0 0;background:conic-gradient(from 180deg at 50% 100%, var(--bf-chart-accent) 0 58%, var(--bf-chart-muted) 58% 100%)}.root[data-variant='heatmap'] .heatmap{display:grid;grid-template-columns:repeat(4, 1fr);gap:0.35rem}.root[data-variant='heatmap'] .heatmap span{aspect-ratio:1;border-radius:4px;background:color-mix(in srgb, var(--bf-chart-accent) 20%, var(--bf-chart-muted))}.root[data-variant='heatmap'] .heatmap span:nth-child(3n){background:color-mix(in srgb, var(--bf-chart-accent) 60%, var(--bf-chart-muted))}.root[data-variant='treemap'] .treemap{display:grid;grid-template-columns:1.2fr 1fr;gap:0.35rem}.root[data-variant='treemap'] .treemap span{min-height:56px;background:color-mix(in srgb, var(--bf-chart-accent) 35%, var(--bf-chart-muted));border-radius:6px}.root[data-variant='treemap'] .treemap span:first-child{grid-row:span 2}.root[data-variant='gantt'] .gantt{display:grid;gap:0.45rem}.root[data-variant='gantt'] .gantt span{height:0.65rem;border-radius:999px;background:var(--bf-chart-muted);position:relative}.root[data-variant='gantt'] .gantt span::after{content:'';position:absolute;inset:0 auto 0 0;width:45%;border-radius:inherit;background:var(--bf-chart-accent)}.root[data-variant='gantt'] .gantt span:nth-child(2)::after{width:70%}.root[data-variant='gantt'] .gantt span:nth-child(3)::after{width:32%}.root[data-variant='graph'] .graph{display:grid;grid-template-columns:repeat(3, 1fr);align-items:center;justify-items:center;gap:0.45rem}.root[data-variant='graph'] .graph span{width:1rem;height:1rem;border-radius:50%;background:var(--bf-chart-accent)}.meta:empty{display:none}`;
var BfChart$1 = /* @__PURE__ */ proxyCustomElement(class BfChart extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "observer");
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.applyVariant());
    this.observer.observe(this.el, { attributes: true });
    this.applyVariant();
  }
  disconnectedCallback() {
    this.observer?.disconnect();
  }
  variant() {
    const explicit = (this.el.getAttribute("variant") || "").toLowerCase();
    const valid = [
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
    ];
    if (valid.includes(explicit)) {
      return explicit;
    }
    for (const item of valid) {
      if (this.el.hasAttribute(item)) {
        return item;
      }
    }
    return "bar";
  }
  applyVariant() {
    const root = this.el.shadowRoot?.querySelector(".root");
    if (root instanceof H) {
      root.setAttribute("data-variant", this.variant());
    }
  }
  componentDidRender() {
    this.applyVariant();
  }
  render() {
    return h(Host, { key: "70f66ef27f2dd6d0c3c458691b3e5b4587345e13" }, h("div", { key: "6ac76041d2dc3d2c8e1a760210473902a9a9fead", class: "root", part: "root", "data-variant": "bar" }, h("div", { key: "9d2f1b1f99d8f6b17fceb872130056318fdc755c", class: "viz", part: "viz" }, h("div", { key: "3c75ece5bcf04ebaabfe46c146c1d8a2b3ad4e6a", class: "bar" }), h("div", { key: "e13784df55dc5703e21afc5a83f2b7dc0332b034", class: "bar" }), h("div", { key: "844ee927f91cdcb4e10dfd08f3208e7e00ca7e3b", class: "bar" }), h("div", { key: "fddc575c4a4d4eea3d001d480cf9f7d2192784f2", class: "bar" }), h("div", { key: "ca093096c80818b7d0af0db53949924de7021bcb", class: "bar" }), h("div", { key: "779269e18c976729b18e55b2ebd5ede610b53855", class: "line" }), h("div", { key: "0e0c6269bc8aa053febe0640ccd59e42d99b517b", class: "pie" }), h("div", { key: "036352dfc317fa32f5745ab0dac2b86dc5d841cd", class: "donut" }), h("div", { key: "031b81f56ef61fad6fcc183aeb6d01a6192bfd9e", class: "gauge" }), h("div", { key: "c4786defad7a351be2a1590b8ea1ce8fa2febaa8", class: "heatmap" }, h("span", { key: "518a2d6578821f116b32f7e7ebf884c0cda0d36e" }), h("span", { key: "112fdbcd4fcc4375a178dfd42289cbf03de02731" }), h("span", { key: "908aa40663cdb89f82a0ae949c11007aa49182e0" }), h("span", { key: "a4165fb4c3d194dad697ca01c5365d56b33fd324" }), h("span", { key: "18cb577bd42e5386ddac4a6226426bcab9260415" }), h("span", { key: "f507ddfb68694b31dfc7dca612f7452c9dd8f909" }), h("span", { key: "80729ba5b3ef6758d4ba68f63ebe28d55a79e611" }), h("span", { key: "657231327d767f83db222dffe9882876018ae1f7" }), h("span", { key: "b19db57f56515d0a8302e69d2f25a5c90942ccbe" }), h("span", { key: "3e7726d315f12aca73f2d6dc551e6a317dfaa057" }), h("span", { key: "44c0020078f7a77d133523c8dd6060fd25006e52" }), h("span", { key: "6d26f00e4c2f2c836d3c24c8f845b0dd8c4eb297" })), h("div", { key: "b20f98c4a535436453b8b8d630fc95f6c39b6a13", class: "treemap" }, h("span", { key: "3fb302b0f79423f0fd4e7201b429094214f61c97" }), h("span", { key: "cd22fc39fc1ac634ed12721c6ffb0189b4435326" }), h("span", { key: "1780fd8f720f499dc5e2cc794abbcb8246d524a6" })), h("div", { key: "28c1389172f8f79df3c7686e11ea0e56b20ac32f", class: "gantt" }, h("span", { key: "26d1f6b9cd48578a15ffbf5d47aeab73d1d69771" }), h("span", { key: "8a97001f3eaf51e6ca184a809cd3ecdf159ca539" }), h("span", { key: "2c310c2a82f3cbd00e29e57983e2fb7cfbe6cfae" })), h("div", { key: "bed97c1542892daae7140b854193bfaec6d9ba8e", class: "graph" }, h("span", { key: "22391d17e27f848ceb7f071c72be722c44abb9f0" }), h("span", { key: "a38f371886434507e0702cd139a9df1203874be6" }), h("span", { key: "f3222fcf7a8cb9da5daef389c4a6c0d5ee6b1690" }))), h("div", { key: "a41518174ebb02d328bf68bab4154b9f9963e489", class: "meta", part: "meta" }, h("slot", { key: "41dd4b64fb3a5fd9e0b3dbb6b0db9a0f0aa038d9" }))));
  }
  static get style() {
    return bfChartCss();
  }
}, [257, "bf-chart"]);
function defineCustomElement$114() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-chart"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-chart":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfChart$1);
        }
        break;
    }
  });
}
var defineCustomElement14 = defineCustomElement$114;

// dist/_stencil/bf-checkbox.js
var bfCheckboxCss = () => `:host{--bf-checkbox-font:var(--bf-theme-font-family, inherit);--bf-checkbox-radius:var(--bf-theme-radius-md, 8px);--bf-checkbox-border-width:var(--bf-theme-border-width, 1px);--bf-checkbox-border-style:var(--bf-theme-border-style, solid);--bf-checkbox-border-color:var(--bf-theme-checkbox-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-checkbox-bg:var(--bf-theme-checkbox-bg, var(--bf-theme-surface-1, #ffffff));--bf-checkbox-color:var(--bf-theme-checkbox-color, var(--bf-theme-text-1, #0f172a));--bf-checkbox-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-checkbox-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-checkbox-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:inline-block;font:var(--bf-checkbox-font);color:var(--bf-checkbox-color)}.root{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;background:var(--bf-checkbox-bg);color:var(--bf-checkbox-color);border-width:var(--bf-checkbox-border-width);border-style:var(--bf-checkbox-border-style);border-color:var(--bf-checkbox-border-color);border-radius:var(--bf-checkbox-radius);padding:var(--bf-checkbox-padding-y) var(--bf-checkbox-padding-x);transition:var(--bf-checkbox-transition)}input{position:absolute;opacity:0;width:0;height:0}.box{width:0.95rem;height:0.95rem;border-radius:0.25rem;border:2px solid var(--bf-checkbox-border-color);display:inline-block;position:relative}.box::after{content:'';position:absolute;left:0.2rem;top:0.02rem;width:0.28rem;height:0.55rem;border-right:2px solid var(--bf-theme-button-primary-color, #fff);border-bottom:2px solid var(--bf-theme-button-primary-color, #fff);transform:rotate(45deg) scale(0);transition:transform 120ms ease}input:checked+.box{background:var(--bf-theme-button-primary-bg, #2563eb);border-color:var(--bf-theme-button-primary-bg, #2563eb)}input:checked+.box::after{transform:rotate(45deg) scale(1)}`;
var BfCheckbox$1 = /* @__PURE__ */ proxyCustomElement(class BfCheckbox extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "attrLabel");
    __publicField(this, "observer");
    __publicField(this, "onInputChange", (event) => {
      const input = event.target;
      const nextChecked = input.checked;
      if (nextChecked && !this.canSelectMore()) {
        input.checked = false;
        return;
      }
      this.checked = nextChecked;
      this.el.dispatchEvent(new CustomEvent("bf-change", {
        bubbles: true,
        composed: true,
        detail: {
          group: this.effectiveGroup(),
          value: this.value,
          checked: this.checked
        }
      }));
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  componentDidRender() {
    this.syncState();
  }
  handleLabel() {
    this.syncState();
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.syncState());
    this.observer.observe(this.el, {
      attributes: true,
      attributeFilter: ["checked", "disabled", "label", "value", "group", "multiple"]
    });
  }
  disconnectedCallback() {
    this.observer?.disconnect();
  }
  syncState() {
    const input = this.el.shadowRoot?.querySelector("input");
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    input.checked = this.checked;
    input.disabled = this.disabled;
    input.value = this.value;
    const labelAttr = this.el.getAttribute("label");
    if (labelAttr) {
      input.setAttribute("aria-label", labelAttr);
    } else {
      input.removeAttribute("aria-label");
    }
  }
  get checked() {
    return this.el.hasAttribute("checked");
  }
  set checked(v) {
    if (v) {
      this.el.setAttribute("checked", "");
    } else {
      this.el.removeAttribute("checked");
    }
  }
  get value() {
    return this.el.getAttribute("value") || this.el.textContent?.trim() || "";
  }
  get disabled() {
    return this.el.hasAttribute("disabled");
  }
  effectiveGroup() {
    return this.el.getAttribute("group") || "";
  }
  groupLimit() {
    const multiple = this.el.getAttribute("multiple");
    if (multiple === null) {
      return Infinity;
    }
    if (multiple === "") {
      return Infinity;
    }
    const parsed = Number.parseInt(multiple, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : Infinity;
  }
  canSelectMore() {
    const group = this.effectiveGroup();
    if (!group) {
      return true;
    }
    const cap = this.groupLimit();
    if (cap === Infinity) {
      return true;
    }
    const selected = Array.from(document.querySelectorAll(`bf-checkbox[group="${CSS.escape(group)}"][checked]`));
    return selected.length < cap || selected.includes(this.el);
  }
  render() {
    return h(Host, { key: "5b3a15efe0e9396dbfbc5e2667efca946e29cebc" }, h("label", { key: "afa1cf334ce0279c98ccbdcfc7640a43e807bde2", class: "root", part: "root" }, h("input", { key: "738df61a17cf0887997f75d585bafb48c5125b3b", type: "checkbox", part: "input", onChange: this.onInputChange }), h("span", { key: "88888cee472d1ee1d990f3fbd6531223d7966f8e", class: "box", part: "box" }), h("span", { key: "7292be60173cb2c2b65a23ba1e509442cdb6abec", class: "text", part: "text" }, h("slot", { key: "47b940a1372e876342c00500902df189e6642755" }))));
  }
  static get watchers() {
    return {
      "attrLabel": [{
        "handleLabel": 0
      }]
    };
  }
  static get style() {
    return bfCheckboxCss();
  }
}, [769, "bf-checkbox", {
  "attrLabel": [513, "label"]
}, void 0, {
  "attrLabel": [{
    "handleLabel": 0
  }]
}]);
function defineCustomElement$115() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-checkbox"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-checkbox":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfCheckbox$1);
        }
        break;
    }
  });
}
var defineCustomElement15 = defineCustomElement$115;

// dist/_stencil/bf-combobox.js
var bfComboboxCss = () => `:host{--bf-combobox-font:var(--bf-theme-font-family, inherit);--bf-combobox-radius:var(--bf-theme-radius-md, 8px);--bf-combobox-border-width:var(--bf-theme-border-width, 1px);--bf-combobox-border-style:var(--bf-theme-border-style, solid);--bf-combobox-border-color:var(--bf-theme-combobox-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-combobox-bg:var(--bf-theme-combobox-bg, var(--bf-theme-surface-1, #ffffff));--bf-combobox-color:var(--bf-theme-combobox-color, var(--bf-theme-text-1, #0f172a));--bf-combobox-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-combobox-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-combobox-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-combobox-font);color:var(--bf-combobox-color)}.root{background:var(--bf-combobox-bg);color:var(--bf-combobox-color);border-width:var(--bf-combobox-border-width);border-style:var(--bf-combobox-border-style);border-color:var(--bf-combobox-border-color);border-radius:var(--bf-combobox-radius);padding:var(--bf-combobox-padding-y) var(--bf-combobox-padding-x);transition:var(--bf-combobox-transition)}`;
var BfCombobox$1 = /* @__PURE__ */ proxyCustomElement(class BfCombobox extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "e2a4be965d2d3fc5a3f047c3def2722a0dcf182b" }, h("div", { key: "8277a0fcd39fd12afae0cd84634238adc68821e4", class: "root", part: "root" }, h("slot", { key: "89dab5b219ba22fcd9f6c1046a8829fd1fad0600" })));
  }
  static get style() {
    return bfComboboxCss();
  }
}, [257, "bf-combobox"]);
function defineCustomElement$116() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-combobox"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-combobox":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfCombobox$1);
        }
        break;
    }
  });
}
var defineCustomElement16 = defineCustomElement$116;

// dist/_stencil/bf-command-palette.js
var bfCommandPaletteCss = () => `:host{--bf-command-palette-font:var(--bf-theme-font-family, inherit);--bf-command-palette-radius:var(--bf-theme-radius-md, 8px);--bf-command-palette-border-width:var(--bf-theme-border-width, 1px);--bf-command-palette-border-style:var(--bf-theme-border-style, solid);--bf-command-palette-border-color:var(--bf-theme-command-palette-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-command-palette-bg:var(--bf-theme-command-palette-bg, var(--bf-theme-surface-1, #ffffff));--bf-command-palette-color:var(--bf-theme-command-palette-color, var(--bf-theme-text-1, #0f172a));--bf-command-palette-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-command-palette-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-command-palette-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-command-palette-font);color:var(--bf-command-palette-color)}.root{background:var(--bf-command-palette-bg);color:var(--bf-command-palette-color);border-width:var(--bf-command-palette-border-width);border-style:var(--bf-command-palette-border-style);border-color:var(--bf-command-palette-border-color);border-radius:var(--bf-command-palette-radius);padding:var(--bf-command-palette-padding-y) var(--bf-command-palette-padding-x);transition:var(--bf-command-palette-transition)}`;
var BfCommandPalette$1 = /* @__PURE__ */ proxyCustomElement(class BfCommandPalette extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "a4cb985c0e0acb70068d02cc434dc7d1a753fdc6" }, h("div", { key: "dab758cdbec2aad63b0503bdc2d0726de4476ec5", class: "root", part: "root" }, h("slot", { key: "9e75e8abc212de8d581c7ee4c8e8d87732a6add7" })));
  }
  static get style() {
    return bfCommandPaletteCss();
  }
}, [257, "bf-command-palette"]);
function defineCustomElement$117() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-command-palette"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-command-palette":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfCommandPalette$1);
        }
        break;
    }
  });
}
var defineCustomElement17 = defineCustomElement$117;

// dist/_stencil/bf-countdown.js
var bfCountdownCss = () => `:host{--bf-countdown-font:var(--bf-theme-font-family, inherit);--bf-countdown-radius:var(--bf-theme-radius-md, 8px);--bf-countdown-border-width:var(--bf-theme-border-width, 1px);--bf-countdown-border-style:var(--bf-theme-border-style, solid);--bf-countdown-border-color:var(--bf-theme-countdown-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-countdown-bg:var(--bf-theme-countdown-bg, var(--bf-theme-surface-1, #ffffff));--bf-countdown-color:var(--bf-theme-countdown-color, var(--bf-theme-text-1, #0f172a));--bf-countdown-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-countdown-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-countdown-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-countdown-font);color:var(--bf-countdown-color)}.root{background:var(--bf-countdown-bg);color:var(--bf-countdown-color);border-width:var(--bf-countdown-border-width);border-style:var(--bf-countdown-border-style);border-color:var(--bf-countdown-border-color);border-radius:var(--bf-countdown-radius);padding:var(--bf-countdown-padding-y) var(--bf-countdown-padding-x);transition:var(--bf-countdown-transition)}`;
var BfCountdown$1 = /* @__PURE__ */ proxyCustomElement(class BfCountdown extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "cfaa1b0f9629ab9c0d790c372a6c19e7d8f02dd7" }, h("div", { key: "cd60cc6f4a131998c33adcac03faed67db62ca3f", class: "root", part: "root" }, h("slot", { key: "601d5344744e72bdb13d5963bbf190e0b6d58886" })));
  }
  static get style() {
    return bfCountdownCss();
  }
}, [257, "bf-countdown"]);
function defineCustomElement$118() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-countdown"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-countdown":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfCountdown$1);
        }
        break;
    }
  });
}
var defineCustomElement18 = defineCustomElement$118;

// dist/_stencil/bf-data-grid.js
var bfDataGridCss = () => `:host{--bf-data-grid-font:var(--bf-theme-font-family, inherit);--bf-data-grid-radius:var(--bf-theme-radius-md, 8px);--bf-data-grid-border-width:var(--bf-theme-border-width, 1px);--bf-data-grid-border-style:var(--bf-theme-border-style, solid);--bf-data-grid-border-color:var(--bf-theme-data-grid-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-data-grid-bg:var(--bf-theme-data-grid-bg, var(--bf-theme-surface-1, #ffffff));--bf-data-grid-color:var(--bf-theme-data-grid-color, var(--bf-theme-text-1, #0f172a));--bf-data-grid-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-data-grid-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-data-grid-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-data-grid-font);color:var(--bf-data-grid-color)}.root{background:var(--bf-data-grid-bg);color:var(--bf-data-grid-color);border-width:var(--bf-data-grid-border-width);border-style:var(--bf-data-grid-border-style);border-color:var(--bf-data-grid-border-color);border-radius:var(--bf-data-grid-radius);padding:var(--bf-data-grid-padding-y) var(--bf-data-grid-padding-x);transition:var(--bf-data-grid-transition)}`;
var BfDataGrid$1 = /* @__PURE__ */ proxyCustomElement(class BfDataGrid extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "0ebc3e751b8bc399765a4a7a6cb3e4b938ab840f" }, h("div", { key: "72cc5f04cd0f5e96116349c7ec222014610b5cf8", class: "root", part: "root" }, h("slot", { key: "ca278d05437032c86ef4668311920440cc3c0f77" })));
  }
  static get style() {
    return bfDataGridCss();
  }
}, [257, "bf-data-grid"]);
function defineCustomElement$119() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-data-grid"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-data-grid":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfDataGrid$1);
        }
        break;
    }
  });
}
var defineCustomElement19 = defineCustomElement$119;

// dist/_stencil/bf-date-picker.js
var bfDatePickerCss = () => `:host{--bf-date-picker-font:var(--bf-theme-font-family, inherit);--bf-date-picker-radius:var(--bf-theme-radius-md, 8px);--bf-date-picker-border-width:var(--bf-theme-border-width, 1px);--bf-date-picker-border-style:var(--bf-theme-border-style, solid);--bf-date-picker-border-color:var(--bf-theme-date-picker-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-date-picker-bg:var(--bf-theme-date-picker-bg, var(--bf-theme-surface-1, #ffffff));--bf-date-picker-color:var(--bf-theme-date-picker-color, var(--bf-theme-text-1, #0f172a));--bf-date-picker-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-date-picker-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-date-picker-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-date-picker-font);color:var(--bf-date-picker-color)}.root{background:var(--bf-date-picker-bg);color:var(--bf-date-picker-color);border-width:var(--bf-date-picker-border-width);border-style:var(--bf-date-picker-border-style);border-color:var(--bf-date-picker-border-color);border-radius:var(--bf-date-picker-radius);padding:var(--bf-date-picker-padding-y) var(--bf-date-picker-padding-x);transition:var(--bf-date-picker-transition)}`;
var BfDatePicker$1 = /* @__PURE__ */ proxyCustomElement(class BfDatePicker extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "48807910d2751804248cadfe287230b51182087e" }, h("div", { key: "557423189c09acd95c0632ca67bf0920269cf1f6", class: "root", part: "root" }, h("slot", { key: "a6dc0900fc92a5c8efd3e8da458f1d504385f439" })));
  }
  static get style() {
    return bfDatePickerCss();
  }
}, [257, "bf-date-picker"]);
function defineCustomElement$120() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-date-picker"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-date-picker":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfDatePicker$1);
        }
        break;
    }
  });
}
var defineCustomElement20 = defineCustomElement$120;

// dist/_stencil/bf-date-range-picker.js
var bfDateRangePickerCss = () => `:host{--bf-date-range-picker-font:var(--bf-theme-font-family, inherit);--bf-date-range-picker-radius:var(--bf-theme-radius-md, 8px);--bf-date-range-picker-border-width:var(--bf-theme-border-width, 1px);--bf-date-range-picker-border-style:var(--bf-theme-border-style, solid);--bf-date-range-picker-border-color:var(--bf-theme-date-range-picker-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-date-range-picker-bg:var(--bf-theme-date-range-picker-bg, var(--bf-theme-surface-1, #ffffff));--bf-date-range-picker-color:var(--bf-theme-date-range-picker-color, var(--bf-theme-text-1, #0f172a));--bf-date-range-picker-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-date-range-picker-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-date-range-picker-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-date-range-picker-font);color:var(--bf-date-range-picker-color)}.root{background:var(--bf-date-range-picker-bg);color:var(--bf-date-range-picker-color);border-width:var(--bf-date-range-picker-border-width);border-style:var(--bf-date-range-picker-border-style);border-color:var(--bf-date-range-picker-border-color);border-radius:var(--bf-date-range-picker-radius);padding:var(--bf-date-range-picker-padding-y) var(--bf-date-range-picker-padding-x);transition:var(--bf-date-range-picker-transition)}`;
var BfDateRangePicker$1 = /* @__PURE__ */ proxyCustomElement(class BfDateRangePicker extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "7425574ded91be329a3cfb839303a2e3e9075fe6" }, h("div", { key: "f71d76c379a103b082c225a3b753168d0128bffe", class: "root", part: "root" }, h("slot", { key: "6de4110c916579fdae01f67a711d276a50738098" })));
  }
  static get style() {
    return bfDateRangePickerCss();
  }
}, [257, "bf-date-range-picker"]);
function defineCustomElement$121() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-date-range-picker"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-date-range-picker":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfDateRangePicker$1);
        }
        break;
    }
  });
}
var defineCustomElement21 = defineCustomElement$121;

// dist/_stencil/bf-dialog.js
var bfDialogCss = () => `:host{--bf-dialog-font:var(--bf-theme-font-family, inherit);--bf-dialog-radius:var(--bf-theme-radius-md, 8px);--bf-dialog-border-width:var(--bf-theme-border-width, 1px);--bf-dialog-border-style:var(--bf-theme-border-style, solid);--bf-dialog-border-color:var(--bf-theme-dialog-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-dialog-bg:var(--bf-theme-dialog-bg, var(--bf-theme-surface-1, #ffffff));--bf-dialog-color:var(--bf-theme-dialog-color, var(--bf-theme-text-1, #0f172a));--bf-dialog-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-dialog-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-dialog-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);--bf-dialog-backdrop:rgba(2, 6, 23, 0.45);--bf-dialog-max-w:36rem;--bf-dialog-shadow:0 18px 44px rgba(2, 6, 23, 0.28);display:block;font:var(--bf-dialog-font);color:var(--bf-dialog-color);z-index:1100}.root{position:fixed;inset:0;display:grid;align-items:center;justify-items:center;padding:1rem}.backdrop{position:absolute;inset:0;background:var(--bf-dialog-backdrop)}.panel{position:relative;width:min(100%, var(--bf-dialog-max-w));background:var(--bf-dialog-bg);color:var(--bf-dialog-color);border-width:var(--bf-dialog-border-width);border-style:var(--bf-dialog-border-style);border-color:var(--bf-dialog-border-color);border-radius:var(--bf-dialog-radius);padding:var(--bf-dialog-padding-y) var(--bf-dialog-padding-x);transition:var(--bf-dialog-transition);box-shadow:var(--bf-dialog-shadow)}.root[data-open='false']{display:none}.root[data-variant='tooltip'] .backdrop,.root[data-variant='popover'] .backdrop,.root[data-variant='panel'] .backdrop,.root[data-variant='sheet'] .backdrop,.root[data-variant='bottom-sheet'] .backdrop{background:transparent}.root[data-variant='tooltip'] .panel{width:auto;max-width:18rem;padding:0.35rem 0.55rem;border-radius:6px}.root[data-variant='popover'] .panel{width:min(24rem, 100%)}.root[data-variant='sheet']{align-items:center}.root[data-variant='bottom-sheet']{align-items:end}.root[data-variant='bottom-sheet'] .panel{width:min(100%, 42rem);border-radius:14px 14px 0 0}.root[data-position='top']{align-items:start}.root[data-position='bottom']{align-items:end}.root[data-position='left']{justify-items:start}.root[data-position='right']{justify-items:end}.root[data-position='top-left']{align-items:start;justify-items:start}.root[data-position='top-right']{align-items:start;justify-items:end}.root[data-position='bottom-left']{align-items:end;justify-items:start}.root[data-position='bottom-right']{align-items:end;justify-items:end}`;
var BfDialog$1 = /* @__PURE__ */ proxyCustomElement(class BfDialog extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "observer");
    __publicField(this, "onBackdropClick", () => {
      const variant = this.variant();
      if (variant === "tooltip" || variant === "popover") {
        return;
      }
      if (this.el.hasAttribute("persistent")) {
        return;
      }
      this.el.removeAttribute("open");
      this.el.dispatchEvent(new CustomEvent("bf-close", {
        bubbles: true,
        composed: true,
        detail: { id: this.el.id || "" }
      }));
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.syncRoot());
    this.observer.observe(this.el, {
      attributes: true
    });
  }
  disconnectedCallback() {
    this.observer?.disconnect();
  }
  async open() {
    this.el.setAttribute("open", "");
  }
  async close() {
    this.el.removeAttribute("open");
  }
  async toggle() {
    if (this.el.hasAttribute("open")) {
      await this.close();
      return;
    }
    await this.open();
  }
  variant() {
    const explicit = (this.el.getAttribute("variant") || "").toLowerCase();
    if (["dialog", "sheet", "bottom-sheet", "popover", "tooltip", "panel"].includes(explicit)) {
      return explicit;
    }
    if (this.el.hasAttribute("sheet")) {
      return "sheet";
    }
    if (this.el.hasAttribute("bottom-sheet")) {
      return "bottom-sheet";
    }
    if (this.el.hasAttribute("popover")) {
      return "popover";
    }
    if (this.el.hasAttribute("tooltip")) {
      return "tooltip";
    }
    if (this.el.hasAttribute("panel")) {
      return "panel";
    }
    return "dialog";
  }
  position() {
    const explicit = (this.el.getAttribute("position") || "").toLowerCase().replace(/\s+/g, "-");
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
    if (this.el.hasAttribute("left")) {
      return "left";
    }
    if (this.el.hasAttribute("right")) {
      return "right";
    }
    if (this.el.hasAttribute("top")) {
      return "top";
    }
    if (this.el.hasAttribute("bottom")) {
      return "bottom";
    }
    if (this.el.hasAttribute("center")) {
      return "center";
    }
    return "center";
  }
  get openState() {
    return this.el.hasAttribute("open");
  }
  shouldOpenByDefault() {
    return !this.el.hasAttribute("id");
  }
  syncRoot() {
    const root = this.el.shadowRoot?.querySelector(".root");
    if (!(root instanceof H)) {
      return;
    }
    if (!this.el.hasAttribute("open") && this.shouldOpenByDefault()) {
      this.el.setAttribute("open", "");
      return;
    }
    const isOpen = this.el.hasAttribute("open");
    const variant = this.variant();
    const position = this.position();
    root.setAttribute("data-open", isOpen ? "true" : "false");
    root.setAttribute("data-variant", variant);
    root.setAttribute("data-position", position);
    this.el.hidden = !isOpen;
    this.el.setAttribute("aria-hidden", String(!isOpen));
    this.el.setAttribute("role", variant === "tooltip" ? "tooltip" : "dialog");
    const lab = this.el.getAttribute("label");
    if (lab) {
      this.el.setAttribute("aria-label", lab);
    } else {
      this.el.removeAttribute("aria-label");
    }
  }
  componentDidRender() {
    this.syncRoot();
  }
  render() {
    return h(Host, { key: "e5fc44f1b0624864421e27b77750656713c51de5" }, h("div", { key: "f7e83a1dc53f02e9d8028af5ba039d52403ff3e0", class: "root", part: "root" }, h("div", { key: "9f7440a5555591c80b879fd18125c164422ea0b1", class: "backdrop", part: "backdrop", onClick: this.onBackdropClick }), h("div", { key: "bf2e4d14f4ef156e1f4e48f09b13a0d306356f6a", class: "panel", part: "panel" }, h("slot", { key: "6ca90122734dc973d8ede0dd090082b809dddb96" }))));
  }
  static get style() {
    return bfDialogCss();
  }
}, [257, "bf-dialog", {
  "open": [64],
  "close": [64],
  "toggle": [64]
}]);
function defineCustomElement$122() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-dialog"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-dialog":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfDialog$1);
        }
        break;
    }
  });
}
var defineCustomElement22 = defineCustomElement$122;

// dist/_stencil/bf-divider.js
var bfDividerCss = () => `:host{--bf-divider-border-color:var(--bf-theme-divider-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-divider-thickness:1px;--bf-divider-min-length:2rem;display:block}.root{box-sizing:border-box;border-radius:999px;background:var(--bf-divider-border-color);min-width:var(--bf-divider-min-length)}.root[data-orientation='horizontal']{height:var(--bf-divider-thickness);width:100%}.root[data-orientation='vertical']{width:var(--bf-divider-thickness);height:100%;min-height:var(--bf-divider-min-length);min-width:0}`;
var BfDivider$1 = /* @__PURE__ */ proxyCustomElement(class BfDivider extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "vertical", false);
    __publicField(this, "thickness");
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  applyThickness() {
    const raw = this.thickness;
    if (!raw) {
      this.el.style.removeProperty("--bf-divider-thickness");
      return;
    }
    const parsed = Number.parseFloat(raw);
    if (Number.isFinite(parsed)) {
      this.el.style.setProperty("--bf-divider-thickness", `${parsed}px`);
      return;
    }
    this.el.style.setProperty("--bf-divider-thickness", raw);
  }
  componentWillLoad() {
    this.applyThickness();
  }
  render() {
    const orient = this.vertical ? "vertical" : "horizontal";
    return h(Host, { key: "abba6c260fd9fb516da8b09e0f8d50e345949485" }, h("div", { key: "81c386d38ebec9ccadaf5f4facb2e2810413d42c", class: "root", part: "root", "data-orientation": orient }, h("slot", { key: "5b3f5418170d2400dfc8950cbfb1893235dd023c" })));
  }
  static get watchers() {
    return {
      "thickness": [{
        "applyThickness": 0
      }]
    };
  }
  static get style() {
    return bfDividerCss();
  }
}, [769, "bf-divider", {
  "vertical": [516],
  "thickness": [513]
}, void 0, {
  "thickness": [{
    "applyThickness": 0
  }]
}]);
function defineCustomElement$123() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-divider"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-divider":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfDivider$1);
        }
        break;
    }
  });
}
var defineCustomElement23 = defineCustomElement$123;

// dist/_stencil/bf-drawer.js
var bfDrawerCss = () => `:host{--bf-drawer-font:var(--bf-theme-font-family, inherit);--bf-drawer-bg:var(--bf-theme-drawer-bg, var(--bf-theme-surface-1, #ffffff));--bf-drawer-color:var(--bf-theme-drawer-color, var(--bf-theme-text-1, #0f172a));--bf-drawer-border-color:var(--bf-theme-drawer-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-drawer-backdrop:rgba(2, 6, 23, 0.35);--bf-drawer-width:min(90vw, 22rem);--bf-drawer-height:min(75vh, 24rem);--bf-drawer-shadow:0 18px 44px rgba(2, 6, 23, 0.28);display:block;font:var(--bf-drawer-font);z-index:1190}.root{position:fixed;inset:0;display:grid}.root[data-open='false']{display:none}.backdrop{position:absolute;inset:0;background:var(--bf-drawer-backdrop)}.panel{position:relative;background:var(--bf-drawer-bg);color:var(--bf-drawer-color);border:1px solid var(--bf-drawer-border-color);box-shadow:var(--bf-drawer-shadow);padding:1rem}.root[data-side='right']{justify-items:end}.root[data-side='right'] .panel{width:var(--bf-drawer-width);height:100%;border-radius:0}.root[data-side='left']{justify-items:start}.root[data-side='left'] .panel{width:var(--bf-drawer-width);height:100%;border-radius:0}.root[data-side='top']{align-items:start}.root[data-side='top'] .panel{width:100%;max-width:100%;height:var(--bf-drawer-height);border-radius:0 0 12px 12px}.root[data-side='bottom']{align-items:end}.root[data-side='bottom'] .panel{width:100%;max-width:100%;height:var(--bf-drawer-height);border-radius:12px 12px 0 0}`;
var BfDrawer$1 = /* @__PURE__ */ proxyCustomElement(class BfDrawer extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "observer");
    __publicField(this, "onBackdropClick", () => {
      if (this.el.hasAttribute("persistent")) {
        return;
      }
      this.el.removeAttribute("open");
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.syncRoot());
    this.observer.observe(this.el, {
      attributes: true,
      attributeFilter: ["open", "label", "persistent", "id", "side", "left", "right", "top", "bottom"]
    });
  }
  disconnectedCallback() {
    this.observer?.disconnect();
  }
  async open() {
    this.el.setAttribute("open", "");
  }
  async close() {
    this.el.removeAttribute("open");
  }
  async toggle() {
    if (this.el.hasAttribute("open")) {
      await this.close();
      return;
    }
    await this.open();
  }
  side() {
    const explicit = (this.el.getAttribute("side") || "").toLowerCase();
    if (["left", "right", "top", "bottom"].includes(explicit)) {
      return explicit;
    }
    if (this.el.hasAttribute("left")) {
      return "left";
    }
    if (this.el.hasAttribute("top")) {
      return "top";
    }
    if (this.el.hasAttribute("bottom")) {
      return "bottom";
    }
    return "right";
  }
  shouldOpenByDefault() {
    return !this.el.hasAttribute("id");
  }
  syncRoot() {
    const root = this.el.shadowRoot?.querySelector(".root");
    if (!(root instanceof H)) {
      return;
    }
    if (!this.el.hasAttribute("open") && this.shouldOpenByDefault()) {
      this.el.setAttribute("open", "");
      return;
    }
    const isOpen = this.el.hasAttribute("open");
    this.el.hidden = !isOpen;
    root.setAttribute("data-open", isOpen ? "true" : "false");
    root.setAttribute("data-side", this.side());
    this.el.setAttribute("aria-hidden", String(!isOpen));
    this.el.setAttribute("role", "dialog");
    const lab = this.el.getAttribute("label");
    if (lab) {
      this.el.setAttribute("aria-label", lab);
    } else {
      this.el.removeAttribute("aria-label");
    }
  }
  componentDidRender() {
    this.syncRoot();
  }
  render() {
    return h(Host, { key: "a826e6b8d6cb199a263cebc30eecbffa278a8bf9" }, h("div", { key: "044fb3bd50ef9123e9be5821c5be180b110f6d42", class: "root", part: "root" }, h("div", { key: "0b05601a224d69f3c935c577454548f05b08d954", class: "backdrop", part: "backdrop", onClick: this.onBackdropClick }), h("div", { key: "8772aadc936babd426af6fed05d4c523f5e76625", class: "panel", part: "panel" }, h("slot", { key: "9f185d32a1f28819e7a02bd1d4093c6f74a816b8" }))));
  }
  static get style() {
    return bfDrawerCss();
  }
}, [257, "bf-drawer", {
  "open": [64],
  "close": [64],
  "toggle": [64]
}]);
function defineCustomElement$124() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-drawer"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-drawer":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfDrawer$1);
        }
        break;
    }
  });
}
var defineCustomElement24 = defineCustomElement$124;

// dist/_stencil/bf-dropdown.js
var bfDropdownCss = () => `:host{--bf-dropdown-font:var(--bf-theme-font-family, inherit);--bf-dropdown-radius:var(--bf-theme-radius-md, 8px);--bf-dropdown-border-width:var(--bf-theme-border-width, 1px);--bf-dropdown-border-style:var(--bf-theme-border-style, solid);--bf-dropdown-border-color:var(--bf-theme-dropdown-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-dropdown-bg:var(--bf-theme-dropdown-bg, var(--bf-theme-surface-1, #ffffff));--bf-dropdown-color:var(--bf-theme-dropdown-color, var(--bf-theme-text-1, #0f172a));--bf-dropdown-muted:var(--bf-theme-text-2, #475569);--bf-dropdown-accent:var(--bf-theme-button-primary-bg, #2563eb);--bf-dropdown-padding-y:var(--bf-theme-space-2, 0.45rem);--bf-dropdown-padding-x:var(--bf-theme-space-3, 0.75rem);--bf-dropdown-shadow:0 14px 28px -18px rgba(2, 6, 23, 0.45);--bf-dropdown-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease),   transform 120ms ease,   opacity 120ms ease;display:inline-block;font:var(--bf-dropdown-font);color:var(--bf-dropdown-color);position:relative}.root{position:relative;color:var(--bf-dropdown-color)}.toggle{display:inline-flex;align-items:center;gap:0.45rem;border:0;border-radius:var(--bf-dropdown-radius);background:transparent;color:var(--bf-dropdown-color);padding:0;cursor:pointer;font:inherit;transition:var(--bf-dropdown-transition)}.root[data-bordered='true'] .toggle{border-width:var(--bf-dropdown-border-width);border-style:var(--bf-dropdown-border-style);border-color:var(--bf-dropdown-border-color);background:var(--bf-dropdown-bg);padding:var(--bf-dropdown-padding-y) var(--bf-dropdown-padding-x)}.root[data-bordered='true'] slot[name='trigger']::slotted(*){border:none !important;box-shadow:none !important;background:transparent !important}.toggle:hover{color:color-mix(in srgb, var(--bf-dropdown-accent) 70%, var(--bf-dropdown-color))}.toggle:focus-visible{outline:none;box-shadow:0 0 0 2px color-mix(in srgb, var(--bf-dropdown-accent) 36%, transparent)}.toggle-label{display:inline-flex;align-items:center;gap:0.35rem;min-height:1.75rem}.caret{font-size:0.75rem;color:var(--bf-dropdown-muted);transition:transform 140ms ease}.root[data-open='true'] .caret{transform:rotate(180deg)}.menu{position:absolute;min-width:100%;max-width:320px;z-index:60;border-width:var(--bf-dropdown-border-width);border-style:var(--bf-dropdown-border-style);border-color:var(--bf-dropdown-border-color);border-radius:calc(var(--bf-dropdown-radius) + 2px);background:var(--bf-dropdown-bg);box-shadow:var(--bf-dropdown-shadow);padding:0.35rem;overflow:auto;max-height:min(340px, 70vh);opacity:0;transform:translateY(-4px);pointer-events:none;transition:var(--bf-dropdown-transition)}.root[data-open='true'] .menu{opacity:1;transform:translateY(0);pointer-events:auto}.root[data-position='bottom-start'] .menu{left:0;top:calc(100% + 0.35rem)}.root[data-position='bottom-end'] .menu{right:0;top:calc(100% + 0.35rem)}.root[data-position='top-start'] .menu{left:0;bottom:calc(100% + 0.35rem)}.root[data-position='top-end'] .menu{right:0;bottom:calc(100% + 0.35rem)}.menu ::slotted([data-bf-dropdown-item]),.menu ::slotted([item]),.menu ::slotted(a),.menu ::slotted(button){display:flex;align-items:center;width:100%;gap:0.45rem;border:0;background:transparent;color:var(--bf-dropdown-color);text-decoration:none;border-radius:calc(var(--bf-dropdown-radius) - 2px);padding:0.5rem 0.6rem;cursor:pointer;text-align:left;font:inherit}.menu ::slotted(*)+::slotted(*){margin-top:0.15rem}.menu ::slotted([data-bf-dropdown-item]:hover),.menu ::slotted([item]:hover),.menu ::slotted(a:hover),.menu ::slotted(button:hover){background:color-mix(in srgb, var(--bf-dropdown-accent) 12%, transparent)}.menu ::slotted([data-bf-dropdown-item]:focus-visible),.menu ::slotted([item]:focus-visible),.menu ::slotted(a:focus-visible),.menu ::slotted(button:focus-visible){outline:none;box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--bf-dropdown-accent) 42%, transparent)}`;
var BfDropdown$1 = /* @__PURE__ */ proxyCustomElement(class BfDropdown extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "observer");
    __publicField(this, "toggleEl");
    __publicField(this, "menuEl");
    __publicField(this, "triggerSlotEl");
    __publicField(this, "contentSlotEl");
    __publicField(this, "boundDocClick", this.onDocumentClick.bind(this));
    __publicField(this, "onContentClick", (event) => {
      const from = event.target;
      if (!from || from.nodeType !== Node.ELEMENT_NODE) {
        return;
      }
      const closest = from.closest("[data-bf-dropdown-item]");
      if (!(closest instanceof H)) {
        return;
      }
      this.emitSelect(closest);
      void this.close();
    });
    __publicField(this, "onToggleClick", () => {
      void this.toggle();
      if (this.el.hasAttribute("open")) {
        requestAnimationFrame(() => this.focusFirstItem());
      }
    });
    __publicField(this, "onKeyDown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        void this.toggle();
        if (this.el.hasAttribute("open")) {
          requestAnimationFrame(() => this.focusFirstItem());
        }
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        void this.open();
        requestAnimationFrame(() => this.focusFirstItem());
        return;
      }
      if (event.key === "Escape") {
        void this.close();
        const t = this.toggleEl ?? this.el.shadowRoot?.querySelector(".toggle");
        t?.focus();
      }
    });
    __publicField(this, "onSlotChange", () => {
      this.assignSlots();
      this.decorateItems();
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    document.addEventListener("click", this.boundDocClick);
    this.observer = new MutationObserver(() => this.syncDom());
    this.observer.observe(this.el, {
      attributes: true,
      attributeFilter: ["open", "position", "border"]
    });
  }
  disconnectedCallback() {
    document.removeEventListener("click", this.boundDocClick);
    this.observer?.disconnect();
  }
  async open() {
    this.el.setAttribute("open", "");
  }
  async close() {
    this.el.removeAttribute("open");
  }
  async toggle() {
    if (this.el.hasAttribute("open")) {
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
    const hasTrigger = candidates.some((e) => e.getAttribute("slot") === "trigger");
    const hasContent = candidates.some((e) => e.getAttribute("slot") === "content");
    if (!hasTrigger) {
      candidates[0].setAttribute("slot", "trigger");
    }
    if (!hasContent) {
      for (let i = 1; i < candidates.length; i += 1) {
        candidates[i].setAttribute("slot", "content");
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
      item.setAttribute("data-bf-dropdown-item", "");
      if (item.hasAttribute("item") && !item.hasAttribute("role")) {
        item.setAttribute("role", "menuitem");
      }
      if (!item.hasAttribute("tabindex")) {
        item.setAttribute("tabindex", "0");
      }
      if (item.dataset.bfDropdownStyled !== "true") {
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.width = "100%";
        item.style.gap = "0.45rem";
        item.style.border = "0";
        item.style.background = "transparent";
        item.style.borderRadius = "0.4rem";
        item.style.padding = "0.5rem 0.6rem";
        item.style.cursor = "pointer";
        item.style.textAlign = "left";
        item.style.font = "inherit";
        item.style.color = "inherit";
        item.style.textDecoration = "none";
        item.dataset.bfDropdownStyled = "true";
      }
    }
  }
  focusFirstItem() {
    const items = this.actionableItemsComputed();
    const first = items.find((item) => !item.hasAttribute("disabled"));
    first?.focus();
  }
  emitSelect(target) {
    const value = target.getAttribute("value") || target.textContent?.trim() || "";
    this.el.dispatchEvent(new CustomEvent("bf-select", {
      bubbles: true,
      composed: true,
      detail: {
        id: target.id || "",
        value
      }
    }));
  }
  onDocumentClick(event) {
    if (!this.el.hasAttribute("open")) {
      return;
    }
    const path = event.composedPath();
    if (path.includes(this.el)) {
      return;
    }
    void this.close();
  }
  position() {
    const value = (this.el.getAttribute("position") || "bottom-start").toLowerCase();
    if (["bottom-start", "bottom-end", "top-start", "top-end"].includes(value)) {
      return value;
    }
    return "bottom-start";
  }
  syncDom() {
    const root = this.el.shadowRoot?.querySelector(".root") ?? void 0;
    const toggle = this.toggleEl ?? this.el.shadowRoot?.querySelector(".toggle");
    const menu = this.menuEl ?? this.el.shadowRoot?.querySelector(".menu");
    this.toggleEl = toggle instanceof H ? toggle : void 0;
    this.menuEl = menu instanceof H ? menu : null;
    if (!(root instanceof H) || !(toggle instanceof H) || !(menu instanceof H)) {
      return;
    }
    const open = this.el.hasAttribute("open");
    root.setAttribute("data-open", open ? "true" : "false");
    root.setAttribute("data-position", this.position());
    root.setAttribute("data-bordered", this.el.hasAttribute("border") ? "true" : "false");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-pressed", String(open));
    menu.hidden = !open;
  }
  bindChromeOnce() {
    const sr = this.el.shadowRoot;
    const toggle = sr?.querySelector(".toggle");
    const menu = sr?.querySelector(".menu");
    const ts = sr?.querySelector('slot[name="trigger"]');
    const cs = sr?.querySelector('slot[name="content"]');
    this.triggerSlotEl = ts instanceof HTMLSlotElement ? ts : null;
    this.contentSlotEl = cs instanceof HTMLSlotElement ? cs : null;
    if (toggle instanceof H && toggle.dataset.bfBound !== "true") {
      toggle.dataset.bfBound = "true";
      toggle.addEventListener("click", this.onToggleClick);
      toggle.addEventListener("keydown", this.onKeyDown);
      this.toggleEl = toggle;
    }
    if (menu instanceof H && menu.dataset.bfBound !== "true") {
      menu.dataset.bfBound = "true";
      menu.addEventListener("click", this.onContentClick);
      this.menuEl = menu;
    }
    if (ts instanceof HTMLSlotElement && ts.dataset.bfSlotBound !== "true") {
      ts.dataset.bfSlotBound = "true";
      ts.addEventListener("slotchange", this.onSlotChange);
    }
    if (cs instanceof HTMLSlotElement && cs.dataset.bfSlotBound !== "true") {
      cs.dataset.bfSlotBound = "true";
      cs.addEventListener("slotchange", this.onSlotChange);
    }
  }
  componentDidRender() {
    this.bindChromeOnce();
    this.assignSlots();
    this.decorateItems();
    this.syncDom();
  }
  render() {
    return h(Host, { key: "1a902e4e674f3f7e85350229df507887146f9fca" }, h("div", { key: "5a4a34cc9fc77e95c6d750693ef841b7a1a93682", class: "root", part: "root" }, h("div", { key: "cefed0181d394fef409349de202ec7f165b69ef9", class: "toggle", part: "toggle", role: "button", tabIndex: 0, "aria-haspopup": "menu", "aria-expanded": "false" }, h("span", { key: "24bffc644904e6105adbc5a0008b5220546cb228", class: "toggle-label" }, h("slot", { key: "47193b4592057f50b4530b89e436092f0db7db85", name: "trigger" }, "Open")), h("span", { key: "a1ebf796a069a5b63c6abdbd49f2066311948025", class: "caret", "aria-hidden": "true" }, "\u25BE")), h("div", { key: "2431a50c25834b98e122c24140f0f131936eb251", class: "menu", part: "menu", role: "menu" }, h("slot", { key: "2ce262a4707ad31cd4b5453519a51865be1dd4e6", name: "content" }))));
  }
  static get style() {
    return bfDropdownCss();
  }
}, [257, "bf-dropdown", {
  "open": [64],
  "close": [64],
  "toggle": [64]
}]);
function defineCustomElement$125() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-dropdown"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-dropdown":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfDropdown$1);
        }
        break;
    }
  });
}
var defineCustomElement25 = defineCustomElement$125;

// dist/_stencil/bf-edge.js
var bfEdgeCss = () => `:host{--bf-edge-font:var(--bf-theme-font-family, inherit);--bf-edge-radius:var(--bf-theme-radius-md, 8px);--bf-edge-border-width:var(--bf-theme-border-width, 1px);--bf-edge-border-style:var(--bf-theme-border-style, solid);--bf-edge-border-color:var(--bf-theme-header-border-color, var(--bf-theme-footer-border-color, var(--bf-theme-border-1, #cbd5e1)));--bf-edge-bg:var(--bf-theme-header-bg, var(--bf-theme-footer-bg, var(--bf-theme-surface-1, #ffffff)));--bf-edge-color:var(--bf-theme-header-color, var(--bf-theme-footer-color, var(--bf-theme-text-1, #0f172a)));--bf-edge-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-edge-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-edge-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-edge-font);color:var(--bf-edge-color)}.root{background:var(--bf-edge-bg);color:var(--bf-edge-color);border-width:var(--bf-edge-border-width);border-style:var(--bf-edge-border-style);border-color:var(--bf-edge-border-color);border-radius:var(--bf-edge-radius);padding:var(--bf-edge-padding-y) var(--bf-edge-padding-x);transition:var(--bf-edge-transition)}:host([sticky]){position:sticky;z-index:var(--bf-theme-z-sticky, 100)}:host([fixed]){position:fixed;left:0;right:0;z-index:var(--bf-theme-z-fixed, 200)}:host([header][sticky]),:host([header][fixed]){top:0;bottom:auto}:host([footer][sticky]),:host([footer][fixed]){bottom:0;top:auto}`;
var BfEdge$1 = /* @__PURE__ */ proxyCustomElement(class BfEdge extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "observer");
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.syncPosition());
    this.observer.observe(this.el, {
      attributes: true,
      attributeFilter: ["position", "sticky", "fixed", "header", "footer"]
    });
    this.syncPosition();
  }
  disconnectedCallback() {
    this.observer?.disconnect();
  }
  syncPosition() {
    if (!this.el.hasAttribute("header") && !this.el.hasAttribute("footer") && !this.el.getAttribute("position")) {
      this.el.setAttribute("header", "");
    }
    const position = this.el.getAttribute("position");
    if (position === "bottom") {
      this.el.removeAttribute("header");
      this.el.setAttribute("footer", "");
    }
    if (position === "top") {
      this.el.removeAttribute("footer");
      this.el.setAttribute("header", "");
    }
  }
  render() {
    return h(Host, { key: "cf2d17e9784639190363f1c078e16085425bb07d" }, h("div", { key: "43eb73645930c378d2627283327a92167ea48b76", class: "root", part: "root" }, h("slot", { key: "2b4e25884dbe6fa60716001ae77cdfcea7072818" })));
  }
  static get style() {
    return bfEdgeCss();
  }
}, [257, "bf-edge"]);
function defineCustomElement$126() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-edge"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-edge":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfEdge$1);
        }
        break;
    }
  });
}
var defineCustomElement26 = defineCustomElement$126;

// dist/_stencil/bf-editor.js
var bfEditorCss = () => `:host{--bf-editor-font:var(--bf-theme-font-family, inherit);--bf-editor-radius:var(--bf-theme-radius-md, 8px);--bf-editor-border-width:var(--bf-theme-border-width, 1px);--bf-editor-border-style:var(--bf-theme-border-style, solid);--bf-editor-border-color:var(--bf-theme-editor-border-color, #1f2937);--bf-editor-bg:var(--bf-theme-editor-bg, #000000);--bf-editor-color:var(--bf-theme-editor-color, #f8fafc);--bf-editor-muted:var(--bf-theme-editor-muted, #94a3b8);--bf-editor-code-bg:color-mix(in srgb, var(--bf-editor-bg) 94%, #111827 6%);--bf-editor-code-color:#e2e8f0;display:block;font:var(--bf-editor-font);color:var(--bf-editor-color)}.root{background:var(--bf-editor-bg);color:var(--bf-editor-color);border-width:var(--bf-editor-border-width);border-style:var(--bf-editor-border-style);border-color:var(--bf-editor-border-color);border-radius:var(--bf-editor-radius);overflow:hidden}.toolbar{display:none;gap:0.35rem;padding:0.5rem;border-bottom:1px solid var(--bf-editor-border-color);background:color-mix(in srgb, var(--bf-editor-bg) 92%, var(--bf-editor-border-color))}.toolbar button{border:1px solid var(--bf-editor-border-color);background:var(--bf-editor-bg);color:var(--bf-editor-color);border-radius:6px;padding:0.22rem 0.45rem;cursor:pointer;font:inherit;font-size:0.85rem}.code-wrap{display:grid;grid-template-columns:auto 1fr;min-height:220px;background:var(--bf-editor-code-bg)}.line-numbers{padding:0.8rem 0.55rem;margin:0;white-space:pre;line-height:1.45;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;font-size:0.85rem;color:color-mix(in srgb, var(--bf-editor-code-color) 55%, transparent);border-right:1px solid color-mix(in srgb, var(--bf-editor-border-color) 80%, transparent);user-select:none}.code{width:100%;min-height:220px;resize:vertical;padding:0.8rem;border:0;outline:0;background:transparent;color:var(--bf-editor-code-color);font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;font-size:0.9rem;line-height:1.45}.rich{display:none;min-height:220px;padding:0.8rem;outline:none;line-height:1.5}.rich:empty::before{content:attr(data-placeholder);color:var(--bf-editor-muted)}.root[data-variant='richtext'] .toolbar{display:flex}.root[data-variant='richtext'] .code-wrap{display:none}.root[data-variant='richtext'] .rich{display:block}:host([disabled]){opacity:0.72}:host([disabled]) .toolbar button{cursor:not-allowed}`;
var BfEditor$1 = /* @__PURE__ */ proxyCustomElement(class BfEditor extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "observer");
    __publicField(this, "root");
    __publicField(this, "toolbar");
    __publicField(this, "lineNumbers");
    __publicField(this, "code");
    __publicField(this, "rich");
    __publicField(this, "_lastSyncedValue", null);
    __publicField(this, "_hasUserInput", false);
    __publicField(this, "onInput", () => {
      const variant = this.variant();
      this._hasUserInput = true;
      if (variant === "code") {
        this.renderLineNumbers();
        this.el.setAttribute("value", this.code.value);
        this._lastSyncedValue = this.code.value;
        this.emitChange(this.code.value, "code");
        return;
      }
      this.el.setAttribute("value", this.rich.innerHTML);
      this._lastSyncedValue = this.rich.innerHTML;
      this.emitChange(this.rich.innerHTML, "richtext");
    });
    __publicField(this, "onToolbarClick", (event) => {
      const mx = event;
      const tgt = mx.target;
      if (!tgt || tgt.nodeType !== Node.ELEMENT_NODE) {
        return;
      }
      const button = tgt.closest("button[data-cmd]");
      if (!button || this.variant() !== "richtext" || this.el.hasAttribute("disabled")) {
        return;
      }
      const command = button.getAttribute("data-cmd");
      if (!command) {
        return;
      }
      this.rich.focus();
      document.execCommand(command, false);
      this.onInput();
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this.el, { attributes: true });
  }
  disconnectedCallback() {
    this.observer?.disconnect();
    const sr = this.el.shadowRoot;
    sr?.querySelector(".code")?.removeEventListener("input", this.onInput);
    sr?.querySelector(".rich")?.removeEventListener("input", this.onInput);
    sr?.querySelector(".toolbar")?.removeEventListener("click", this.onToolbarClick);
  }
  variant() {
    const explicit = (this.el.getAttribute("variant") || "").toLowerCase();
    if (explicit === "richtext" || this.el.hasAttribute("richtext")) {
      return "richtext";
    }
    if (explicit === "code" || this.el.hasAttribute("code")) {
      return "code";
    }
    return "code";
  }
  renderLineNumbers() {
    if (!this.lineNumbers || !this.code) {
      return;
    }
    const lineCount = Math.max(1, this.code.value.split("\n").length);
    const text = Array.from({ length: lineCount }, (_, i) => String(i + 1)).join("\n");
    this.lineNumbers.textContent = text;
  }
  emitChange(value, mode) {
    this.el.dispatchEvent(new CustomEvent("bf-change", {
      bubbles: true,
      composed: true,
      detail: { value, mode }
    }));
  }
  bindOnce() {
    const sr = this.el.shadowRoot;
    if (!sr) {
      return;
    }
    this.root = sr.querySelector(".root");
    this.toolbar = sr.querySelector(".toolbar");
    this.lineNumbers = sr.querySelector(".line-numbers");
    this.code = sr.querySelector(".code");
    this.rich = sr.querySelector(".rich");
    if (!this.code || !this.rich || !this.toolbar) {
      return;
    }
    if (this.code.dataset.bfBound !== "true") {
      this.code.dataset.bfBound = "true";
      this.code.addEventListener("input", this.onInput);
    }
    if (this.rich.dataset.bfBound !== "true") {
      this.rich.dataset.bfBound = "true";
      this.rich.addEventListener("input", this.onInput);
    }
    if (this.toolbar.dataset.bfBound !== "true") {
      this.toolbar.dataset.bfBound = "true";
      this.toolbar.addEventListener("click", this.onToolbarClick);
    }
  }
  sync() {
    this.bindOnce();
    if (!this.root || !this.code || !this.rich || !this.toolbar) {
      return;
    }
    const variant = this.variant();
    this.root.dataset.variant = variant;
    const disabled = this.el.hasAttribute("disabled");
    this.code.disabled = disabled;
    this.rich.setAttribute("contenteditable", disabled ? "false" : "true");
    const placeholder = this.el.getAttribute("placeholder") || (variant === "richtext" ? "Write rich content\u2026" : "Write code\u2026");
    this.code.placeholder = placeholder;
    this.rich.dataset.placeholder = placeholder;
    const value = this.el.getAttribute("value");
    if (value != null && this._lastSyncedValue !== value) {
      if (variant === "richtext") {
        this.rich.innerHTML = value;
      } else {
        this.code.value = value;
        this.renderLineNumbers();
      }
      this._lastSyncedValue = value;
    } else if (value == null && !this._hasUserInput) {
      const initial = this.el.textContent?.trim() || "";
      if (initial) {
        if (variant === "richtext") {
          this.rich.innerHTML = initial;
        } else {
          this.code.value = initial;
          this.renderLineNumbers();
        }
        this._hasUserInput = true;
      }
    }
    if (variant === "code") {
      this.renderLineNumbers();
    }
  }
  componentDidRender() {
    this.sync();
  }
  render() {
    return h(Host, { key: "6c1c84386f0e54a2fdfb4d8a0a0d192f98213be0" }, h("div", { key: "b315441e123c68e6dfcb15c42d888722b7922601", class: "root", part: "root" }, h("div", { key: "f34e8cb6636808329c81154912a15b1d47b66ca3", class: "toolbar", part: "toolbar" }, h("button", { key: "e39c28b32890dfb4b24a0958e3ba55b147266d98", type: "button", "data-cmd": "bold", title: "Bold" }, h("b", { key: "af724d795c2da6c3d63b183ef35bbb7dd923c9bd" }, "B")), h("button", { key: "732b1ec93dfde522ff14004b01fc79be0304db54", type: "button", "data-cmd": "italic", title: "Italic" }, h("i", { key: "09c8e81fa82cee5f72bd6c0795e8a49733551d21" }, "I")), h("button", { key: "5e9423829bbb568faa7e0e0b7104c8bcfa2123a2", type: "button", "data-cmd": "underline", title: "Underline" }, h("u", { key: "64cba130d6e5f9047bb4bed8ede70abfe1377232" }, "U")), h("button", { key: "86a15e53d17888c55aac605595bbd9d7fe39b2c6", type: "button", "data-cmd": "insertUnorderedList", title: "Bullet List" }, "\u2022 List"), h("button", { key: "434ff8a3460ecfd7463e04e1c49889a1a1643251", type: "button", "data-cmd": "insertOrderedList", title: "Numbered List" }, "1. List")), h("div", { key: "1d89518a0d9aa5aae0100af899942e5555454fab", class: "code-wrap", part: "code-wrap" }, h("div", { key: "788b02a133e37706e1118ff14af41f7470e8de42", class: "line-numbers", part: "line-numbers" }), h("textarea", { key: "32158466c8d427869284ad9e36875cb829afd920", class: "code", part: "code" })), h("div", { key: "6548164123609b9afd2f426aeee7930574fed26b", class: "rich", part: "rich", contentEditable: true })));
  }
  static get style() {
    return bfEditorCss();
  }
}, [1, "bf-editor"]);
function defineCustomElement$127() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-editor"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-editor":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfEditor$1);
        }
        break;
    }
  });
}
var defineCustomElement27 = defineCustomElement$127;

// dist/_stencil/bf-empty-state.js
var bfEmptyStateCss = () => `:host{--bf-empty-state-font:var(--bf-theme-font-family, inherit);--bf-empty-state-radius:var(--bf-theme-radius-md, 8px);--bf-empty-state-border-width:var(--bf-theme-border-width, 1px);--bf-empty-state-border-style:var(--bf-theme-border-style, solid);--bf-empty-state-border-color:var(--bf-theme-empty-state-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-empty-state-bg:var(--bf-theme-empty-state-bg, var(--bf-theme-surface-1, #ffffff));--bf-empty-state-color:var(--bf-theme-empty-state-color, var(--bf-theme-text-1, #0f172a));--bf-empty-state-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-empty-state-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-empty-state-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-empty-state-font);color:var(--bf-empty-state-color)}.root{background:var(--bf-empty-state-bg);color:var(--bf-empty-state-color);border-width:var(--bf-empty-state-border-width);border-style:var(--bf-empty-state-border-style);border-color:var(--bf-empty-state-border-color);border-radius:var(--bf-empty-state-radius);padding:var(--bf-empty-state-padding-y) var(--bf-empty-state-padding-x);transition:var(--bf-empty-state-transition)}`;
var BfEmptyState$1 = /* @__PURE__ */ proxyCustomElement(class BfEmptyState extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "d2271559139b3f3f87c3a6e8db138ddadbbe9d85" }, h("div", { key: "ab60697479be8a487a4ec320abc7959fdf80fabf", class: "root", part: "root" }, h("slot", { key: "cb8724e4044444d85abc1ad680285fdde67e0f25" })));
  }
  static get style() {
    return bfEmptyStateCss();
  }
}, [257, "bf-empty-state"]);
function defineCustomElement$128() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-empty-state"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-empty-state":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfEmptyState$1);
        }
        break;
    }
  });
}
var defineCustomElement28 = defineCustomElement$128;

// dist/_stencil/bf-error-summary.js
var bfErrorSummaryCss = () => `:host{--bf-error-summary-font:var(--bf-theme-font-family, inherit);--bf-error-summary-radius:var(--bf-theme-radius-md, 8px);--bf-error-summary-border-width:var(--bf-theme-border-width, 1px);--bf-error-summary-border-style:var(--bf-theme-border-style, solid);--bf-error-summary-border-color:var(--bf-theme-error-summary-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-error-summary-bg:var(--bf-theme-error-summary-bg, var(--bf-theme-surface-1, #ffffff));--bf-error-summary-color:var(--bf-theme-error-summary-color, var(--bf-theme-text-1, #0f172a));--bf-error-summary-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-error-summary-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-error-summary-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-error-summary-font);color:var(--bf-error-summary-color)}.root{background:var(--bf-error-summary-bg);color:var(--bf-error-summary-color);border-width:var(--bf-error-summary-border-width);border-style:var(--bf-error-summary-border-style);border-color:var(--bf-error-summary-border-color);border-radius:var(--bf-error-summary-radius);padding:var(--bf-error-summary-padding-y) var(--bf-error-summary-padding-x);transition:var(--bf-error-summary-transition)}`;
var BfErrorSummary$1 = /* @__PURE__ */ proxyCustomElement(class BfErrorSummary extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "a01a6f1fcd495fdfe20f52c2395b21f3e42fd144" }, h("div", { key: "8c838bfb767b278fdc0f37829621fe81131b29c5", class: "root", part: "root" }, h("slot", { key: "29211bdb96a67412d713be44d9b3be9200adf769" })));
  }
  static get style() {
    return bfErrorSummaryCss();
  }
}, [257, "bf-error-summary"]);
function defineCustomElement$129() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-error-summary"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-error-summary":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfErrorSummary$1);
        }
        break;
    }
  });
}
var defineCustomElement29 = defineCustomElement$129;

// dist/_stencil/bf-fab.js
var bfFabCss = () => `:host{--bf-fab-font:var(--bf-theme-font-family, inherit);--bf-fab-radius:var(--bf-theme-radius-md, 8px);--bf-fab-border-width:var(--bf-theme-border-width, 1px);--bf-fab-border-style:var(--bf-theme-border-style, solid);--bf-fab-border-color:var(--bf-theme-fab-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-fab-bg:var(--bf-theme-fab-bg, var(--bf-theme-surface-1, #ffffff));--bf-fab-color:var(--bf-theme-fab-color, var(--bf-theme-text-1, #0f172a));--bf-fab-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-fab-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-fab-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-fab-font);color:var(--bf-fab-color)}.root{background:var(--bf-fab-bg);color:var(--bf-fab-color);border-width:var(--bf-fab-border-width);border-style:var(--bf-fab-border-style);border-color:var(--bf-fab-border-color);border-radius:var(--bf-fab-radius);padding:var(--bf-fab-padding-y) var(--bf-fab-padding-x);transition:var(--bf-fab-transition)}`;
var BfFab$1 = /* @__PURE__ */ proxyCustomElement(class BfFab extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "0313c93da5a9c5ddf648a40eb254d017e4a1e4bf" }, h("div", { key: "bc773e9c5970e0a9628ea264af501a27c6f732d6", class: "root", part: "root" }, h("slot", { key: "88b6b4305a1685cfba7d796d875e1b2b2def45d1" })));
  }
  static get style() {
    return bfFabCss();
  }
}, [257, "bf-fab"]);
function defineCustomElement$130() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-fab"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-fab":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfFab$1);
        }
        break;
    }
  });
}
var defineCustomElement30 = defineCustomElement$130;

// dist/_stencil/bf-file-upload.js
var bfFileUploadCss = () => `:host{--bf-file-upload-font:var(--bf-theme-font-family, inherit);--bf-file-upload-radius:var(--bf-theme-radius-md, 8px);--bf-file-upload-border-width:var(--bf-theme-border-width, 1px);--bf-file-upload-border-style:var(--bf-theme-border-style, solid);--bf-file-upload-border-color:var(   --bf-theme-file-upload-border-color,   var(--bf-theme-upload-dropzone-border-color, var(--bf-theme-border-1, #cbd5e1))  );--bf-file-upload-bg:var(   --bf-theme-file-upload-bg,   var(--bf-theme-upload-dropzone-bg, var(--bf-theme-surface-1, #ffffff))  );--bf-file-upload-color:var(   --bf-theme-file-upload-color,   var(--bf-theme-upload-dropzone-color, var(--bf-theme-text-1, #0f172a))  );--bf-file-upload-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-file-upload-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-file-upload-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-file-upload-font);color:var(--bf-file-upload-color)}.root{display:grid;gap:0.45rem;background:var(--bf-file-upload-bg);color:var(--bf-file-upload-color);border-width:var(--bf-file-upload-border-width);border-style:var(--bf-file-upload-border-style);border-color:var(--bf-file-upload-border-color);border-radius:var(--bf-file-upload-radius);padding:var(--bf-file-upload-padding-y) var(--bf-file-upload-padding-x);transition:var(--bf-file-upload-transition);cursor:pointer}.root[data-variant='dropzone']{min-height:7rem;align-content:center;text-align:center}.root[data-border='dotted']{border-style:dotted}.root[data-border='dashed']{border-style:dashed}.root[data-drag='over']{background:color-mix(in srgb, var(--bf-file-upload-bg) 70%, var(--bf-file-upload-border-color))}.root[data-disabled='true']{opacity:0.65;cursor:not-allowed}.native{display:none}.label{font-weight:600}.meta{color:var(--bf-theme-text-2, #475569);font-size:0.9em}.files{display:flex;flex-wrap:wrap;gap:0.35rem}.file{display:inline-flex;align-items:center;gap:0.25rem;padding:0.2rem 0.45rem;border-radius:999px;border:1px solid color-mix(in srgb, var(--bf-file-upload-border-color) 90%, transparent);background:color-mix(in srgb, var(--bf-file-upload-bg) 82%, var(--bf-file-upload-border-color));font-size:0.82em}slot:not(:empty){display:block}`;
var BfFileUpload$1 = /* @__PURE__ */ proxyCustomElement(class BfFileUpload extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "observer");
    __publicField(this, "_selectedFiles", []);
    __publicField(this, "onRootClick", (event) => {
      const mx = event;
      if (this.el.hasAttribute("disabled")) {
        return;
      }
      const t = mx.target;
      if (!t || t.nodeType !== Node.ELEMENT_NODE) {
        return;
      }
      if (t.tagName.toLowerCase() === "a") {
        return;
      }
      const input = this.el.shadowRoot?.querySelector(".native");
      if (input instanceof HTMLInputElement) {
        input.click();
      }
    });
    __publicField(this, "onInputChange", () => {
      const input = this.el.shadowRoot?.querySelector(".native");
      if (input instanceof HTMLInputElement) {
        this.setFiles(input.files);
      }
    });
    __publicField(this, "onDragOver", (event) => {
      const dx = event;
      if (this.variant() !== "dropzone" || this.el.hasAttribute("disabled")) {
        return;
      }
      dx.preventDefault();
      const root = this.el.shadowRoot?.querySelector(".root");
      if (root instanceof H) {
        root.dataset.drag = "over";
      }
    });
    __publicField(this, "onDragLeave", () => {
      const root = this.el.shadowRoot?.querySelector(".root");
      if (root instanceof H) {
        root.dataset.drag = "off";
      }
    });
    __publicField(this, "onDrop", (event) => {
      const dx = event;
      if (this.variant() !== "dropzone" || this.el.hasAttribute("disabled")) {
        return;
      }
      dx.preventDefault();
      const root = this.el.shadowRoot?.querySelector(".root");
      if (root instanceof H) {
        root.dataset.drag = "off";
      }
      const list = dx.dataTransfer?.files;
      if (!list || list.length === 0) {
        return;
      }
      this.setFiles(list);
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this.el, { attributes: true });
  }
  variant() {
    const explicit = (this.el.getAttribute("variant") || "").toLowerCase();
    if (explicit === "dropzone" || this.el.hasAttribute("dropzone")) {
      return "dropzone";
    }
    return "input";
  }
  emitChange(payload) {
    this.el.dispatchEvent(new CustomEvent("bf-change", {
      bubbles: true,
      composed: true,
      detail: payload
    }));
  }
  setFiles(fileList) {
    const input = this.el.shadowRoot?.querySelector(".native");
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const all = Array.from(fileList || []);
    this._selectedFiles = input.multiple ? all : all.slice(0, 1);
    const meta = this.el.shadowRoot?.querySelector(".meta");
    const filesWrap = this.el.shadowRoot?.querySelector(".files");
    if (!(meta instanceof H) || !(filesWrap instanceof H)) {
      return;
    }
    meta.textContent = this._selectedFiles.length ? `${this._selectedFiles.length} file${this._selectedFiles.length === 1 ? "" : "s"} selected` : input.multiple ? "No files selected" : "No file selected";
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
    filesWrap.replaceChildren(...chips);
    this.emitChange({
      count: this._selectedFiles.length,
      files: this._selectedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    });
  }
  sync() {
    const root = this.el.shadowRoot?.querySelector(".root");
    const input = this.el.shadowRoot?.querySelector(".native");
    const labelEl = this.el.shadowRoot?.querySelector(".label");
    const meta = this.el.shadowRoot?.querySelector(".meta");
    const filesWrap = this.el.shadowRoot?.querySelector(".files");
    if (!(root instanceof H) || !(input instanceof HTMLInputElement) || !(labelEl instanceof H) || !(meta instanceof H) || !(filesWrap instanceof H)) {
      return;
    }
    const variant = this.variant();
    root.dataset.variant = variant;
    root.dataset.border = this.el.hasAttribute("dotted") ? "dotted" : this.el.hasAttribute("dashed") ? "dashed" : "solid";
    const disabled = this.el.hasAttribute("disabled");
    root.dataset.disabled = disabled ? "true" : "false";
    input.disabled = disabled;
    if (this.el.hasAttribute("multiple")) {
      input.multiple = true;
      root.dataset.multiple = "true";
    } else {
      input.multiple = false;
      root.dataset.multiple = "false";
    }
    const accept = this.el.getAttribute("accept") || "";
    if (accept) {
      input.setAttribute("accept", accept);
    } else {
      input.removeAttribute("accept");
    }
    labelEl.textContent = this.el.getAttribute("label") || (variant === "dropzone" ? "Drop files here or click to browse" : "Choose file");
    if (!this._selectedFiles || this._selectedFiles.length === 0) {
      meta.textContent = input.multiple ? "No files selected" : "No file selected";
      filesWrap.replaceChildren();
    }
  }
  componentDidRender() {
    const root = this.el.shadowRoot?.querySelector(".root");
    const input = this.el.shadowRoot?.querySelector(".native");
    if (root && input instanceof HTMLInputElement && input.dataset.bfBound !== "true") {
      input.dataset.bfBound = "true";
      root.addEventListener("click", this.onRootClick);
      input.addEventListener("change", this.onInputChange);
      root.addEventListener("dragover", this.onDragOver);
      root.addEventListener("dragleave", this.onDragLeave);
      root.addEventListener("drop", this.onDrop);
    }
    this.sync();
  }
  disconnectedCallback() {
    const root = this.el.shadowRoot?.querySelector(".root");
    const input = this.el.shadowRoot?.querySelector(".native");
    root?.removeEventListener("click", this.onRootClick);
    root?.removeEventListener("dragover", this.onDragOver);
    root?.removeEventListener("dragleave", this.onDragLeave);
    root?.removeEventListener("drop", this.onDrop);
    input?.removeEventListener("change", this.onInputChange);
    this.observer?.disconnect();
  }
  render() {
    return h(Host, { key: "27e2c6339d3ab7b827d3f9c08bfaea420c3cd042" }, h("div", { key: "e75af05549804d9a1656f7c56fb6852ae2a59def", class: "root", part: "root" }, h("input", { key: "af1c7bb9efb3e42fadeedf5afb30eecb4dcf0508", class: "native", type: "file" }), h("div", { key: "c31055b5e6c79fa893e47fb1368299b65f934359", class: "label", part: "label" }), h("div", { key: "38ede9fbd7b00abe42e215ad1ac8684cde4ae5f1", class: "meta", part: "meta" }), h("div", { key: "a0c968b0c39757e9ac38a624e036e9fe42a3438f", class: "files", part: "files" }), h("slot", { key: "98266e9f48ada8d4294cadf95ac426759299e4a6" })));
  }
  static get style() {
    return bfFileUploadCss();
  }
}, [257, "bf-file-upload"]);
function defineCustomElement$131() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-file-upload"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-file-upload":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfFileUpload$1);
        }
        break;
    }
  });
}
var defineCustomElement31 = defineCustomElement$131;

// dist/_stencil/bf-filter-bar.js
var bfFilterBarCss = () => `:host{--bf-filter-bar-font:var(--bf-theme-font-family, inherit);--bf-filter-bar-radius:var(--bf-theme-radius-md, 8px);--bf-filter-bar-border-width:var(--bf-theme-border-width, 1px);--bf-filter-bar-border-style:var(--bf-theme-border-style, solid);--bf-filter-bar-border-color:var(--bf-theme-filter-bar-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-filter-bar-bg:var(--bf-theme-filter-bar-bg, var(--bf-theme-surface-1, #ffffff));--bf-filter-bar-color:var(--bf-theme-filter-bar-color, var(--bf-theme-text-1, #0f172a));--bf-filter-bar-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-filter-bar-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-filter-bar-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-filter-bar-font);color:var(--bf-filter-bar-color)}.root{background:var(--bf-filter-bar-bg);color:var(--bf-filter-bar-color);border-width:var(--bf-filter-bar-border-width);border-style:var(--bf-filter-bar-border-style);border-color:var(--bf-filter-bar-border-color);border-radius:var(--bf-filter-bar-radius);padding:var(--bf-filter-bar-padding-y) var(--bf-filter-bar-padding-x);transition:var(--bf-filter-bar-transition)}`;
var BfFilterBar$1 = /* @__PURE__ */ proxyCustomElement(class BfFilterBar extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "7691c031164ca6e503c36fd733c64cf5013879b9" }, h("div", { key: "f198feaec9800b933ce7ded726cb43dd5abefdbb", class: "root", part: "root" }, h("slot", { key: "2658bacd2ae5fa9dccc4d749bdaf124f822dbc20" })));
  }
  static get style() {
    return bfFilterBarCss();
  }
}, [257, "bf-filter-bar"]);
function defineCustomElement$132() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-filter-bar"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-filter-bar":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfFilterBar$1);
        }
        break;
    }
  });
}
var defineCustomElement32 = defineCustomElement$132;

// dist/_stencil/bf-footer.js
var bfFooterCss = () => `:host{--bf-footer-font:var(--bf-theme-font-family, inherit);--bf-footer-radius:var(--bf-theme-radius-md, 8px);--bf-footer-border-width:var(--bf-theme-border-width, 1px);--bf-footer-border-style:var(--bf-theme-border-style, solid);--bf-footer-border-color:var(--bf-theme-border-1, #cbd5e1);--bf-footer-bg:var(--bf-theme-surface-2, #f8fafc);--bf-footer-color:var(--bf-theme-text-2, #475569);--bf-footer-padding-y:var(--bf-theme-space-2, 0.65rem);--bf-footer-padding-x:var(--bf-theme-space-3, 1.1rem);display:block;font:var(--bf-footer-font);color:var(--bf-footer-color)}:host([sticky]) .root{position:sticky;bottom:0;z-index:20}.root{box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--bf-footer-padding-x);width:100%;padding:var(--bf-footer-padding-y) var(--bf-footer-padding-x);background:var(--bf-footer-bg);color:var(--bf-footer-color);border-radius:var(--bf-footer-radius);border-width:var(--bf-footer-border-width);border-style:var(--bf-footer-border-style);border-color:var(--bf-footer-border-color);font-size:0.9rem;min-height:2.75rem}`;
var BfFooter$1 = /* @__PURE__ */ proxyCustomElement(class BfFooter extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "sticky", false);
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "4436fdc3409fe0f1791a8369ed020b23dcaafd8e" }, h("footer", { key: "2d4a5645ca720f2e2c26e36773250d04fc06c1da", class: "root", part: "root" }, h("slot", { key: "efc8b11885d5adbe3ae40ed0ad159658889bad7e" })));
  }
  static get style() {
    return bfFooterCss();
  }
}, [769, "bf-footer", {
  "sticky": [516]
}]);
function defineCustomElement$133() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-footer"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-footer":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfFooter$1);
        }
        break;
    }
  });
}
var defineCustomElement33 = defineCustomElement$133;

// dist/_stencil/bf-form-field.js
var bfFormFieldCss = () => `:host{--bf-form-field-font:var(--bf-theme-font-family, inherit);--bf-form-field-radius:var(--bf-theme-radius-md, 8px);--bf-form-field-border-width:var(--bf-theme-border-width, 1px);--bf-form-field-border-style:var(--bf-theme-border-style, solid);--bf-form-field-border-color:var(--bf-theme-form-field-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-form-field-bg:var(--bf-theme-form-field-bg, var(--bf-theme-surface-1, #ffffff));--bf-form-field-color:var(--bf-theme-form-field-color, var(--bf-theme-text-1, #0f172a));--bf-form-field-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-form-field-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-form-field-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-form-field-font);color:var(--bf-form-field-color)}.root{background:var(--bf-form-field-bg);color:var(--bf-form-field-color);border-width:var(--bf-form-field-border-width);border-style:var(--bf-form-field-border-style);border-color:var(--bf-form-field-border-color);border-radius:var(--bf-form-field-radius);padding:var(--bf-form-field-padding-y) var(--bf-form-field-padding-x);transition:var(--bf-form-field-transition)}`;
var BfFormField$1 = /* @__PURE__ */ proxyCustomElement(class BfFormField extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "ba70d54a11a0533436bc1e5132576f2a36e095ab" }, h("div", { key: "aba6f00a53dbb2f2f737c466ac5752621d2b75f0", class: "root", part: "root" }, h("slot", { key: "66cc627d25c4b8bf310136292fbcfc57d737676c" })));
  }
  static get style() {
    return bfFormFieldCss();
  }
}, [257, "bf-form-field"]);
function defineCustomElement$134() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-form-field"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-form-field":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfFormField$1);
        }
        break;
    }
  });
}
var defineCustomElement34 = defineCustomElement$134;

// dist/_stencil/bf-grid.js
var bfGridCss = () => `:host{--bf-grid-font:var(--bf-theme-font-family, inherit);--bf-grid-radius:var(--bf-theme-radius-md, 8px);--bf-grid-border-width:var(--bf-theme-border-width, 1px);--bf-grid-border-style:var(--bf-theme-border-style, solid);--bf-grid-border-color:var(--bf-theme-grid-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-grid-bg:var(--bf-theme-grid-bg, var(--bf-theme-surface-1, #ffffff));--bf-grid-color:var(--bf-theme-grid-color, var(--bf-theme-text-1, #0f172a));--bf-grid-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-grid-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-grid-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-grid-font);color:var(--bf-grid-color)}.root{background:var(--bf-grid-bg);color:var(--bf-grid-color);border-width:var(--bf-grid-border-width);border-style:var(--bf-grid-border-style);border-color:var(--bf-grid-border-color);border-radius:var(--bf-grid-radius);padding:var(--bf-grid-padding-y) var(--bf-grid-padding-x);transition:var(--bf-grid-transition)}`;
var BfGrid$1 = /* @__PURE__ */ proxyCustomElement(class BfGrid extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "9f1f3e118dabd307aac371ad0b8a624e03f89c38" }, h("div", { key: "53144e3947dd0bfd5026d59d3e6c8e634ece92c8", class: "root", part: "root" }, h("slot", { key: "6c7e353b73d9c3d33122fd8c6d4e73fe9057a4f2" })));
  }
  static get style() {
    return bfGridCss();
  }
}, [257, "bf-grid"]);
function defineCustomElement$135() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-grid"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-grid":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfGrid$1);
        }
        break;
    }
  });
}
var defineCustomElement35 = defineCustomElement$135;

// dist/_stencil/bf-header.js
var bfHeaderCss = () => `:host{--bf-header-font:var(--bf-theme-font-family, inherit);--bf-header-radius:var(--bf-theme-radius-md, 8px);--bf-header-border-width:var(--bf-theme-border-width, 1px);--bf-header-border-style:var(--bf-theme-border-style, solid);--bf-header-border-color:var(--bf-theme-border-1, #cbd5e1);--bf-header-bg:var(--bf-theme-surface-1, #ffffff);--bf-header-color:var(--bf-theme-text-1, #0f172a);--bf-header-padding-y:var(--bf-theme-space-3, 0.9rem);--bf-header-padding-x:var(--bf-theme-space-3, 1.1rem);display:block;font:var(--bf-header-font);color:var(--bf-header-color)}:host([sticky]) .root{position:sticky;top:0;z-index:20}.root{box-sizing:border-box;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--bf-header-padding-x);width:100%;padding:var(--bf-header-padding-y) var(--bf-header-padding-x);background:var(--bf-header-bg);color:var(--bf-header-color);border-radius:var(--bf-header-radius);border-width:var(--bf-header-border-width);border-style:var(--bf-header-border-style);border-color:var(--bf-header-border-color);min-height:3rem}::slotted(*){flex:0 0 auto}`;
var BfHeader$1 = /* @__PURE__ */ proxyCustomElement(class BfHeader extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "sticky", false);
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "ade101c5af649e0ed8f0f8593dc1064abe67f27d" }, h("header", { key: "25e73f4a9d0cc1dee95a1ac248c0f499be6f79e6", class: "root", part: "root" }, h("slot", { key: "b5e86ee30e99d7f6f3dc69412e93fc6eee085b8a" })));
  }
  static get style() {
    return bfHeaderCss();
  }
}, [769, "bf-header", {
  "sticky": [516]
}]);
function defineCustomElement$136() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-header"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-header":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfHeader$1);
        }
        break;
    }
  });
}
var defineCustomElement36 = defineCustomElement$136;

// dist/_stencil/bf-hero.js
var bfHeroCss = () => `:host{--bf-hero-font:var(--bf-theme-font-family, inherit);--bf-hero-radius:var(--bf-theme-radius-md, 8px);--bf-hero-border-width:var(--bf-theme-border-width, 1px);--bf-hero-border-style:var(--bf-theme-border-style, solid);--bf-hero-border-color:var(--bf-theme-hero-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-hero-bg:var(--bf-theme-hero-bg, var(--bf-theme-surface-1, #ffffff));--bf-hero-color:var(--bf-theme-hero-color, var(--bf-theme-text-1, #0f172a));--bf-hero-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-hero-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-hero-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-hero-font);color:var(--bf-hero-color)}.root{background:var(--bf-hero-bg);color:var(--bf-hero-color);border-width:var(--bf-hero-border-width);border-style:var(--bf-hero-border-style);border-color:var(--bf-hero-border-color);border-radius:var(--bf-hero-radius);padding:var(--bf-hero-padding-y) var(--bf-hero-padding-x);transition:var(--bf-hero-transition)}`;
var BfHero$1 = /* @__PURE__ */ proxyCustomElement(class BfHero extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "8f3b081e76e3403ee2e9e74f4f80ba2c02fd666f" }, h("div", { key: "15c351f6f09e3f9628101b537737167f5c50566e", class: "root", part: "root" }, h("slot", { key: "7016ccc5ac8777dcadc8cdd3eb115d616ca0415f" })));
  }
  static get style() {
    return bfHeroCss();
  }
}, [257, "bf-hero"]);
function defineCustomElement$137() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-hero"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-hero":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfHero$1);
        }
        break;
    }
  });
}
var defineCustomElement37 = defineCustomElement$137;

// dist/_stencil/bf-icon.js
var bfIconCss = () => `:host{--bf-icon-font:var(--bf-theme-font-family, inherit);--bf-icon-radius:var(--bf-theme-radius-md, 8px);--bf-icon-border-width:var(--bf-theme-border-width, 1px);--bf-icon-border-style:var(--bf-theme-border-style, solid);--bf-icon-border-color:var(--bf-theme-icon-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-icon-bg:var(--bf-theme-icon-bg, var(--bf-theme-surface-1, #ffffff));--bf-icon-color:var(--bf-theme-icon-color, var(--bf-theme-text-1, #0f172a));--bf-icon-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-icon-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-icon-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-icon-font);color:var(--bf-icon-color)}.root{background:var(--bf-icon-bg);color:var(--bf-icon-color);border-width:var(--bf-icon-border-width);border-style:var(--bf-icon-border-style);border-color:var(--bf-icon-border-color);border-radius:var(--bf-icon-radius);padding:var(--bf-icon-padding-y) var(--bf-icon-padding-x);transition:var(--bf-icon-transition)}`;
var BfIcon$1 = /* @__PURE__ */ proxyCustomElement(class BfIcon extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "f754c35086d39d1c75957d5ef448b3d359efc5e5" }, h("div", { key: "74c139c35a6224666676b52dd5a830f9e99a10a5", class: "root", part: "root" }, h("slot", { key: "3a4fd3db6cdc2b01c84aa0763273ef5ebcc43f26" })));
  }
  static get style() {
    return bfIconCss();
  }
}, [257, "bf-icon"]);
function defineCustomElement$138() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-icon"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-icon":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfIcon$1);
        }
        break;
    }
  });
}
var defineCustomElement38 = defineCustomElement$138;

// dist/_stencil/bf-image.js
var bfImageCss = () => `:host{--bf-image-font:var(--bf-theme-font-family, inherit);--bf-image-radius:var(--bf-theme-radius-md, 8px);--bf-image-border-width:var(--bf-theme-border-width, 1px);--bf-image-border-style:var(--bf-theme-border-style, solid);--bf-image-border-color:var(--bf-theme-image-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-image-bg:var(--bf-theme-image-bg, var(--bf-theme-surface-1, #ffffff));--bf-image-color:var(--bf-theme-image-color, var(--bf-theme-text-1, #0f172a));--bf-image-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-image-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-image-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-image-font);color:var(--bf-image-color)}.root{background:var(--bf-image-bg);color:var(--bf-image-color);border-width:var(--bf-image-border-width);border-style:var(--bf-image-border-style);border-color:var(--bf-image-border-color);border-radius:var(--bf-image-radius);padding:var(--bf-image-padding-y) var(--bf-image-padding-x);transition:var(--bf-image-transition)}`;
var BfImage$1 = /* @__PURE__ */ proxyCustomElement(class BfImage extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "51b42da5a9d93c80653a75bbec9064af978e0ccd" }, h("div", { key: "7aa6c152d9c3b5c4d4157465ec51f0daf5ab4d76", class: "root", part: "root" }, h("slot", { key: "0a0cbc20ce48b7d263c63b5ae731c4ed43234f99" })));
  }
  static get style() {
    return bfImageCss();
  }
}, [257, "bf-image"]);
function defineCustomElement$139() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-image"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-image":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfImage$1);
        }
        break;
    }
  });
}
var defineCustomElement39 = defineCustomElement$139;

// dist/_stencil/bf-input.js
var bfInputCss = () => `:host{--bf-input-font:var(--bf-theme-font-family, inherit);--bf-input-radius:var(--bf-theme-radius-md, 8px);--bf-input-border-width:var(--bf-theme-border-width, 1px);--bf-input-border-style:var(--bf-theme-border-style, solid);--bf-input-border-color:var(--bf-theme-input-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-input-bg:var(--bf-theme-input-bg, var(--bf-theme-surface-1, #ffffff));--bf-input-color:var(--bf-theme-input-color, var(--bf-theme-text-1, #0f172a));--bf-input-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-input-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-input-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-input-font);color:var(--bf-input-color)}.root{display:flex;align-items:center;gap:0.5rem;background:var(--bf-input-bg);color:var(--bf-input-color);border-width:var(--bf-input-border-width);border-style:var(--bf-input-border-style);border-color:var(--bf-input-border-color);border-radius:var(--bf-input-radius);padding:var(--bf-input-padding-y) var(--bf-input-padding-x);transition:var(--bf-input-transition)}.field{width:100%;min-width:0;border:0;outline:0;background:transparent;color:inherit;font:inherit;padding:0}.swatch,.format{display:none}.root.is-color .swatch,.root.is-color .format{display:inline-flex}.swatch{width:1.25rem;height:1.25rem;border:1px solid var(--bf-theme-border-1, #94a3b8);border-radius:4px;cursor:pointer;flex:0 0 auto}.format{border:0;outline:0;background:transparent;color:inherit;font:inherit;cursor:pointer;flex:0 0 auto}.picker{position:absolute;opacity:0;pointer-events:none;width:0;height:0}.root.is-color.swatch-right .swatch{order:3}.root.is-color.swatch-hidden .swatch{display:none}`;
var BfInput$1 = /* @__PURE__ */ proxyCustomElement(class BfInput extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "skipHostValueObserve", false);
    __publicField(this, "color", { r: 0, g: 0, b: 0, a: 1 });
    __publicField(this, "colorFormat", "hex");
    __publicField(this, "mutation");
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.mutation = new MutationObserver((records) => {
      let sawHostValue = false;
      for (const r of records) {
        if (r.attributeName === "value") {
          sawHostValue = true;
        }
      }
      if (sawHostValue && this.skipHostValueObserve) {
        this.skipHostValueObserve = false;
        return;
      }
      this.syncHost();
    });
    this.mutation.observe(this.el, {
      attributes: true,
      attributeFilter: [
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
      ]
    });
    queueMicrotask(() => {
      if (!this.el.hasAttribute("value")) {
        const fb = this.el.textContent?.trim();
        if (fb) {
          this.el.setAttribute("value", fb);
        }
      }
      this.syncHost();
    });
  }
  disconnectedCallback() {
    this.mutation?.disconnect();
  }
  get value() {
    const f = this.el.shadowRoot?.querySelector(".field");
    return f instanceof HTMLInputElement ? f.value : "";
  }
  set value(nextValue) {
    this.el.setAttribute("value", `${nextValue ?? ""}`);
  }
  componentDidRender() {
    const sr = this.el.shadowRoot;
    if (!sr) {
      return;
    }
    this.attachListeners(sr);
    this.syncHost();
  }
  attachListeners(sr) {
    const field = sr.querySelector(".field");
    const fmtEl = sr.querySelector(".format");
    const picker = sr.querySelector(".picker");
    const swatch = sr.querySelector(".swatch");
    if (field instanceof HTMLInputElement && field.dataset.bfBound !== "true") {
      field.dataset.bfBound = "true";
      field.addEventListener("input", () => this.onFieldInput(sr));
      field.addEventListener("change", () => this.onFieldChange(sr));
    }
    if (fmtEl instanceof HTMLSelectElement && fmtEl.dataset.bfBound !== "true") {
      fmtEl.dataset.bfBound = "true";
      fmtEl.addEventListener("change", () => this.onFmtChange(sr));
    }
    if (picker instanceof HTMLInputElement && picker.dataset.bfBound !== "true") {
      picker.dataset.bfBound = "true";
      picker.addEventListener("input", () => this.onPickerInput(sr));
    }
    if (swatch instanceof HTMLButtonElement && swatch.dataset.bfBound !== "true") {
      swatch.dataset.bfBound = "true";
      swatch.addEventListener("click", () => this.onSwatch(sr));
    }
  }
  field(sr) {
    const x = sr.querySelector(".field");
    return x instanceof HTMLInputElement ? x : void 0;
  }
  reflectValueAttr(field) {
    const next = field.value;
    if (this.el.getAttribute("value") === next) {
      return;
    }
    this.skipHostValueObserve = true;
    this.el.setAttribute("value", next);
  }
  dispatchInput(sr) {
    const f = this.field(sr);
    this.el.dispatchEvent(new CustomEvent("bf-input", {
      bubbles: true,
      composed: true,
      detail: { value: f.value }
    }));
  }
  dispatchChange(sr) {
    const f = this.field(sr);
    this.el.dispatchEvent(new CustomEvent("bf-change", {
      bubbles: true,
      composed: true,
      detail: { value: f.value }
    }));
  }
  onFieldInput(sr) {
    const f = this.field(sr);
    if (!f) {
      return;
    }
    if (this.typeIsColor()) {
      this.consumeColor(String(f.value));
    }
    this.reflectValueAttr(f);
    this.dispatchInput(sr);
  }
  onFieldChange(sr) {
    const f = this.field(sr);
    const root = sr.querySelector(".root");
    if (!f || !(root instanceof H)) {
      return;
    }
    if (this.typeIsColor()) {
      if (!this.consumeColor(String(f.value))) {
        f.value = this.serialize(this.colorFormat, this.color);
      }
      this.paintColorChrome(sr, root, f);
    }
    this.reflectValueAttr(f);
    this.dispatchChange(sr);
  }
  onFmtChange(sr) {
    const fmt = sr.querySelector(".format");
    const field = this.field(sr);
    if (!(fmt instanceof HTMLSelectElement) || !field) {
      return;
    }
    if (!this.typeIsColor()) {
      return;
    }
    this.colorFormat = fmt.value;
    field.value = this.serialize(this.colorFormat, this.color);
    this.reflectValueAttr(field);
  }
  onPickerInput(sr) {
    const picker = sr.querySelector(".picker");
    const field = this.field(sr);
    const root = sr.querySelector(".root");
    if (!(picker instanceof HTMLInputElement) || !field || !(root instanceof H)) {
      return;
    }
    if (!this.typeIsColor()) {
      return;
    }
    const px = this.parseHex(picker.value);
    if (!px) {
      return;
    }
    this.color = { ...px, a: this.color.a };
    field.value = this.serialize(this.colorFormat, this.color);
    this.paintColorChrome(sr, root, field);
    this.reflectValueAttr(field);
    this.dispatchInput(sr);
  }
  onSwatch(sr) {
    const picker = sr.querySelector(".picker");
    if (!this.typeIsColor() || this.el.hasAttribute("disabled")) {
      return;
    }
    if (picker instanceof HTMLInputElement) {
      picker.click();
    }
  }
  typeIsColor() {
    return (this.el.getAttribute("type") || "text").toLowerCase() === "color";
  }
  allowedFormats() {
    const hasHex = this.el.hasAttribute("hex");
    const hasRgba = this.el.hasAttribute("rgba");
    if (hasHex && hasRgba) {
      return ["hex", "rgba"];
    }
    if (hasHex) {
      return ["hex"];
    }
    if (hasRgba) {
      return ["rgba"];
    }
    const explicit = (this.el.getAttribute("format") || "").toLowerCase();
    if (explicit === "hex") {
      return ["hex"];
    }
    if (explicit === "rgba") {
      return ["rgba"];
    }
    return ["hex", "rgba"];
  }
  resolveFormat(allowed) {
    const explicit = (this.el.getAttribute("format") || "").toLowerCase();
    if (allowed.includes(explicit)) {
      return explicit;
    }
    if (allowed.includes(this.colorFormat)) {
      return this.colorFormat;
    }
    return allowed[0] || "hex";
  }
  swatchPos() {
    const explicit = (this.el.getAttribute("swatch") || "").toLowerCase();
    if (explicit === "left" || explicit === "right" || explicit === "hidden") {
      return explicit;
    }
    if (this.el.hasAttribute("swatch-hidden")) {
      return "hidden";
    }
    if (this.el.hasAttribute("right")) {
      return "right";
    }
    if (this.el.hasAttribute("left")) {
      return "left";
    }
    return "left";
  }
  normHex(hexValue) {
    return this.serialize("hex", this.parseHex(hexValue) || this.color);
  }
  paintColorChrome(sr, root, field) {
    const fmt = sr.querySelector(".format");
    const picker = sr.querySelector(".picker");
    const swatch = sr.querySelector(".swatch");
    if (!(fmt instanceof HTMLSelectElement) || !(picker instanceof HTMLInputElement) || !(swatch instanceof HTMLButtonElement)) {
      return;
    }
    const pos = this.swatchPos();
    const allowed = this.allowedFormats();
    this.colorFormat = this.resolveFormat(allowed);
    root.classList.add("is-color");
    root.classList.toggle("swatch-right", pos === "right");
    root.classList.toggle("swatch-hidden", pos === "hidden");
    fmt.innerHTML = allowed.map((v) => `<option value="${v}">${v.toUpperCase()}</option>`).join("");
    fmt.value = this.colorFormat;
    fmt.hidden = allowed.length <= 1;
    picker.value = this.normHex(this.serialize("hex", this.color));
    swatch.style.background = this.serialize("rgba", this.color);
    field.value = this.serialize(this.colorFormat, this.color);
  }
  clearColorChrome(root) {
    root.classList.remove("is-color", "swatch-right", "swatch-hidden");
  }
  clampCh(v) {
    return Math.min(255, Math.max(0, v));
  }
  clampA(v) {
    return Math.min(1, Math.max(0, v));
  }
  parseHex(value) {
    const raw = `${value || ""}`.trim().replace(/^#/, "");
    if (!raw) {
      return null;
    }
    if (raw.length === 3 || raw.length === 4) {
      const r = Number.parseInt(raw[0] + raw[0], 16);
      const g = Number.parseInt(raw[1] + raw[1], 16);
      const b = Number.parseInt(raw[2] + raw[2], 16);
      const a = raw.length === 4 ? Number.parseInt(raw[3] + raw[3], 16) / 255 : 1;
      if ([r, g, b, a].some((x) => Number.isNaN(x))) {
        return null;
      }
      return { r, g, b, a };
    }
    if (raw.length === 6 || raw.length === 8) {
      const r = Number.parseInt(raw.slice(0, 2), 16);
      const g = Number.parseInt(raw.slice(2, 4), 16);
      const b = Number.parseInt(raw.slice(4, 6), 16);
      const a = raw.length === 8 ? Number.parseInt(raw.slice(6, 8), 16) / 255 : 1;
      if ([r, g, b, a].some((x) => Number.isNaN(x))) {
        return null;
      }
      return { r, g, b, a };
    }
    return null;
  }
  parseRgba(value) {
    const m = `${value || ""}`.trim().match(/^rgba?\(\s*([^\)]+)\s*\)$/i);
    if (!m) {
      return null;
    }
    const parts = m[1].split(",").map((p) => p.trim());
    if (parts.length !== 3 && parts.length !== 4) {
      return null;
    }
    const r = Number.parseFloat(parts[0]);
    const g = Number.parseFloat(parts[1]);
    const b = Number.parseFloat(parts[2]);
    const a = parts.length === 4 ? Number.parseFloat(parts[3]) : 1;
    if ([r, g, b, a].some((x) => Number.isNaN(x))) {
      return null;
    }
    return {
      r: this.clampCh(r),
      g: this.clampCh(g),
      b: this.clampCh(b),
      a: this.clampA(a)
    };
  }
  consumeColor(value) {
    const h2 = this.parseHex(value);
    if (h2) {
      this.color = h2;
      return true;
    }
    const rgba = this.parseRgba(value);
    if (rgba) {
      this.color = rgba;
      return true;
    }
    return false;
  }
  hexCh(v) {
    return Math.round(this.clampCh(v)).toString(16).padStart(2, "0");
  }
  alphaStr(value) {
    const rounded = Math.round(this.clampA(value) * 1e3) / 1e3;
    return `${rounded}`;
  }
  serialize(fmt, c) {
    if (fmt === "rgba") {
      return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${this.alphaStr(c.a)})`;
    }
    return `#${this.hexCh(c.r)}${this.hexCh(c.g)}${this.hexCh(c.b)}`;
  }
  syncHost() {
    const sr = this.el.shadowRoot;
    const root = sr?.querySelector(".root");
    const field = sr?.querySelector(".field");
    if (!(root instanceof H) || !(field instanceof HTMLInputElement)) {
      return;
    }
    const type = (this.el.getAttribute("type") || "text").toLowerCase();
    const value = this.el.getAttribute("value") || "";
    field.type = type === "color" ? "text" : type;
    field.value = value;
    field.placeholder = this.el.getAttribute("placeholder") || "";
    field.disabled = this.el.hasAttribute("disabled");
    field.required = this.el.hasAttribute("required");
    field.readOnly = this.el.hasAttribute("readonly");
    field.name = this.el.getAttribute("name") || "";
    field.min = this.el.getAttribute("min") || "";
    field.max = this.el.getAttribute("max") || "";
    field.step = this.el.getAttribute("step") || "";
    const lab = this.el.getAttribute("label");
    if (lab) {
      field.setAttribute("aria-label", lab);
    } else {
      field.removeAttribute("aria-label");
    }
    if (type === "color") {
      if (!this.consumeColor(value) && !value) {
        this.color = { r: 0, g: 0, b: 0, a: 1 };
      }
      this.paintColorChrome(sr, root, field);
      field.value = this.serialize(this.colorFormat, this.color);
      this.reflectValueAttr(field);
    } else {
      this.clearColorChrome(root);
    }
  }
  render() {
    return h(Host, { key: "0f46012ecc46350faada566d017c13feda76e326" }, h("div", { key: "0224dfad923eebf77776993781b3430b54178912", class: "root", part: "root" }, h("button", { key: "8a3048026b335c1058c9a7cdd401e3e1aae66271", class: "swatch", part: "swatch", type: "button", "aria-label": "Pick color" }), h("input", { key: "bd52c70a64486e7acdee7b683fc602ce2bd30dc3", class: "field", part: "input" }), h("select", { key: "0aa3646fa6f3b29b6be13628ecb436c67ba70368", class: "format", part: "format", "aria-label": "Color format" }, h("option", { key: "6cf6f6dd173f65792ec77bcb55ba4bae3a3d1ca3", value: "hex" }, "HEX"), h("option", { key: "63efc93a20ed11362a43647c31ed607e815c85e7", value: "rgba" }, "RGBA")), h("input", { key: "4f187260c17ec17315989f14fb5f5dff46f6e80b", class: "picker", part: "picker", type: "color", tabIndex: -1, "aria-hidden": "true" })));
  }
  static get style() {
    return bfInputCss();
  }
}, [1, "bf-input"]);
function defineCustomElement$140() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-input"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-input":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfInput$1);
        }
        break;
    }
  });
}
var defineCustomElement40 = defineCustomElement$140;

// dist/_stencil/bf-key-value-list.js
var bfKeyValueListCss = () => `:host{--bf-key-value-list-font:var(--bf-theme-font-family, inherit);--bf-key-value-list-radius:var(--bf-theme-radius-md, 8px);--bf-key-value-list-border-width:var(--bf-theme-border-width, 1px);--bf-key-value-list-border-style:var(--bf-theme-border-style, solid);--bf-key-value-list-border-color:var(--bf-theme-key-value-list-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-key-value-list-bg:var(--bf-theme-key-value-list-bg, var(--bf-theme-surface-1, #ffffff));--bf-key-value-list-color:var(--bf-theme-key-value-list-color, var(--bf-theme-text-1, #0f172a));--bf-key-value-list-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-key-value-list-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-key-value-list-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-key-value-list-font);color:var(--bf-key-value-list-color)}.root{background:var(--bf-key-value-list-bg);color:var(--bf-key-value-list-color);border-width:var(--bf-key-value-list-border-width);border-style:var(--bf-key-value-list-border-style);border-color:var(--bf-key-value-list-border-color);border-radius:var(--bf-key-value-list-radius);padding:var(--bf-key-value-list-padding-y) var(--bf-key-value-list-padding-x);transition:var(--bf-key-value-list-transition)}`;
var BfKeyValueList$1 = /* @__PURE__ */ proxyCustomElement(class BfKeyValueList extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "eacd9ed4cb4747140f2b68ce6f8b707cd6f410f1" }, h("div", { key: "2d1d025e3c002b6e00ec5b74d23fcf8f12719ceb", class: "root", part: "root" }, h("slot", { key: "7d9225ba0db22a0d52334224e02918cf533c46e5" })));
  }
  static get style() {
    return bfKeyValueListCss();
  }
}, [257, "bf-key-value-list"]);
function defineCustomElement$141() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-key-value-list"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-key-value-list":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfKeyValueList$1);
        }
        break;
    }
  });
}
var defineCustomElement41 = defineCustomElement$141;

// dist/_stencil/bf-link.js
var bfLinkCss = () => `:host{--bf-link-font:var(--bf-theme-font-family, inherit);--bf-link-radius:var(--bf-theme-radius-md, 10px);--bf-link-border-width:var(--bf-theme-border-width, 1px);--bf-link-border-style:var(--bf-theme-border-style, solid);--bf-link-border-color:var(--bf-theme-link-border-color, color-mix(in srgb, var(--bf-theme-border-1, #cbd5e1) 80%, transparent));--bf-link-bg:var(--bf-theme-link-bg, transparent);--bf-link-color:var(--bf-theme-link-color, var(--bf-theme-text-1, #0f172a));--bf-link-muted-color:var(--bf-theme-link-muted-color, var(--bf-theme-text-2, #475569));--bf-link-accent:var(--bf-theme-link-accent, var(--bf-theme-button-primary-bg, #2563eb));--bf-link-padding-y:var(--bf-theme-space-2, 0.45rem);--bf-link-padding-x:var(--bf-theme-space-3, 0.7rem);--bf-link-gap:var(--bf-theme-space-2, 0.45rem);--bf-link-transition:background-color 140ms ease, color 140ms ease, border-color 140ms ease;display:inline-block;font:var(--bf-link-font);color:var(--bf-link-color)}.root{display:flex;flex-wrap:wrap;align-items:center;gap:var(--bf-link-gap);background:var(--bf-link-bg);color:var(--bf-link-color);transition:var(--bf-link-transition)}.root[data-vertical]{flex-direction:column;align-items:stretch}.root[data-variant='inline']{padding:0}.root[data-variant='pill']{border-width:var(--bf-link-border-width);border-style:var(--bf-link-border-style);border-color:var(--bf-link-border-color);border-radius:calc(var(--bf-link-radius) + 999px);padding:0.35rem;background:color-mix(in srgb, var(--bf-theme-surface-1, #ffffff) 85%, transparent)}.root[data-variant='nav']{border-width:var(--bf-link-border-width);border-style:var(--bf-link-border-style);border-color:var(--bf-link-border-color);border-radius:var(--bf-link-radius);padding:0.4rem;background:color-mix(in srgb, var(--bf-theme-surface-1, #ffffff) 92%, transparent)}.root ::slotted(a),.root ::slotted([role='link']){color:var(--bf-link-muted-color);text-decoration:none;padding:var(--bf-link-padding-y) var(--bf-link-padding-x);border-radius:calc(var(--bf-link-radius) - 2px);display:inline-flex;align-items:center;gap:0.35rem;outline:none;transition:var(--bf-link-transition)}.root[data-variant='inline'] ::slotted(a),.root[data-variant='inline'] ::slotted([role='link']){padding:0;border-radius:0;text-decoration:underline;text-underline-offset:0.18em;text-decoration-color:color-mix(in srgb, var(--bf-link-muted-color) 45%, transparent)}.root ::slotted(a:hover),.root ::slotted([role='link']:hover){background:color-mix(in srgb, var(--bf-link-accent) 10%, transparent);color:var(--bf-link-color)}.root[data-variant='inline'] ::slotted(a:hover),.root[data-variant='inline'] ::slotted([role='link']:hover){background:transparent;color:var(--bf-link-accent);text-decoration-color:currentColor}.root ::slotted(a:focus-visible),.root ::slotted([role='link']:focus-visible){box-shadow:0 0 0 2px color-mix(in srgb, var(--bf-link-accent) 35%, transparent)}.root ::slotted(a[aria-current='page']),.root ::slotted(a[active]),.root ::slotted([role='link'][aria-current='page']),.root ::slotted([role='link'][active]){background:color-mix(in srgb, var(--bf-link-accent) 16%, transparent);color:var(--bf-link-color);font-weight:600}.root[data-variant='inline'] ::slotted(a[aria-current='page']),.root[data-variant='inline'] ::slotted(a[active]),.root[data-variant='inline'] ::slotted([role='link'][aria-current='page']),.root[data-variant='inline'] ::slotted([role='link'][active]){background:transparent;color:var(--bf-link-accent)}`;
var BfLink$1 = /* @__PURE__ */ proxyCustomElement(class BfLink extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "variant", "inline");
    __publicField(this, "vertical", false);
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  applyRoot() {
    const root = this.el.shadowRoot?.querySelector(".root");
    if (!(root instanceof H)) {
      return;
    }
    const v = (this.variant || "inline").toLowerCase();
    root.setAttribute("data-variant", ["inline", "pill", "nav"].includes(v) ? v : "inline");
    root.toggleAttribute("data-vertical", this.vertical);
  }
  componentDidRender() {
    this.applyRoot();
  }
  render() {
    return h(Host, { key: "58a70e0e013d74f3bcc2545c597365bb0849fa25" }, h("div", { key: "885cffdc3c7554f79cfb4a6867eac0218a215211", class: "root", part: "root" }, h("slot", { key: "7beca110d851087913fef0dbdc809e9bf5ababec" })));
  }
  static get watchers() {
    return {
      "variant": [{
        "applyRoot": 0
      }],
      "vertical": [{
        "applyRoot": 0
      }]
    };
  }
  static get style() {
    return bfLinkCss();
  }
}, [769, "bf-link", {
  "variant": [513],
  "vertical": [516]
}, void 0, {
  "variant": [{
    "applyRoot": 0
  }],
  "vertical": [{
    "applyRoot": 0
  }]
}]);
function defineCustomElement$142() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-link"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-link":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfLink$1);
        }
        break;
    }
  });
}
var defineCustomElement42 = defineCustomElement$142;

// dist/_stencil/bf-list.js
var bfListCss = () => `:host{--bf-list-font:var(--bf-theme-font-family, inherit);--bf-list-radius:var(--bf-theme-radius-md, 8px);--bf-list-border-width:var(--bf-theme-border-width, 1px);--bf-list-border-style:var(--bf-theme-border-style, solid);--bf-list-border-color:var(--bf-theme-list-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-list-bg:var(--bf-theme-list-bg, var(--bf-theme-surface-1, #ffffff));--bf-list-color:var(--bf-theme-list-color, var(--bf-theme-text-1, #0f172a));--bf-list-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-list-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-list-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-list-font);color:var(--bf-list-color)}.root{background:var(--bf-list-bg);color:var(--bf-list-color);border-width:var(--bf-list-border-width);border-style:var(--bf-list-border-style);border-color:var(--bf-list-border-color);border-radius:var(--bf-list-radius);padding:var(--bf-list-padding-y) var(--bf-list-padding-x);transition:var(--bf-list-transition)}.root ::slotted([item]){display:block;padding:0.45rem 0.6rem;border-radius:0.4rem;cursor:pointer}.root ::slotted([item]:hover){background:var(--bf-theme-surface-2, #f8fafc)}`;
var BfList$1 = /* @__PURE__ */ proxyCustomElement(class BfList extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "onSlotChange", () => {
      const slot = this.el.shadowRoot?.querySelector("slot");
      if (!(slot instanceof HTMLSlotElement)) {
        return;
      }
      const items = slot.assignedElements({ flatten: true }).filter((element) => element.hasAttribute("item"));
      items.forEach((item, index) => {
        const elitem = item;
        elitem.setAttribute("role", elitem.getAttribute("role") || "listitem");
        if (!elitem.hasAttribute("tabindex")) {
          elitem.setAttribute("tabindex", "0");
        }
        if (elitem.dataset.bfListBound === "true") {
          return;
        }
        elitem.dataset.bfListBound = "true";
        elitem.addEventListener("click", () => this.emitSelect(elitem, index));
        elitem.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.emitSelect(elitem, index);
          }
        });
      });
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  emitSelect(item, index) {
    this.el.dispatchEvent(new CustomEvent("bf-select", {
      bubbles: true,
      composed: true,
      detail: {
        index,
        id: item.id || "",
        value: item.getAttribute("value") || item.textContent?.trim() || ""
      }
    }));
  }
  componentDidLoad() {
    this.onSlotChange();
  }
  render() {
    return h(Host, { key: "d22f090361749616d3ea4f06993b22159180a571" }, h("div", { key: "4d137149589f2b9165ba1a78f60eb134d0bc8309", class: "root", part: "root" }, h("slot", { key: "962253909c7cdc6b27d3316aa2daa97493accde1", onSlotchange: this.onSlotChange })));
  }
  static get style() {
    return bfListCss();
  }
}, [257, "bf-list"]);
function defineCustomElement$143() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-list"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-list":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfList$1);
        }
        break;
    }
  });
}
var defineCustomElement43 = defineCustomElement$143;

// dist/_stencil/bf-loading-indicator.js
var bfLoadingIndicatorCss = () => `:host{--bf-loading-indicator-font:var(--bf-theme-font-family, inherit);--bf-loading-indicator-radius:var(--bf-theme-radius-md, 8px);--bf-loading-indicator-border-width:var(--bf-theme-border-width, 1px);--bf-loading-indicator-border-style:var(--bf-theme-border-style, solid);--bf-loading-indicator-border-color:var(--bf-theme-loading-indicator-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-loading-indicator-bg:var(--bf-theme-loading-indicator-bg, var(--bf-theme-surface-1, #ffffff));--bf-loading-indicator-color:var(--bf-theme-loading-indicator-color, var(--bf-theme-text-1, #0f172a));--bf-loading-indicator-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-loading-indicator-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-loading-indicator-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-loading-indicator-font);color:var(--bf-loading-indicator-color)}.root{background:var(--bf-loading-indicator-bg);color:var(--bf-loading-indicator-color);border-width:var(--bf-loading-indicator-border-width);border-style:var(--bf-loading-indicator-border-style);border-color:var(--bf-loading-indicator-border-color);border-radius:var(--bf-loading-indicator-radius);padding:var(--bf-loading-indicator-padding-y) var(--bf-loading-indicator-padding-x);transition:var(--bf-loading-indicator-transition)}`;
var BfLoadingIndicator$1 = /* @__PURE__ */ proxyCustomElement(class BfLoadingIndicator extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "a52aa77a78095ca159c54aab320190ce9912d1a4" }, h("div", { key: "3b3ec635b40a84f5520d6b1c04ee83360673b1e9", class: "root", part: "root" }, h("slot", { key: "b36a15ff8ab24777799d1e74919f846330c757d3" })));
  }
  static get style() {
    return bfLoadingIndicatorCss();
  }
}, [257, "bf-loading-indicator"]);
function defineCustomElement$144() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-loading-indicator"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-loading-indicator":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfLoadingIndicator$1);
        }
        break;
    }
  });
}
var defineCustomElement44 = defineCustomElement$144;

// dist/_stencil/bf-map.js
var bfMapCss = () => `:host{--bf-map-font:var(--bf-theme-font-family, inherit);--bf-map-radius:var(--bf-theme-radius-md, 8px);--bf-map-border-width:var(--bf-theme-border-width, 1px);--bf-map-border-style:var(--bf-theme-border-style, solid);--bf-map-border-color:var(--bf-theme-map-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-map-bg:var(--bf-theme-map-bg, var(--bf-theme-surface-1, #ffffff));--bf-map-color:var(--bf-theme-map-color, var(--bf-theme-text-1, #0f172a));--bf-map-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-map-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-map-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-map-font);color:var(--bf-map-color)}.root{background:var(--bf-map-bg);color:var(--bf-map-color);border-width:var(--bf-map-border-width);border-style:var(--bf-map-border-style);border-color:var(--bf-map-border-color);border-radius:var(--bf-map-radius);padding:var(--bf-map-padding-y) var(--bf-map-padding-x);transition:var(--bf-map-transition)}`;
var BfMap$1 = /* @__PURE__ */ proxyCustomElement(class BfMap extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "70f0c5a18d1eebe393ca08e2181b825397036807" }, h("div", { key: "3f9adb042684b4cd879cd6135c9362f94ae7a52d", class: "root", part: "root" }, h("slot", { key: "a715f31a388896512f8a0dbfc02d6ffc634c2849" })));
  }
  static get style() {
    return bfMapCss();
  }
}, [257, "bf-map"]);
function defineCustomElement$145() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-map"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-map":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfMap$1);
        }
        break;
    }
  });
}
var defineCustomElement45 = defineCustomElement$145;

// dist/_stencil/bf-menu.js
var bfMenuCss = () => `:host{--bf-menu-font:var(--bf-theme-font-family, inherit);--bf-menu-radius:var(--bf-theme-radius-md, 8px);--bf-menu-border-width:var(--bf-theme-border-width, 1px);--bf-menu-border-style:var(--bf-theme-border-style, solid);--bf-menu-border-color:var(--bf-theme-menu-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-menu-bg:var(--bf-theme-menu-bg, var(--bf-theme-surface-1, #ffffff));--bf-menu-color:var(--bf-theme-menu-color, var(--bf-theme-text-1, #0f172a));--bf-menu-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-menu-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-menu-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-menu-font);color:var(--bf-menu-color)}.root{background:var(--bf-menu-bg);color:var(--bf-menu-color);border-width:var(--bf-menu-border-width);border-style:var(--bf-menu-border-style);border-color:var(--bf-menu-border-color);border-radius:var(--bf-menu-radius);padding:var(--bf-menu-padding-y) var(--bf-menu-padding-x);transition:var(--bf-menu-transition)}.root[data-variant='context'][data-open='false']{display:none}.root[data-variant='context']{min-width:11rem;box-shadow:0 14px 36px rgba(2, 6, 23, 0.2)}.root ::slotted([item]){display:block;padding:0.45rem 0.6rem;border-radius:0.4rem;cursor:pointer}.root ::slotted([item]:hover){background:var(--bf-theme-surface-2, #f8fafc)}`;
var BfMenu$1 = /* @__PURE__ */ proxyCustomElement(class BfMenu extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "observer");
    __publicField(this, "attrObserver");
    __publicField(this, "ctxHandler");
    __publicField(this, "ctxTarget");
    __publicField(this, "onDocumentClick", (event) => {
      if (!this.isContextMode() || !this.el.hasAttribute("open")) {
        return;
      }
      const path = event.composedPath();
      if (path.includes(this.el)) {
        return;
      }
      this.el.removeAttribute("open");
    });
    __publicField(this, "onSlotChange", () => {
      const slot = this.el.shadowRoot?.querySelector("slot");
      if (!(slot instanceof HTMLSlotElement)) {
        return;
      }
      const items = slot.assignedElements({ flatten: true }).filter((element) => element.hasAttribute("item"));
      items.forEach((item, index) => {
        const elitem = item;
        elitem.setAttribute("role", elitem.getAttribute("role") || "menuitem");
        if (!elitem.hasAttribute("tabindex")) {
          elitem.setAttribute("tabindex", "0");
        }
        if (elitem.dataset.bfMenuBound === "true") {
          return;
        }
        elitem.dataset.bfMenuBound = "true";
        elitem.addEventListener("click", () => this.emitSelect(elitem, index));
        elitem.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.emitSelect(elitem, index);
          }
        });
      });
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    document.addEventListener("click", this.onDocumentClick);
    this.observer = new MutationObserver(() => this.bindContextTarget());
    this.observer.observe(this.el, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["variant", "context", "for", "open", "x", "y"]
    });
    this.attrObserver = new MutationObserver(() => this.sync());
    this.attrObserver.observe(this.el, {
      attributes: true,
      attributeFilter: ["variant", "open", "x", "y", "context", "for"]
    });
    this.bindContextTarget();
  }
  disconnectedCallback() {
    document.removeEventListener("click", this.onDocumentClick);
    this.observer?.disconnect();
    this.attrObserver?.disconnect();
    this.unbindCtx();
  }
  async open() {
    this.el.setAttribute("open", "");
  }
  async close() {
    this.el.removeAttribute("open");
  }
  async toggle() {
    if (this.el.hasAttribute("open")) {
      await this.close();
      return;
    }
    await this.open();
  }
  isContextMode() {
    const variant = (this.el.getAttribute("variant") || "").toLowerCase();
    return variant === "context" || this.el.hasAttribute("context");
  }
  unbindCtx() {
    if (this.ctxTarget && this.ctxTarget instanceof H && this.ctxHandler) {
      this.ctxTarget.removeEventListener("contextmenu", this.ctxHandler);
    }
    this.ctxTarget = null;
    this.ctxHandler = void 0;
  }
  bindContextTarget() {
    this.unbindCtx();
    if (!this.isContextMode()) {
      return;
    }
    const targetId = this.el.getAttribute("for");
    this.ctxTarget = targetId ? document.getElementById(targetId) : this.el.parentElement;
    if (!(this.ctxTarget instanceof H)) {
      return;
    }
    this.ctxHandler = (event) => {
      event.preventDefault();
      this.el.setAttribute("x", `${event.clientX}`);
      this.el.setAttribute("y", `${event.clientY}`);
      this.el.setAttribute("open", "");
      this.sync();
    };
    this.ctxTarget.addEventListener("contextmenu", this.ctxHandler);
  }
  emitSelect(item, index) {
    this.el.dispatchEvent(new CustomEvent("bf-select", {
      bubbles: true,
      composed: true,
      detail: {
        index,
        id: item.id || "",
        value: item.getAttribute("value") || item.textContent?.trim() || ""
      }
    }));
    if (this.isContextMode()) {
      this.el.removeAttribute("open");
    }
  }
  sync() {
    const root = this.el.shadowRoot?.querySelector(".root");
    if (!(root instanceof H)) {
      return;
    }
    const context = this.isContextMode();
    root.setAttribute("data-variant", context ? "context" : "menu");
    root.setAttribute("data-open", this.el.hasAttribute("open") ? "true" : "false");
    if (context) {
      this.el.style.position = "fixed";
      this.el.style.left = `${Number.parseFloat(this.el.getAttribute("x") || "0") || 0}px`;
      this.el.style.top = `${Number.parseFloat(this.el.getAttribute("y") || "0") || 0}px`;
      this.el.style.zIndex = "1300";
    } else {
      this.el.style.position = "";
      this.el.style.left = "";
      this.el.style.top = "";
      this.el.style.zIndex = "";
    }
  }
  componentDidRender() {
    this.sync();
  }
  render() {
    return h(Host, { key: "566459d9a96e926bf61a36546bad7a24604f6ef8" }, h("div", { key: "5605b5063829f5be87f2ccfebbfbc1dfc8685e41", class: "root", part: "root" }, h("slot", { key: "1db6ad6bbf32d4ffdcb964fab2f7a85066d53a82", onSlotchange: this.onSlotChange })));
  }
  static get style() {
    return bfMenuCss();
  }
}, [257, "bf-menu", {
  "open": [64],
  "close": [64],
  "toggle": [64]
}]);
function defineCustomElement$146() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-menu"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-menu":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfMenu$1);
        }
        break;
    }
  });
}
var defineCustomElement46 = defineCustomElement$146;

// dist/_stencil/bf-message.js
var bfMessageCss = () => `:host{--bf-message-font:var(--bf-theme-font-family, inherit);--bf-message-radius:var(--bf-theme-radius-md, 8px);--bf-message-border-width:var(--bf-theme-border-width, 1px);--bf-message-border-style:var(--bf-theme-border-style, solid);--bf-message-border-color:var(--bf-theme-message-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-message-bg:var(--bf-theme-message-bg, var(--bf-theme-surface-1, #ffffff));--bf-message-color:var(--bf-theme-message-color, var(--bf-theme-text-1, #0f172a));--bf-message-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-message-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-message-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-message-font);color:var(--bf-message-color)}.root{background:var(--bf-message-bg);color:var(--bf-message-color);border-width:var(--bf-message-border-width);border-style:var(--bf-message-border-style);border-color:var(--bf-message-border-color);border-radius:var(--bf-message-radius);padding:var(--bf-message-padding-y) var(--bf-message-padding-x);transition:var(--bf-message-transition)}`;
var BfMessage$1 = /* @__PURE__ */ proxyCustomElement(class BfMessage extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "4740ddf4ee4e1ea5a3a93cf1e21e56059e12d0f8" }, h("div", { key: "d66fdd8812b630e1d2d93c89ae808f6d75d09d78", class: "root", part: "root" }, h("slot", { key: "a66a76afd51168446a9c7d49ee70013e581efb64" })));
  }
  static get style() {
    return bfMessageCss();
  }
}, [257, "bf-message"]);
function defineCustomElement$147() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-message"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-message":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfMessage$1);
        }
        break;
    }
  });
}
var defineCustomElement47 = defineCustomElement$147;

// dist/_stencil/bf-metric-card.js
var bfMetricCardCss = () => `:host{--bf-metric-card-font:var(--bf-theme-font-family, inherit);--bf-metric-card-radius:var(--bf-theme-radius-md, 8px);--bf-metric-card-border-width:var(--bf-theme-border-width, 1px);--bf-metric-card-border-style:var(--bf-theme-border-style, solid);--bf-metric-card-border-color:var(--bf-theme-metric-card-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-metric-card-bg:var(--bf-theme-metric-card-bg, var(--bf-theme-surface-1, #ffffff));--bf-metric-card-color:var(--bf-theme-metric-card-color, var(--bf-theme-text-1, #0f172a));--bf-metric-card-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-metric-card-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-metric-card-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-metric-card-font);color:var(--bf-metric-card-color)}.root{background:var(--bf-metric-card-bg);color:var(--bf-metric-card-color);border-width:var(--bf-metric-card-border-width);border-style:var(--bf-metric-card-border-style);border-color:var(--bf-metric-card-border-color);border-radius:var(--bf-metric-card-radius);padding:var(--bf-metric-card-padding-y) var(--bf-metric-card-padding-x);transition:var(--bf-metric-card-transition)}`;
var BfMetricCard$1 = /* @__PURE__ */ proxyCustomElement(class BfMetricCard extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "5d538566d2fc3bca7ed9431f899d0b213bab1766" }, h("div", { key: "46586c3e8f62b58bf95bf61d7963296e7282d065", class: "root", part: "root" }, h("slot", { key: "54b0f6c7c948b911efefa18675be931b51f4504d" })));
  }
  static get style() {
    return bfMetricCardCss();
  }
}, [257, "bf-metric-card"]);
function defineCustomElement$148() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-metric-card"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-metric-card":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfMetricCard$1);
        }
        break;
    }
  });
}
var defineCustomElement48 = defineCustomElement$148;

// dist/_stencil/bf-modal.js
var bfModalCss = () => `:host{--bf-modal-font:var(--bf-theme-font-family, inherit);--bf-modal-bg:var(--bf-theme-modal-bg, var(--bf-theme-surface-1, #ffffff));--bf-modal-color:var(--bf-theme-modal-color, var(--bf-theme-text-1, #0f172a));--bf-modal-border-color:var(--bf-theme-modal-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-modal-radius:var(--bf-theme-radius-md, 10px);--bf-modal-backdrop:rgba(2, 6, 23, 0.48);--bf-modal-max-w:34rem;--bf-modal-shadow:0 18px 44px rgba(2, 6, 23, 0.28);display:block;font:var(--bf-modal-font);z-index:1200}.root{position:fixed;inset:0;display:grid;align-items:center;justify-items:center;padding:1rem}.root[data-open='false']{display:none}.backdrop{position:absolute;inset:0;background:var(--bf-modal-backdrop)}.panel{position:relative;width:min(100%, var(--bf-modal-max-w));background:var(--bf-modal-bg);color:var(--bf-modal-color);border:1px solid var(--bf-modal-border-color);border-radius:var(--bf-modal-radius);padding:1rem;box-shadow:var(--bf-modal-shadow)}`;
var BfModal$1 = /* @__PURE__ */ proxyCustomElement(class BfModal extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "observer");
    __publicField(this, "onBackdropClick", () => {
      if (this.el.hasAttribute("persistent")) {
        return;
      }
      this.el.removeAttribute("open");
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this.el, { attributes: true, attributeFilter: ["open", "label", "persistent", "id"] });
  }
  disconnectedCallback() {
    this.observer?.disconnect();
  }
  async open() {
    this.el.setAttribute("open", "");
  }
  async close() {
    this.el.removeAttribute("open");
  }
  async toggle() {
    if (this.el.hasAttribute("open")) {
      await this.close();
      return;
    }
    await this.open();
  }
  shouldOpenByDefault() {
    return !this.el.hasAttribute("id");
  }
  syncRoot() {
    const root = this.el.shadowRoot?.querySelector(".root");
    if (!(root instanceof H)) {
      return;
    }
    if (!this.el.hasAttribute("open") && this.shouldOpenByDefault()) {
      this.el.setAttribute("open", "");
      return;
    }
    const isOpen = this.el.hasAttribute("open");
    this.el.hidden = !isOpen;
    root.setAttribute("data-open", isOpen ? "true" : "false");
    this.el.setAttribute("aria-hidden", String(!isOpen));
    this.el.setAttribute("role", "dialog");
    this.el.setAttribute("aria-modal", "true");
    const lab = this.el.getAttribute("label");
    if (lab) {
      this.el.setAttribute("aria-label", lab);
    } else {
      this.el.removeAttribute("aria-label");
    }
  }
  sync() {
    this.syncRoot();
  }
  componentDidRender() {
    this.syncRoot();
  }
  render() {
    return h(Host, { key: "bfe404e898d592defd94ac8692a47bd64f3a4c91" }, h("div", { key: "9b4d3d45d9110d780d307b6f7fb7ccc7a8c92796", class: "root", part: "root" }, h("div", { key: "cee8b63906fb8deb9f1ded9824b60011a4b4e820", class: "backdrop", part: "backdrop", onClick: this.onBackdropClick }), h("div", { key: "efcbc670a1f55d6a1f31b5c4e924336a939d2f8e", class: "panel", part: "panel" }, h("slot", { key: "c919c5e8b88364b578c3d7a3498718acca504467" }))));
  }
  static get style() {
    return bfModalCss();
  }
}, [257, "bf-modal", {
  "open": [64],
  "close": [64],
  "toggle": [64]
}]);
function defineCustomElement$149() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-modal"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-modal":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfModal$1);
        }
        break;
    }
  });
}
var defineCustomElement49 = defineCustomElement$149;

// dist/_stencil/bf-nav.js
var bfNavCss = () => `:host{--bf-nav-font:var(--bf-theme-font-family, inherit);--bf-nav-radius:var(--bf-theme-radius-md, 8px);--bf-nav-border-width:var(--bf-theme-border-width, 1px);--bf-nav-border-style:var(--bf-theme-border-style, solid);--bf-nav-border-color:var(--bf-theme-nav-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-nav-bg:var(--bf-theme-nav-bg, var(--bf-theme-surface-1, #ffffff));--bf-nav-color:var(--bf-theme-nav-color, var(--bf-theme-text-1, #0f172a));--bf-nav-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-nav-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-nav-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-nav-font);color:var(--bf-nav-color)}.root{display:flex;align-items:center;justify-content:space-between;gap:var(--bf-nav-padding-x);background:var(--bf-nav-bg);color:var(--bf-nav-color);border-width:var(--bf-nav-border-width);border-style:var(--bf-nav-border-style);border-color:var(--bf-nav-border-color);border-radius:var(--bf-nav-radius);padding:var(--bf-nav-padding-y) var(--bf-nav-padding-x);transition:var(--bf-nav-transition)}::slotted([col]),::slotted([nav-col]){display:flex;align-items:center;gap:var(--bf-nav-padding-x);min-width:0}::slotted([col]:first-child),::slotted([nav-col]:first-child){justify-content:flex-start;flex:1 1 0}::slotted([col]:nth-child(2)),::slotted([nav-col]:nth-child(2)){justify-content:center;flex:1 1 0}::slotted([col]:last-child),::slotted([nav-col]:last-child){justify-content:flex-end;flex:1 1 0}::slotted([row]),::slotted([nav-row]){display:flex;align-items:center;justify-content:space-between;gap:var(--bf-nav-padding-x);width:100%}`;
var BfNav$1 = /* @__PURE__ */ proxyCustomElement(class BfNav extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "368270d2f7118590e707cb48ac9327f155c0dcb6" }, h("div", { key: "cd4b65477ce674a278b963024a76f3f800e7d05d", class: "root", part: "root" }, h("slot", { key: "e20a3229203c12a67614ac73ae36219be894f3f3" })));
  }
  static get style() {
    return bfNavCss();
  }
}, [257, "bf-nav"]);
function defineCustomElement$150() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-nav"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-nav":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfNav$1);
        }
        break;
    }
  });
}
var defineCustomElement50 = defineCustomElement$150;

// dist/_stencil/bf-number-field.js
var bfNumberFieldCss = () => `:host{--bf-number-field-font:var(--bf-theme-font-family, inherit);--bf-number-field-radius:var(--bf-theme-radius-md, 8px);--bf-number-field-border-width:var(--bf-theme-border-width, 1px);--bf-number-field-border-style:var(--bf-theme-border-style, solid);--bf-number-field-border-color:var(--bf-theme-number-field-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-number-field-bg:var(--bf-theme-number-field-bg, var(--bf-theme-surface-1, #ffffff));--bf-number-field-color:var(--bf-theme-number-field-color, var(--bf-theme-text-1, #0f172a));--bf-number-field-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-number-field-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-number-field-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-number-field-font);color:var(--bf-number-field-color)}.root{background:var(--bf-number-field-bg);color:var(--bf-number-field-color);border-width:var(--bf-number-field-border-width);border-style:var(--bf-number-field-border-style);border-color:var(--bf-number-field-border-color);border-radius:var(--bf-number-field-radius);padding:var(--bf-number-field-padding-y) var(--bf-number-field-padding-x);transition:var(--bf-number-field-transition)}`;
var BfNumberField$1 = /* @__PURE__ */ proxyCustomElement(class BfNumberField extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "599ead90a16dcb65eea2b80566377c33e4bfa088" }, h("div", { key: "a295e9b7f20c79b0b2b0a7a8de5544d8b6d3f87c", class: "root", part: "root" }, h("slot", { key: "849f2bc5c6077ba66d8220ac79fc85b3f917f093" })));
  }
  static get style() {
    return bfNumberFieldCss();
  }
}, [257, "bf-number-field"]);
function defineCustomElement$151() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-number-field"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-number-field":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfNumberField$1);
        }
        break;
    }
  });
}
var defineCustomElement51 = defineCustomElement$151;

// dist/_stencil/bf-otp-input.js
var bfOtpInputCss = () => `:host{--bf-otp-input-font:var(--bf-theme-font-family, inherit);--bf-otp-input-radius:var(--bf-theme-radius-md, 8px);--bf-otp-input-border-width:var(--bf-theme-border-width, 1px);--bf-otp-input-border-style:var(--bf-theme-border-style, solid);--bf-otp-input-border-color:var(--bf-theme-otp-input-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-otp-input-bg:var(--bf-theme-otp-input-bg, var(--bf-theme-surface-1, #ffffff));--bf-otp-input-color:var(--bf-theme-otp-input-color, var(--bf-theme-text-1, #0f172a));--bf-otp-input-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-otp-input-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-otp-input-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-otp-input-font);color:var(--bf-otp-input-color)}.root{background:var(--bf-otp-input-bg);color:var(--bf-otp-input-color);border-width:var(--bf-otp-input-border-width);border-style:var(--bf-otp-input-border-style);border-color:var(--bf-otp-input-border-color);border-radius:var(--bf-otp-input-radius);padding:var(--bf-otp-input-padding-y) var(--bf-otp-input-padding-x);transition:var(--bf-otp-input-transition)}`;
var BfOtpInput$1 = /* @__PURE__ */ proxyCustomElement(class BfOtpInput extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "14cda2f6b4da7929d1ba3275f426ae674fdd5724" }, h("div", { key: "d60b1e61d15917ef641e49129565de32d33ee18c", class: "root", part: "root" }, h("slot", { key: "df6a89aa2623051b653038a2c44f1dbf991ace43" })));
  }
  static get style() {
    return bfOtpInputCss();
  }
}, [257, "bf-otp-input"]);
function defineCustomElement$152() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-otp-input"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-otp-input":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfOtpInput$1);
        }
        break;
    }
  });
}
var defineCustomElement52 = defineCustomElement$152;

// dist/_stencil/bf-pagination.js
var bfPaginationCss = () => `:host{--bf-pagination-font:var(--bf-theme-font-family, inherit);--bf-pagination-radius:var(--bf-theme-radius-md, 8px);--bf-pagination-border-width:var(--bf-theme-border-width, 1px);--bf-pagination-border-style:var(--bf-theme-border-style, solid);--bf-pagination-border-color:var(--bf-theme-pagination-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-pagination-bg:var(--bf-theme-pagination-bg, var(--bf-theme-surface-1, #ffffff));--bf-pagination-color:var(--bf-theme-pagination-color, var(--bf-theme-text-1, #0f172a));--bf-pagination-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-pagination-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-pagination-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-pagination-font);color:var(--bf-pagination-color)}.root{background:var(--bf-pagination-bg);color:var(--bf-pagination-color);border-width:var(--bf-pagination-border-width);border-style:var(--bf-pagination-border-style);border-color:var(--bf-pagination-border-color);border-radius:var(--bf-pagination-radius);padding:var(--bf-pagination-padding-y) var(--bf-pagination-padding-x);transition:var(--bf-pagination-transition)}`;
var BfPagination$1 = /* @__PURE__ */ proxyCustomElement(class BfPagination extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "3489297f6809d59b7ae189eef1699291fbe92201" }, h("div", { key: "adbb1a8191941368543c0c3d89923fb952ea6f38", class: "root", part: "root" }, h("slot", { key: "0297dc5d89414c829d968cfd5d75c0541704e63c" })));
  }
  static get style() {
    return bfPaginationCss();
  }
}, [257, "bf-pagination"]);
function defineCustomElement$153() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-pagination"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-pagination":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfPagination$1);
        }
        break;
    }
  });
}
var defineCustomElement53 = defineCustomElement$153;

// dist/_stencil/bf-progress.js
var bfProgressCss = () => `:host{--bf-progress-font:var(--bf-theme-font-family, inherit);--bf-progress-bg:var(--bf-theme-progress-bar-bg, var(--bf-theme-surface-2, #e2e8f0));--bf-progress-color:var(--bf-theme-progress-bar-color, var(--bf-theme-button-primary-bg, #2563eb));--bf-progress-ring-bg:var(--bf-theme-progress-circle-bg, var(--bf-theme-surface-2, #e2e8f0));--bf-progress-ring-color:var(--bf-theme-progress-circle-color, var(--bf-theme-button-primary-bg, #2563eb));--bf-progress-radius:var(--bf-theme-radius-md, 999px);--bf-progress-track-height:0.7rem;--bf-progress-size-sm:2rem;--bf-progress-size-md:3rem;--bf-progress-size-lg:4rem;display:inline-flex;font:var(--bf-progress-font);color:var(--bf-theme-text-1, #0f172a)}.root{display:inline-flex;align-items:center;gap:0.5rem}.linear{display:inline-block;min-width:8rem}.track{width:100%;height:var(--bf-progress-track-height);border-radius:var(--bf-progress-radius);background:var(--bf-progress-bg);overflow:hidden}.fill{height:100%;width:0;background:var(--bf-progress-color);transition:width 160ms ease}.circular{display:none}.circular svg{width:var(--bf-progress-size-md);height:var(--bf-progress-size-md);transform:rotate(-90deg)}.ring,.meter{fill:none;stroke-width:10}.ring{stroke:var(--bf-progress-ring-bg)}.meter{stroke:var(--bf-progress-ring-color);stroke-linecap:round;transition:stroke-dashoffset 180ms ease}.meta:empty{display:none}.root[data-variant='circular'] .linear{display:none}.root[data-variant='circular'] .circular{display:inline-block}.root[data-variant='striped'] .fill{background-image:linear-gradient(   45deg,   rgba(255, 255, 255, 0.25) 25%,   transparent 25%,   transparent 50%,   rgba(255, 255, 255, 0.25) 50%,   rgba(255, 255, 255, 0.25) 75%,   transparent 75%,   transparent  );background-size:0.9rem 0.9rem}.root[data-tone='primary']{--bf-progress-color:var(--bf-theme-button-primary-bg, #2563eb);--bf-progress-ring-color:var(--bf-theme-button-primary-bg, #2563eb)}.root[data-tone='secondary']{--bf-progress-color:var(--bf-theme-button-secondary-color, #1d4ed8);--bf-progress-ring-color:var(--bf-theme-button-secondary-color, #1d4ed8)}.root[data-loading='true'][data-variant='striped'] .fill,.root[data-loading='true'][data-loading-variant='stripe'] .fill{animation:bf-progress-stripes 700ms linear infinite}.root[data-loading='true'][data-loading-variant='pulse'] .fill{animation:bf-progress-pulse 900ms ease-in-out infinite}.root[data-loading='true'][data-loading-variant='bounce'] .fill{transform-origin:left center;animation:bf-progress-bounce 900ms ease-in-out infinite}.root[data-loading='true'][data-variant='circular'] .circular svg,.root[data-loading='true'][data-loading-variant='spin'][data-variant='circular'] .circular svg{animation:bf-progress-spin 1s linear infinite}.root[data-loading='true'][data-variant='circular'] .meter{animation:bf-progress-meter 1.1s ease-in-out infinite}.root[data-size='sm'] .circular svg{width:var(--bf-progress-size-sm);height:var(--bf-progress-size-sm)}.root[data-size='lg'] .circular svg{width:var(--bf-progress-size-lg);height:var(--bf-progress-size-lg)}@keyframes bf-progress-indeterminate{0%{transform:translateX(-120%)}100%{transform:translateX(260%)}}@keyframes bf-progress-stripes{0%{background-position:0 0}100%{background-position:0.9rem 0}}@keyframes bf-progress-pulse{0%,100%{opacity:1}50%{opacity:0.45}}@keyframes bf-progress-bounce{0%,100%{transform:scaleX(1)}50%{transform:scaleX(0.7)}}@keyframes bf-progress-spin{0%{transform:rotate(-90deg)}100%{transform:rotate(270deg)}}@keyframes bf-progress-meter{0%{stroke-dashoffset:220}50%{stroke-dashoffset:80}100%{stroke-dashoffset:220}}`;
var BfProgress$1 = /* @__PURE__ */ proxyCustomElement(class BfProgress extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "loadingTimer");
    __publicField(this, "loadingTimerMs");
    __publicField(this, "mutation");
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.mutation = new MutationObserver(() => this.sync());
    this.mutation.observe(this.el, { attributes: true });
  }
  disconnectedCallback() {
    this.stopLoading();
    this.mutation?.disconnect();
  }
  get value() {
    return this.valueNum();
  }
  set value(nextValue) {
    this.el.setAttribute("value", String(nextValue ?? ""));
  }
  get max() {
    return this.maxNum();
  }
  set max(nextValue) {
    this.el.setAttribute("max", String(nextValue ?? ""));
  }
  get variant() {
    return this.variantId();
  }
  set variant(nextValue) {
    this.el.setAttribute("variant", String(nextValue ?? ""));
  }
  get tone() {
    return this.toneId();
  }
  set tone(nextValue) {
    this.el.setAttribute("tone", String(nextValue ?? ""));
  }
  get size() {
    return this.el.getAttribute("size") || "md";
  }
  set size(nextValue) {
    this.el.setAttribute("size", String(nextValue ?? ""));
  }
  get loading() {
    return this.isLoading();
  }
  set loading(on) {
    if (Boolean(on)) {
      this.el.setAttribute("loading", "");
    } else {
      this.el.removeAttribute("loading");
    }
  }
  variantId() {
    let variant = (this.el.getAttribute("variant") || "").toLowerCase();
    if (!variant) {
      if (this.el.hasAttribute("circular")) {
        variant = "circular";
      } else if (this.el.hasAttribute("striped")) {
        variant = "striped";
      } else if (this.el.hasAttribute("linear")) {
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
  toneId() {
    const explicit = (this.el.getAttribute("tone") || "").toLowerCase();
    if (explicit === "secondary") {
      return "secondary";
    }
    if (explicit === "primary") {
      return "primary";
    }
    if (this.el.hasAttribute("secondary")) {
      return "secondary";
    }
    if (this.el.hasAttribute("primary")) {
      return "primary";
    }
    return "default";
  }
  hasMaxAttr() {
    return this.el.hasAttribute("max");
  }
  maxNum() {
    const parsed = Number.parseFloat(this.el.getAttribute("max") || "");
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 100;
    }
    return parsed;
  }
  valueNum() {
    const parsed = Number.parseFloat(this.el.getAttribute("value") || "0");
    if (!Number.isFinite(parsed)) {
      return 0;
    }
    const upper = this.hasMaxAttr() ? this.maxNum() : 100;
    return Math.min(upper, Math.max(0, parsed));
  }
  percent() {
    if (!this.hasMaxAttr()) {
      return this.valueNum();
    }
    return this.valueNum() / this.maxNum() * 100;
  }
  loadingVariantId() {
    const explicit = (this.el.getAttribute("loading-variant") || "").toLowerCase();
    const attrValue = (this.el.getAttribute("loading") || "").toLowerCase();
    const candidate = explicit || attrValue || "loop";
    if (["loop", "pulse", "stripe", "bounce", "spin"].includes(candidate)) {
      return candidate;
    }
    return "loop";
  }
  loadingMs() {
    const parsed = Number.parseInt(this.el.getAttribute("loading-ms") || "450", 10);
    return Number.isFinite(parsed) && parsed >= 80 ? parsed : 450;
  }
  isLoading() {
    const legacy = (this.el.getAttribute("variant") || "").toLowerCase() === "indeterminate";
    return this.el.hasAttribute("loading") || this.el.hasAttribute("indeterminate") || legacy;
  }
  startLoading() {
    const ms = this.loadingMs();
    if (this.loadingTimer && this.loadingTimerMs === ms) {
      return;
    }
    this.stopLoading();
    this.loadingTimerMs = ms;
    this.loadingTimer = setInterval(() => {
      const ceiling = this.hasMaxAttr() ? this.maxNum() : 100;
      const step = ceiling / 10;
      let next = this.valueNum() + step;
      if (next > ceiling) {
        next = 0;
      }
      this.value = Number(next.toFixed(4));
      this.sync();
    }, ms);
  }
  stopLoading() {
    if (!this.loadingTimer) {
      return;
    }
    clearInterval(this.loadingTimer);
    this.loadingTimer = void 0;
    this.loadingTimerMs = null;
  }
  formatLabel() {
    if (this.hasMaxAttr()) {
      return `${Math.round(this.percent())}%`;
    }
    const raw = this.valueNum();
    return Number.isInteger(raw) ? `${raw}` : `${raw.toFixed(2)}`;
  }
  updateValueTokens() {
    const tokens = this.el.querySelectorAll("value");
    if (!tokens.length) {
      return;
    }
    const display = this.formatLabel();
    tokens.forEach((t) => {
      t.textContent = display;
    });
  }
  bindSlotOnce(sr) {
    const slot = sr.querySelector("slot");
    if (slot instanceof HTMLSlotElement && slot.dataset.bfSlotBound !== "true") {
      slot.dataset.bfSlotBound = "true";
      slot.addEventListener("slotchange", () => this.updateValueTokens());
    }
  }
  sync() {
    const sr = this.el.shadowRoot;
    const root = sr?.querySelector(".root");
    const fill = sr?.querySelector(".fill");
    const meter = sr?.querySelector(".meter");
    if (!(root instanceof H) || !(fill instanceof H) || !(meter instanceof H)) {
      return;
    }
    const variant = this.variantId();
    const percent = this.percent();
    const size = this.el.getAttribute("size") || "md";
    const tone = this.toneId();
    const loading = this.isLoading();
    const loadingVariant = this.loadingVariantId();
    root.setAttribute("data-variant", variant);
    root.setAttribute("data-size", size);
    root.setAttribute("data-tone", tone);
    root.setAttribute("data-loading", loading ? "true" : "false");
    root.setAttribute("data-loading-variant", loadingVariant);
    this.el.setAttribute("role", "progressbar");
    this.el.setAttribute("aria-valuemin", "0");
    this.el.setAttribute("aria-valuemax", String(this.hasMaxAttr() ? this.maxNum() : 100));
    this.el.setAttribute("aria-valuenow", String(this.valueNum()));
    const lb = this.el.getAttribute("label");
    if (lb) {
      this.el.setAttribute("aria-label", lb);
    } else {
      this.el.removeAttribute("aria-label");
    }
    fill.style.width = `${percent}%`;
    const circumference = 2 * Math.PI * 42;
    const dash = circumference - percent / 100 * circumference;
    meter.style.strokeDasharray = `${circumference}`;
    meter.style.strokeDashoffset = `${dash}`;
    this.updateValueTokens();
    this.bindSlotOnce(sr);
    if (loading) {
      this.startLoading();
    } else {
      this.stopLoading();
    }
  }
  componentDidRender() {
    const sr = this.el.shadowRoot;
    if (!sr?.querySelector(".root")) {
      return;
    }
    this.bindSlotOnce(sr);
    this.sync();
  }
  render() {
    return h(Host, { key: "3c1405bd16ff772c7eb5d5ff5517f3c9c85fa372" }, h("div", { key: "d13f52f775f0e36836266657d70859ec61eaf7eb", class: "root", part: "root" }, h("div", { key: "ef16c00888b91d78994f0d7840dca36798d454d8", class: "linear", part: "linear" }, h("div", { key: "12b0d232b689551b6dedd936b9bb077102859884", class: "track", part: "track" }, h("div", { key: "6709cb1ac9ea3b808e00004353767400ae9f1fa6", class: "fill", part: "fill" }))), h("div", { key: "0f4044e6429865ecac488c63f124fd98918eab89", class: "circular", part: "circular" }, h("svg", { key: "dbfa9db5cb1ea07963fa799fd6e0999221d7db34", viewBox: "0 0 100 100", "aria-hidden": "true" }, h("circle", { key: "91401dbf149b3b4d78b09e3b1ca353939e8d0e27", class: "ring", cx: "50", cy: "50", r: "42" }), h("circle", { key: "c7e31b10e8d2b0b26e57ff76c5176088a0ecc9fd", class: "meter", cx: "50", cy: "50", r: "42" }))), h("div", { key: "8a23b8988de35642cbef43258607628f59276272", class: "meta", part: "meta" }, h("slot", { key: "fd235becafe584a90403894b54c854766dc8185e" }))));
  }
  static get style() {
    return bfProgressCss();
  }
}, [257, "bf-progress"]);
function defineCustomElement$154() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-progress"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-progress":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfProgress$1);
        }
        break;
    }
  });
}
var defineCustomElement54 = defineCustomElement$154;

// dist/_stencil/bf-quick-actions.js
var bfQuickActionsCss = () => `:host{--bf-quick-actions-font:var(--bf-theme-font-family, inherit);--bf-quick-actions-radius:var(--bf-theme-radius-md, 8px);--bf-quick-actions-border-width:var(--bf-theme-border-width, 1px);--bf-quick-actions-border-style:var(--bf-theme-border-style, solid);--bf-quick-actions-border-color:var(--bf-theme-quick-actions-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-quick-actions-bg:var(--bf-theme-quick-actions-bg, var(--bf-theme-surface-1, #ffffff));--bf-quick-actions-color:var(--bf-theme-quick-actions-color, var(--bf-theme-text-1, #0f172a));--bf-quick-actions-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-quick-actions-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-quick-actions-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-quick-actions-font);color:var(--bf-quick-actions-color)}.root{background:var(--bf-quick-actions-bg);color:var(--bf-quick-actions-color);border-width:var(--bf-quick-actions-border-width);border-style:var(--bf-quick-actions-border-style);border-color:var(--bf-quick-actions-border-color);border-radius:var(--bf-quick-actions-radius);padding:var(--bf-quick-actions-padding-y) var(--bf-quick-actions-padding-x);transition:var(--bf-quick-actions-transition)}`;
var BfQuickActions$1 = /* @__PURE__ */ proxyCustomElement(class BfQuickActions extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "0bd58200707bf24913135db9e30e1a721eee65f9" }, h("div", { key: "d11acd9a845f6b2811ab1cfdbff06bb09d2ac8cb", class: "root", part: "root" }, h("slot", { key: "275f856dbfeef98f2acc8e4aba29fc3de297bbff" })));
  }
  static get style() {
    return bfQuickActionsCss();
  }
}, [257, "bf-quick-actions"]);
function defineCustomElement$155() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-quick-actions"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-quick-actions":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfQuickActions$1);
        }
        break;
    }
  });
}
var defineCustomElement55 = defineCustomElement$155;

// dist/_stencil/bf-radio.js
var bfRadioCss = () => `:host{--bf-radio-font:var(--bf-theme-font-family, inherit);--bf-radio-radius:var(--bf-theme-radius-md, 8px);--bf-radio-border-width:var(--bf-theme-border-width, 1px);--bf-radio-border-style:var(--bf-theme-border-style, solid);--bf-radio-border-color:var(--bf-theme-radio-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-radio-bg:var(--bf-theme-radio-bg, var(--bf-theme-surface-1, #ffffff));--bf-radio-color:var(--bf-theme-radio-color, var(--bf-theme-text-1, #0f172a));--bf-radio-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-radio-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-radio-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:inline-block;font:var(--bf-radio-font);color:var(--bf-radio-color)}.root{display:inline-flex;align-items:center;gap:0.5rem;cursor:pointer;background:var(--bf-radio-bg);color:var(--bf-radio-color);border-width:var(--bf-radio-border-width);border-style:var(--bf-radio-border-style);border-color:var(--bf-radio-border-color);border-radius:var(--bf-radio-radius);padding:var(--bf-radio-padding-y) var(--bf-radio-padding-x);transition:var(--bf-radio-transition)}input{position:absolute;opacity:0;width:0;height:0}.dot{width:0.95rem;height:0.95rem;border-radius:999px;border:2px solid var(--bf-radio-border-color);display:inline-block;position:relative}.dot::after{content:'';position:absolute;inset:0.15rem;border-radius:999px;background:var(--bf-theme-button-primary-bg, #2563eb);transform:scale(0);transition:transform 120ms ease}input:checked+.dot::after{transform:scale(1)}`;
var BfRadio$1 = /* @__PURE__ */ proxyCustomElement(class BfRadio extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "attrLabel");
    __publicField(this, "observer");
    __publicField(this, "onInputChange", () => {
      const input = this.el.shadowRoot?.querySelector("input");
      if (!(input instanceof HTMLInputElement)) {
        return;
      }
      if (input.checked) {
        this.checked = true;
        this.uncheckPeers();
      }
      this.el.dispatchEvent(new CustomEvent("bf-change", {
        bubbles: true,
        composed: true,
        detail: {
          group: this.effectiveGroup(),
          value: this.value,
          checked: this.checked
        }
      }));
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  componentDidRender() {
    this.syncState();
  }
  handleLabel() {
    this.syncState();
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.syncState());
    this.observer.observe(this.el, {
      attributes: true,
      attributeFilter: ["checked", "disabled", "label", "value", "group"]
    });
  }
  disconnectedCallback() {
    this.observer?.disconnect();
  }
  get checked() {
    return this.el.hasAttribute("checked");
  }
  set checked(value) {
    if (value) {
      this.el.setAttribute("checked", "");
    } else {
      this.el.removeAttribute("checked");
    }
  }
  get value() {
    return this.el.getAttribute("value") || this.el.textContent?.trim() || "";
  }
  syncState() {
    const input = this.el.shadowRoot?.querySelector("input");
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const group = this.el.getAttribute("group") || "";
    input.name = group;
    input.value = this.value;
    input.checked = this.checked;
    input.disabled = this.el.hasAttribute("disabled");
    const hasLabelText = (this.el.textContent || "").trim().length > 0;
    const labelAttr = this.el.getAttribute("label");
    if (!hasLabelText && !labelAttr) {
      this.el.setAttribute("label", "radio");
    }
    const finalLabel = this.el.getAttribute("label");
    if (finalLabel) {
      input.setAttribute("aria-label", finalLabel);
    } else {
      input.removeAttribute("aria-label");
    }
  }
  effectiveGroup() {
    return this.el.getAttribute("group") || "";
  }
  uncheckPeers() {
    const group = this.effectiveGroup();
    if (!group) {
      return;
    }
    const peers = document.querySelectorAll(`bf-radio[group="${CSS.escape(group)}"]`);
    for (const peer of Array.from(peers)) {
      if (peer !== this.el) {
        peer.removeAttribute("checked");
      }
    }
  }
  render() {
    return h(Host, { key: "ea71570631d8df9fb278c85b9ae4cbf55e9f3984" }, h("label", { key: "c62418c4f8067a56db8711217505ce9b1dbe7b48", class: "root", part: "root" }, h("input", { key: "953b34af8f8103aefe644981e29b39667e23ca4c", type: "radio", part: "input", onChange: this.onInputChange }), h("span", { key: "7f898e9e213674824f1181b673243cdace03a7a4", class: "dot", part: "dot" }), h("span", { key: "6328247bf9ba9652410d222c36fc7f4d6ace23ac", class: "text", part: "text" }, h("slot", { key: "94c3239cfbf25dcf8bb92bf010923c315f8464be" }))));
  }
  static get watchers() {
    return {
      "attrLabel": [{
        "handleLabel": 0
      }]
    };
  }
  static get style() {
    return bfRadioCss();
  }
}, [769, "bf-radio", {
  "attrLabel": [513, "label"]
}, void 0, {
  "attrLabel": [{
    "handleLabel": 0
  }]
}]);
function defineCustomElement$156() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-radio"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-radio":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfRadio$1);
        }
        break;
    }
  });
}
var defineCustomElement56 = defineCustomElement$156;

// dist/_stencil/bf-range.js
var bfRangeCss = () => `:host{--bf-range-font:var(--bf-theme-font-family, inherit);--bf-range-track:var(--bf-theme-surface-2, #e2e8f0);--bf-range-fill:var(--bf-theme-button-primary-bg, #2563eb);--bf-range-rating-active:var(--bf-theme-button-primary-bg, #2563eb);--bf-range-rating-muted:var(--bf-theme-border-1, #cbd5e1);display:inline-flex;font:var(--bf-range-font)}.root{display:inline-flex;flex-direction:column;gap:0.4rem;min-width:12rem}.single,.dual,.rating{display:none}.root[data-mode='slider'] .single{display:block}.root[data-mode='range'] .dual{display:block;position:relative;padding-block:0.35rem}.root[data-mode='rating'] .rating{display:inline-flex;gap:0.25rem}input[type='range']{width:100%;accent-color:var(--bf-range-fill)}.dual-track{position:absolute;inset:50% 0 auto;height:0.35rem;transform:translateY(-50%);background:var(--bf-range-track);border-radius:999px}.dual-fill{position:absolute;height:100%;background:var(--bf-range-fill);border-radius:inherit}.dual input[type='range']{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);background:transparent;pointer-events:none}.dual input[type='range']::-webkit-slider-thumb{pointer-events:auto}.dual input[type='range']::-moz-range-thumb{pointer-events:auto}.star{border:0;background:transparent;color:var(--bf-range-rating-muted);font:inherit;font-size:1.1rem;cursor:pointer;padding:0;line-height:1}.star.is-active{color:var(--bf-range-rating-active)}`;
var BfRange$1 = /* @__PURE__ */ proxyCustomElement(class BfRange extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "observer");
    __publicField(this, "onSingle", (event) => {
      const input = event.target;
      this.setAttr("value", input.value);
      this.emit(event.type === "change" ? "bf-change" : "bf-input");
    });
    __publicField(this, "onDual", (event) => {
      const tgt = event.target;
      let low = this.parseValue("low", this.min());
      let high = this.parseValue("high", this.max());
      const next = Number.parseFloat(tgt.value);
      if (tgt.classList.contains("dual-low")) {
        low = Math.min(next, high);
      } else {
        high = Math.max(next, low);
      }
      this.setAttr("low", low);
      this.setAttr("high", high);
      this.sync();
      this.emit(event.type === "change" ? "bf-change" : "bf-input");
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this.el, { attributes: true });
  }
  disconnectedCallback() {
    this.observer?.disconnect();
  }
  mode() {
    const explicit = (this.el.getAttribute("mode") || "").toLowerCase();
    if (["slider", "range", "rating"].includes(explicit)) {
      return explicit;
    }
    if (this.el.hasAttribute("rating")) {
      return "rating";
    }
    if (this.el.hasAttribute("range")) {
      return "range";
    }
    return "slider";
  }
  min() {
    const parsed = Number.parseFloat(this.el.getAttribute("min") || "0");
    return Number.isFinite(parsed) ? parsed : 0;
  }
  max() {
    const mn = this.min();
    const parsed = Number.parseFloat(this.el.getAttribute("max") || "100");
    return Number.isFinite(parsed) && parsed > mn ? parsed : mn + 100;
  }
  step() {
    const parsed = Number.parseFloat(this.el.getAttribute("step") || "1");
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }
  parseValue(attrName, fallback) {
    const parsed = Number.parseFloat(this.el.getAttribute(attrName) || `${fallback}`);
    if (!Number.isFinite(parsed)) {
      return fallback;
    }
    return Math.min(this.max(), Math.max(this.min(), parsed));
  }
  count() {
    const parsed = Number.parseInt(this.el.getAttribute("count") || "5", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
  }
  setAttr(attrName, value) {
    const next = `${value}`;
    if (this.el.getAttribute(attrName) === next) {
      return;
    }
    this.el.setAttribute(attrName, next);
  }
  emit(kind) {
    const mode = this.mode();
    this.el.dispatchEvent(new CustomEvent(kind, {
      bubbles: true,
      composed: true,
      detail: mode === "range" ? {
        mode,
        value: [
          this.parseValue("low", this.min()),
          this.parseValue("high", this.max())
        ]
      } : {
        mode,
        value: this.parseValue("value", this.min())
      }
    }));
  }
  bindOnce(sr) {
    const sing = sr.querySelector(".single-input");
    const lo = sr.querySelector(".dual-low");
    const hi = sr.querySelector(".dual-high");
    if (sing instanceof HTMLInputElement && sing.dataset.bfBound !== "true") {
      sing.dataset.bfBound = "true";
      sing.addEventListener("input", this.onSingle);
      sing.addEventListener("change", this.onSingle);
    }
    [lo, hi].forEach((el) => {
      if (el instanceof HTMLInputElement && el.dataset.bfBound !== "true") {
        el.dataset.bfBound = "true";
        el.addEventListener("input", this.onDual);
        el.addEventListener("change", this.onDual);
      }
    });
  }
  renderRating(root) {
    const box = root.querySelector(".rating");
    if (!(box instanceof H)) {
      return;
    }
    box.replaceChildren();
    const ct = this.count();
    const current = this.parseValue("value", 0);
    const disabled = this.el.hasAttribute("disabled");
    for (let i = 1; i <= ct; i += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "star";
      button.textContent = "*";
      button.disabled = disabled;
      button.setAttribute("aria-label", `${i}`);
      if (i <= current) {
        button.classList.add("is-active");
      }
      button.onclick = () => {
        this.setAttr("value", i);
        this.sync();
        this.emit("bf-change");
      };
      box.append(button);
    }
  }
  dualFill(root) {
    const fill = root.querySelector(".dual-fill");
    if (!(fill instanceof H)) {
      return;
    }
    const mn = this.min();
    const mx = this.max();
    const low = this.parseValue("low", mn);
    const high = this.parseValue("high", mx);
    fill.style.left = `${(low - mn) / (mx - mn) * 100}%`;
    fill.style.width = `${(high - low) / (mx - mn) * 100}%`;
  }
  sync() {
    const sr = this.el.shadowRoot;
    if (!sr) {
      return;
    }
    this.bindOnce(sr);
    const root = sr.querySelector(".root");
    if (!(root instanceof H)) {
      return;
    }
    const mode = this.mode();
    root.setAttribute("data-mode", mode);
    const mn = this.min();
    const mx = this.max();
    const st = this.step();
    const disabled = this.el.hasAttribute("disabled");
    const label = this.el.getAttribute("label") || "";
    const nm = this.el.getAttribute("name") || "";
    const sing = sr.querySelector(".single-input");
    const lo = sr.querySelector(".dual-low");
    const hi = sr.querySelector(".dual-high");
    if (sing instanceof HTMLInputElement) {
      sing.min = `${mn}`;
      sing.max = `${mx}`;
      sing.step = `${st}`;
      sing.value = `${this.parseValue("value", mn)}`;
      sing.disabled = disabled;
      sing.name = nm;
    }
    if (lo instanceof HTMLInputElement) {
      lo.min = `${mn}`;
      lo.max = `${mx}`;
      lo.step = `${st}`;
      lo.value = `${this.parseValue("low", mn)}`;
      lo.disabled = disabled;
      lo.name = `${nm ? `${nm}-` : ""}low`;
    }
    if (hi instanceof HTMLInputElement) {
      hi.min = `${mn}`;
      hi.max = `${mx}`;
      hi.step = `${st}`;
      hi.value = `${this.parseValue("high", mx)}`;
      hi.disabled = disabled;
      hi.name = `${nm ? `${nm}-` : ""}high`;
    }
    this.dualFill(root);
    this.renderRating(root);
    if (label) {
      if (sing instanceof HTMLInputElement) {
        sing.setAttribute("aria-label", label);
      }
      if (lo instanceof HTMLInputElement) {
        lo.setAttribute("aria-label", `${label} low`);
      }
      if (hi instanceof HTMLInputElement) {
        hi.setAttribute("aria-label", `${label} high`);
      }
      sr.querySelector(".rating")?.setAttribute?.("aria-label", label);
    }
  }
  componentDidRender() {
    this.sync();
  }
  render() {
    return h(Host, { key: "e567c604ed60d9042e34c66a51e1e3fefe9c6212" }, h("div", { key: "fe05a74eeead25300e8af7a931c6a1de7777d416", class: "root", part: "root" }, h("div", { key: "cda349cdafed6184c061c34b9db3aaf08cc3b519", class: "single", part: "single" }, h("input", { key: "286f8ec8cb1019db402ca7f7e6923e628b8017f3", class: "single-input", type: "range", part: "input" })), h("div", { key: "fd473cfc0095068e665be6272cd8e09bd54a862d", class: "dual", part: "dual" }, h("div", { key: "faa92b43249013fff90600b2c7a620449aaca3bd", class: "dual-track", part: "track" }, h("div", { key: "50a7c8c6fb2258464104bb4a6fc5f4016f828470", class: "dual-fill", part: "fill" })), h("input", { key: "98f408f774bf27ed785d018dd4dea496810693fa", class: "dual-low", type: "range", part: "low" }), h("input", { key: "501042b20b7d14be46f8d0c1c78511a06d10c259", class: "dual-high", type: "range", part: "high" })), h("div", { key: "744b93990f70dd5c5426296a359bccafc5071fdf", class: "rating", part: "rating" }), h("div", { key: "f06b4859a24fccba1e87f2155bbd6fd069eff416", class: "meta", part: "meta" }, h("slot", { key: "6d641ed2bc2328a5bb638a5c2e4daa066274ab0c" }))));
  }
  static get style() {
    return bfRangeCss();
  }
}, [257, "bf-range"]);
function defineCustomElement$157() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-range"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-range":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfRange$1);
        }
        break;
    }
  });
}
var defineCustomElement57 = defineCustomElement$157;

// dist/_stencil/bf-search.js
var bfSearchCss = () => `:host{--bf-search-font:var(--bf-theme-font-family, inherit);--bf-search-radius:var(--bf-theme-radius-md, 8px);--bf-search-border-width:var(--bf-theme-border-width, 1px);--bf-search-border-style:var(--bf-theme-border-style, solid);--bf-search-border-color:var(--bf-theme-search-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-search-bg:var(--bf-theme-search-bg, var(--bf-theme-surface-1, #ffffff));--bf-search-color:var(--bf-theme-search-color, var(--bf-theme-text-1, #0f172a));--bf-search-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-search-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-search-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-search-font);color:var(--bf-search-color)}.root{background:var(--bf-search-bg);color:var(--bf-search-color);border-width:var(--bf-search-border-width);border-style:var(--bf-search-border-style);border-color:var(--bf-search-border-color);border-radius:var(--bf-search-radius);padding:var(--bf-search-padding-y) var(--bf-search-padding-x);transition:var(--bf-search-transition)}`;
var BfSearch$1 = /* @__PURE__ */ proxyCustomElement(class BfSearch extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "2fe18816c20b6d3e9d682a2a9065e1935c41e1d3" }, h("div", { key: "dff0301d45ad4537d611ce63c7ea4acd54a7e84e", class: "root", part: "root" }, h("slot", { key: "0db89f19b138219ce48789aba127502bdc39f53f" })));
  }
  static get style() {
    return bfSearchCss();
  }
}, [257, "bf-search"]);
function defineCustomElement$158() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-search"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-search":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfSearch$1);
        }
        break;
    }
  });
}
var defineCustomElement58 = defineCustomElement$158;

// dist/_stencil/bf-segmented-control.js
var bfSegmentedControlCss = () => `:host{--bf-segmented-control-font:var(--bf-theme-font-family, inherit);--bf-segmented-control-radius:var(--bf-theme-radius-md, 8px);--bf-segmented-control-border-width:var(--bf-theme-border-width, 1px);--bf-segmented-control-border-style:var(--bf-theme-border-style, solid);--bf-segmented-control-border-color:var(--bf-theme-segmented-control-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-segmented-control-bg:var(--bf-theme-segmented-control-bg, var(--bf-theme-surface-1, #ffffff));--bf-segmented-control-color:var(--bf-theme-segmented-control-color, var(--bf-theme-text-1, #0f172a));--bf-segmented-control-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-segmented-control-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-segmented-control-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-segmented-control-font);color:var(--bf-segmented-control-color)}.root{background:var(--bf-segmented-control-bg);color:var(--bf-segmented-control-color);border-width:var(--bf-segmented-control-border-width);border-style:var(--bf-segmented-control-border-style);border-color:var(--bf-segmented-control-border-color);border-radius:var(--bf-segmented-control-radius);padding:var(--bf-segmented-control-padding-y) var(--bf-segmented-control-padding-x);transition:var(--bf-segmented-control-transition)}`;
var BfSegmentedControl$1 = /* @__PURE__ */ proxyCustomElement(class BfSegmentedControl extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "4c9aff45dd877c130a26d9bcd1d833e75b554b61" }, h("div", { key: "6e547568705137799606cf580f585c04a046bbe2", class: "root", part: "root" }, h("slot", { key: "9f22c961dc6d18f7cefdbb3f44fec25ec202e9d4" })));
  }
  static get style() {
    return bfSegmentedControlCss();
  }
}, [257, "bf-segmented-control"]);
function defineCustomElement$159() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-segmented-control"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-segmented-control":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfSegmentedControl$1);
        }
        break;
    }
  });
}
var defineCustomElement59 = defineCustomElement$159;

// dist/_stencil/bf-select.js
var bfSelectCss = () => `:host{--bf-select-font:var(--bf-theme-font-family, inherit);--bf-select-radius:var(--bf-theme-radius-md, 8px);--bf-select-border-width:var(--bf-theme-border-width, 1px);--bf-select-border-style:var(--bf-theme-border-style, solid);--bf-select-border-color:var(--bf-theme-select-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-select-bg:var(--bf-theme-select-bg, var(--bf-theme-surface-1, #ffffff));--bf-select-color:var(--bf-theme-select-color, var(--bf-theme-text-1, #0f172a));--bf-select-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-select-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-select-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-select-font);color:var(--bf-select-color)}.root{position:relative;background:var(--bf-select-bg);color:var(--bf-select-color);border-width:var(--bf-select-border-width);border-style:var(--bf-select-border-style);border-color:var(--bf-select-border-color);border-radius:var(--bf-select-radius);transition:var(--bf-select-transition)}select{appearance:none;-webkit-appearance:none;width:100%;border:0;outline:0;background:transparent;color:inherit;font:inherit;padding:var(--bf-select-padding-y) calc(var(--bf-select-padding-x) * 2.1)   var(--bf-select-padding-y) var(--bf-select-padding-x)}.root.is-multi select{padding-right:var(--bf-select-padding-x)}.chevron{position:absolute;top:50%;right:var(--bf-select-padding-x);width:0.6rem;height:0.6rem;transform:translateY(-60%) rotate(45deg);border-right:2px solid currentColor;border-bottom:2px solid currentColor;opacity:0.7;pointer-events:none}.root.is-multi .chevron{display:none}`;
var BfSelect$1 = /* @__PURE__ */ proxyCustomElement(class BfSelect extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "ignoreNextExternalValueChange", false);
    __publicField(this, "mutation");
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.mutation = new MutationObserver((records) => {
      let touchesValue = false;
      for (const r of records) {
        if (r.type === "attributes" && r.attributeName === "value") {
          touchesValue = true;
        }
      }
      if (touchesValue && this.ignoreNextExternalValueChange) {
        this.ignoreNextExternalValueChange = false;
        return;
      }
      void this.pull();
    });
    this.mutation.observe(this.el, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        "value",
        "multi",
        "disabled",
        "required",
        "placeholder",
        "label",
        "name",
        "selected",
        "disabled",
        "label"
      ]
    });
    queueMicrotask(() => this.pull());
  }
  disconnectedCallback() {
    this.mutation?.disconnect();
  }
  get value() {
    const sel = this.nativeSelect();
    if (!sel) {
      return "";
    }
    if (this.isMulti()) {
      return this.values.join(",");
    }
    return sel.value;
  }
  set value(nextValue) {
    if (Array.isArray(nextValue)) {
      this.el.setAttribute("value", nextValue.join(","));
      return;
    }
    this.el.setAttribute("value", `${nextValue ?? ""}`);
  }
  get values() {
    const sel = this.nativeSelect();
    if (!sel) {
      return [];
    }
    return Array.from(sel.selectedOptions).map((o) => o.value);
  }
  nativeSelect() {
    const s = this.el.shadowRoot?.querySelector("select");
    return s instanceof HTMLSelectElement ? s : null;
  }
  isMulti() {
    return this.el.hasAttribute("multi");
  }
  multiLimit() {
    if (!this.isMulti()) {
      return 1;
    }
    const raw = this.el.getAttribute("multi");
    if (raw === "" || raw === null) {
      return Infinity;
    }
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : Infinity;
  }
  parsedValue() {
    const raw = this.el.getAttribute("value");
    if (raw === null) {
      return [];
    }
    return this.isMulti() ? raw.split(",").map((part) => part.trim()).filter(Boolean) : [raw];
  }
  cloneOption(option) {
    const clone = document.createElement("option");
    clone.value = option.getAttribute("value") ?? option.textContent?.trim() ?? "";
    clone.textContent = option.textContent?.trim() ?? "";
    clone.disabled = option.hasAttribute("disabled");
    clone.defaultSelected = option.hasAttribute("selected");
    clone.selected = option.hasAttribute("selected");
    return clone;
  }
  cloneOptionsFromLightDom(sel) {
    let count = 0;
    const frag = document.createDocumentFragment();
    for (const child of Array.from(this.el.children)) {
      const tag = child.tagName.toLowerCase();
      if (tag === "option") {
        frag.append(this.cloneOption(child));
        count += 1;
      } else if (tag === "optgroup") {
        const grp = document.createElement("optgroup");
        const label = child.getAttribute("label");
        if (label) {
          grp.label = label;
        }
        for (const opt of Array.from(child.querySelectorAll("option"))) {
          grp.append(this.cloneOption(opt));
          count += 1;
        }
        frag.append(grp);
      }
    }
    sel.replaceChildren();
    const placeholder = this.el.getAttribute("placeholder");
    if (placeholder && !this.isMulti()) {
      const ph = document.createElement("option");
      ph.value = "";
      ph.textContent = placeholder;
      sel.append(ph);
    }
    if (count > 0) {
      sel.append(frag);
    } else {
      const fb = this.el.textContent?.trim();
      if (fb) {
        const o = document.createElement("option");
        o.value = fb;
        o.textContent = fb;
        sel.append(o);
      }
    }
  }
  enforceMulti(sel) {
    if (!this.isMulti()) {
      return;
    }
    const cap = this.multiLimit();
    if (cap === Infinity) {
      return;
    }
    const selArr = Array.from(sel.options).filter((o) => o.selected);
    if (selArr.length <= cap) {
      return;
    }
    for (let i = cap; i < selArr.length; i += 1) {
      selArr[i].selected = false;
    }
  }
  reflectFromControl(sel) {
    const next = this.isMulti() ? this.values.join(",") : sel.value;
    if (this.el.getAttribute("value") === next) {
      return;
    }
    this.ignoreNextExternalValueChange = true;
    this.el.setAttribute("value", next);
  }
  applyAttrValue(sel) {
    if (!this.el.hasAttribute("value")) {
      return;
    }
    const values = new Set(this.parsedValue());
    if (this.isMulti()) {
      for (const opt of Array.from(sel.options)) {
        opt.selected = values.has(opt.value);
      }
      return;
    }
    sel.value = this.parsedValue()[0] ?? "";
  }
  handleChange(sel) {
    this.enforceMulti(sel);
    this.reflectFromControl(sel);
    this.el.dispatchEvent(new CustomEvent("bf-change", {
      bubbles: true,
      composed: true,
      detail: {
        value: this.isMulti() ? this.values : sel.value,
        values: this.values,
        multiple: this.isMulti(),
        multi: this.multiLimit()
      }
    }));
  }
  bindOnce(sel) {
    if (sel.dataset.bound === "true") {
      return;
    }
    sel.dataset.bound = "true";
    sel.addEventListener("change", () => this.handleChange(sel));
  }
  syncDom(sel, root) {
    this.cloneOptionsFromLightDom(sel);
    sel.multiple = this.isMulti();
    root.classList.toggle("is-multi", this.isMulti());
    sel.disabled = this.el.hasAttribute("disabled");
    sel.required = this.el.hasAttribute("required");
    sel.name = this.el.getAttribute("name") || "";
    const label = this.el.getAttribute("label");
    if (label) {
      sel.setAttribute("aria-label", label);
    } else {
      sel.removeAttribute("aria-label");
    }
  }
  pull() {
    const root = this.el.shadowRoot?.querySelector(".root");
    const sel = this.nativeSelect();
    if (!(root instanceof H) || !sel) {
      return;
    }
    this.bindOnce(sel);
    this.syncDom(sel, root);
    this.applyAttrValue(sel);
    this.enforceMulti(sel);
    this.reflectFromControl(sel);
  }
  componentDidRender() {
    this.pull();
  }
  render() {
    return h(Host, { key: "b17f7004ccecc11752addf8959c65c8dc47488d3" }, h("div", { key: "666c0c098c548032d51918a961fd70b0fddb262c", class: "root", part: "root" }, h("select", { key: "9133532e69a952f81d17f21cf2d2412f60ce9ebf", part: "select" }), h("span", { key: "922a294c7be9431f0635034a7537fbe6f5c85676", class: "chevron", part: "chevron", "aria-hidden": "true" })));
  }
  static get style() {
    return bfSelectCss();
  }
}, [1, "bf-select"]);
function defineCustomElement$160() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-select"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-select":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfSelect$1);
        }
        break;
    }
  });
}
var defineCustomElement60 = defineCustomElement$160;

// dist/_stencil/bf-skeleton.js
var bfSkeletonCss = () => `:host{--bf-skeleton-radius:var(--bf-theme-radius-md, 8px);--bf-skeleton-width:100%;--bf-skeleton-height:0.9rem;--bf-skeleton-base:color-mix(in srgb, var(--bf-theme-border-1, #cbd5e1) 55%, var(--bf-theme-surface-1, #ffffff));--bf-skeleton-highlight:color-mix(in srgb, var(--bf-theme-surface-1, #ffffff) 86%, transparent);--bf-skeleton-speed:1.15s;display:block}.root{position:relative;overflow:hidden;width:var(--bf-skeleton-width);height:var(--bf-skeleton-height);background:var(--bf-skeleton-base);border-radius:var(--bf-skeleton-radius);color:transparent;user-select:none}.root[data-animate='on']::after{content:'';position:absolute;inset:0;background:linear-gradient(   100deg,   transparent 0%,   var(--bf-skeleton-highlight) 45%,   transparent 80%  );transform:translateX(-100%);animation:bf-skeleton-shimmer var(--bf-skeleton-speed) ease-in-out infinite}.root[data-variant='title']{--bf-skeleton-height:1.05rem;--bf-skeleton-width:58%}.root[data-variant='avatar']{--bf-skeleton-width:2.5rem;--bf-skeleton-height:2.5rem;--bf-skeleton-radius:999px}.root[data-variant='button']{--bf-skeleton-width:8rem;--bf-skeleton-height:2.1rem;--bf-skeleton-radius:10px}.root[data-variant='image']{--bf-skeleton-height:auto;--bf-skeleton-width:100%;aspect-ratio:16 / 9;border-radius:12px}.root[data-variant='paragraph']{--bf-skeleton-height:auto;background:transparent;display:grid;gap:0.45rem}.root[data-variant='paragraph']::after{display:none}.lines{display:none}.root[data-variant='paragraph'] .lines{display:grid;gap:0.45rem}.line{position:relative;display:block;height:0.78rem;border-radius:999px;background:var(--bf-skeleton-base);overflow:hidden}.root[data-variant='paragraph'][data-animate='on'] .line::after{content:'';position:absolute;inset:0;background:linear-gradient(   100deg,   transparent 0%,   var(--bf-skeleton-highlight) 45%,   transparent 80%  );transform:translateX(-100%);animation:bf-skeleton-shimmer var(--bf-skeleton-speed) ease-in-out infinite}slot{display:none}@keyframes bf-skeleton-shimmer{100%{transform:translateX(120%)}}@media (prefers-reduced-motion: reduce){.root::after,.line::after{animation:none !important}}`;
var BfSkeleton$1 = /* @__PURE__ */ proxyCustomElement(class BfSkeleton extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "observer");
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.apply());
    this.observer.observe(this.el, { attributes: true });
    this.applyHostVars();
    this.apply();
  }
  disconnectedCallback() {
    this.observer?.disconnect();
  }
  setSizeVar(name, value) {
    if (!value) {
      this.el.style.removeProperty(name);
      return;
    }
    const trimmed = value.trim();
    if (/^-?\d*\.?\d+$/.test(trimmed)) {
      this.el.style.setProperty(name, `${trimmed}px`);
      return;
    }
    this.el.style.setProperty(name, trimmed);
  }
  applyHostVars() {
    this.setSizeVar("--bf-skeleton-width", this.el.getAttribute("width"));
    this.setSizeVar("--bf-skeleton-height", this.el.getAttribute("height"));
    this.setSizeVar("--bf-skeleton-radius", this.el.getAttribute("radius"));
  }
  applyLines(root, lines) {
    const linesEl = root.querySelector(".lines");
    if (!(linesEl instanceof H)) {
      return;
    }
    const rawVariant = (this.el.getAttribute("variant") || "text").toLowerCase();
    const variant = rawVariant === "text" && lines > 1 ? "paragraph" : rawVariant;
    root.dataset.variant = variant;
    root.dataset.animate = this.el.hasAttribute("static") ? "off" : "on";
    if (variant !== "paragraph") {
      linesEl.replaceChildren();
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
    linesEl.replaceChildren(...nodes);
  }
  apply() {
    this.applyHostVars();
    const root = this.el.shadowRoot?.querySelector(".root");
    if (!(root instanceof H)) {
      return;
    }
    const lines = Math.max(1, Number.parseInt(this.el.getAttribute("lines") || "1", 10) || 1);
    this.applyLines(root, lines);
  }
  componentDidRender() {
    this.apply();
  }
  render() {
    return h(Host, { key: "a7ab9b0d75f7b5c492efef933f36a4f56cc5615e" }, h("div", { key: "337872cda407cdaeed5394bbd32425388b7f0f90", class: "root", part: "root" }, h("div", { key: "e07a52fd50610e6853ad95764ea2da13eb77e89a", class: "lines", part: "lines" }), h("slot", { key: "7780eaa44f8e7766e14ac8d0889697fff3ad65e4" })));
  }
  static get style() {
    return bfSkeletonCss();
  }
}, [257, "bf-skeleton"]);
function defineCustomElement$161() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-skeleton"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-skeleton":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfSkeleton$1);
        }
        break;
    }
  });
}
var defineCustomElement61 = defineCustomElement$161;

// dist/_stencil/bf-split-button.js
var bfSplitButtonCss = () => `:host{--bf-split-button-font:var(--bf-theme-font-family, inherit);--bf-split-button-radius:var(--bf-theme-radius-md, 8px);--bf-split-button-border-width:var(--bf-theme-border-width, 1px);--bf-split-button-border-style:var(--bf-theme-border-style, solid);--bf-split-button-border-color:var(--bf-theme-split-button-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-split-button-bg:var(--bf-theme-split-button-bg, var(--bf-theme-surface-1, #ffffff));--bf-split-button-color:var(--bf-theme-split-button-color, var(--bf-theme-text-1, #0f172a));--bf-split-button-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-split-button-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-split-button-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-split-button-font);color:var(--bf-split-button-color)}.root{background:var(--bf-split-button-bg);color:var(--bf-split-button-color);border-width:var(--bf-split-button-border-width);border-style:var(--bf-split-button-border-style);border-color:var(--bf-split-button-border-color);border-radius:var(--bf-split-button-radius);padding:var(--bf-split-button-padding-y) var(--bf-split-button-padding-x);transition:var(--bf-split-button-transition)}`;
var BfSplitButton$1 = /* @__PURE__ */ proxyCustomElement(class BfSplitButton extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "24d749b06440303f878e09060987505d248bdedc" }, h("div", { key: "4fef1e7a44b674d131e7dbd03fa0df60d44c23b6", class: "root", part: "root" }, h("slot", { key: "f7773b81c5010ee9040cf2815aaaf1fba7b5edc8" })));
  }
  static get style() {
    return bfSplitButtonCss();
  }
}, [257, "bf-split-button"]);
function defineCustomElement$162() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-split-button"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-split-button":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfSplitButton$1);
        }
        break;
    }
  });
}
var defineCustomElement62 = defineCustomElement$162;

// dist/_stencil/bf-splitter.js
var bfSplitterCss = () => `:host{--bf-splitter-font:var(--bf-theme-font-family, inherit);--bf-splitter-radius:var(--bf-theme-radius-md, 8px);--bf-splitter-border-width:var(--bf-theme-border-width, 1px);--bf-splitter-border-style:var(--bf-theme-border-style, solid);--bf-splitter-border-color:var(--bf-theme-splitter-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-splitter-bg:var(--bf-theme-splitter-bg, var(--bf-theme-surface-1, #ffffff));--bf-splitter-color:var(--bf-theme-splitter-color, var(--bf-theme-text-1, #0f172a));--bf-splitter-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-splitter-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-splitter-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-splitter-font);color:var(--bf-splitter-color)}.root{background:var(--bf-splitter-bg);color:var(--bf-splitter-color);border-width:var(--bf-splitter-border-width);border-style:var(--bf-splitter-border-style);border-color:var(--bf-splitter-border-color);border-radius:var(--bf-splitter-radius);padding:var(--bf-splitter-padding-y) var(--bf-splitter-padding-x);transition:var(--bf-splitter-transition)}`;
var BfSplitter$1 = /* @__PURE__ */ proxyCustomElement(class BfSplitter extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "30c35ffee4bc0510ed1e9445fd7b3fef5fd62273" }, h("div", { key: "65e5ae89252e44e77cb614f63f1596e84322d4bf", class: "root", part: "root" }, h("slot", { key: "cddd9e551eae0e8fa3715fd81f73d7045dd0d96a" })));
  }
  static get style() {
    return bfSplitterCss();
  }
}, [257, "bf-splitter"]);
function defineCustomElement$163() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-splitter"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-splitter":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfSplitter$1);
        }
        break;
    }
  });
}
var defineCustomElement63 = defineCustomElement$163;

// dist/_stencil/bf-stack.js
var bfStackCss = () => `:host{--bf-stack-font:var(--bf-theme-font-family, inherit);--bf-stack-radius:var(--bf-theme-radius-md, 8px);--bf-stack-border-width:var(--bf-theme-border-width, 1px);--bf-stack-border-style:var(--bf-theme-border-style, solid);--bf-stack-border-color:var(--bf-theme-stack-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-stack-bg:var(--bf-theme-stack-bg, var(--bf-theme-surface-1, #ffffff));--bf-stack-color:var(--bf-theme-stack-color, var(--bf-theme-text-1, #0f172a));--bf-stack-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-stack-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-stack-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-stack-font);color:var(--bf-stack-color)}.root{background:var(--bf-stack-bg);color:var(--bf-stack-color);border-width:var(--bf-stack-border-width);border-style:var(--bf-stack-border-style);border-color:var(--bf-stack-border-color);border-radius:var(--bf-stack-radius);padding:var(--bf-stack-padding-y) var(--bf-stack-padding-x);transition:var(--bf-stack-transition)}`;
var BfStack$1 = /* @__PURE__ */ proxyCustomElement(class BfStack extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "2d22c14310575cb42049e1feee1d4232ad2f8247" }, h("div", { key: "73400642d6a3d48c005dde878a3a816d15d5750b", class: "root", part: "root" }, h("slot", { key: "19cd06815d9caf7f96bcc4c85f7737f180b344ab" })));
  }
  static get style() {
    return bfStackCss();
  }
}, [257, "bf-stack"]);
function defineCustomElement$164() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-stack"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-stack":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfStack$1);
        }
        break;
    }
  });
}
var defineCustomElement64 = defineCustomElement$164;

// dist/_stencil/bf-tab.js
var bfTabCss = () => `:host{--bf-tab-font:var(--bf-theme-font-family, inherit);--bf-tab-radius:var(--bf-theme-radius-md, 8px);--bf-tab-border-width:var(--bf-theme-border-width, 1px);--bf-tab-border-style:var(--bf-theme-border-style, solid);--bf-tab-border-color:var(--bf-theme-tab-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-tab-bg:var(--bf-theme-tab-bg, var(--bf-theme-surface-1, #ffffff));--bf-tab-color:var(--bf-theme-tab-color, var(--bf-theme-text-1, #0f172a));--bf-tab-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-tab-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-tab-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:inline-block;font:var(--bf-tab-font);color:var(--bf-tab-color)}.root{font:inherit;cursor:pointer;background:var(--bf-tab-bg);color:var(--bf-tab-color);border-width:var(--bf-tab-border-width);border-style:var(--bf-tab-border-style);border-color:var(--bf-tab-border-color);border-radius:var(--bf-tab-radius);padding:var(--bf-tab-padding-y) var(--bf-tab-padding-x);transition:var(--bf-tab-transition)}.root.is-selected{background:var(--bf-theme-button-primary-bg, #2563eb);color:var(--bf-theme-button-primary-color, #ffffff);border-color:var(--bf-theme-button-primary-border-color, #1d4ed8)}`;
var BfTab$1 = /* @__PURE__ */ proxyCustomElement(class BfTab extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "attrLabel");
    __publicField(this, "observer");
    __publicField(this, "onClick", () => {
      const group = this.el.getAttribute("group");
      if (group) {
        const peers = document.querySelectorAll(`bf-tab[group="${CSS.escape(group)}"]`);
        for (const peer of Array.from(peers)) {
          peer.toggleAttribute("selected", peer === this.el);
        }
      } else {
        this.selected = true;
      }
      this.el.dispatchEvent(new CustomEvent("bf-change", {
        bubbles: true,
        composed: true,
        detail: {
          group: group || "",
          value: this.value,
          selected: this.selected
        }
      }));
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  componentDidRender() {
    this.syncState();
  }
  handleLabel() {
    this.syncState();
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.syncState());
    this.observer.observe(this.el, {
      attributes: true,
      attributeFilter: ["selected", "disabled", "group", "label", "value"]
    });
  }
  disconnectedCallback() {
    this.observer?.disconnect();
  }
  get selected() {
    return this.el.hasAttribute("selected");
  }
  set selected(value) {
    if (value) {
      this.el.setAttribute("selected", "");
    } else {
      this.el.removeAttribute("selected");
    }
  }
  get value() {
    return this.el.getAttribute("value") || this.el.textContent?.trim() || "";
  }
  syncState() {
    const button = this.el.shadowRoot?.querySelector(".root");
    if (!(button instanceof HTMLButtonElement)) {
      return;
    }
    const labelAttr = this.el.getAttribute("label");
    if (labelAttr) {
      button.setAttribute("aria-label", labelAttr);
    } else {
      button.removeAttribute("aria-label");
    }
    button.disabled = this.el.hasAttribute("disabled");
    button.setAttribute("aria-selected", String(this.selected));
    button.setAttribute("role", "tab");
    button.classList.toggle("is-selected", this.selected);
  }
  render() {
    return h(Host, { key: "fdf393532e0e9846a3c0395f80c3c84a50270783" }, h("button", { key: "4c0ad86d07987394511bafce7028283aea60799b", class: "root", part: "root", type: "button", onClick: this.onClick }, h("slot", { key: "63a399a86492f1b134ca4d39a1446184e2317b5d" })));
  }
  static get watchers() {
    return {
      "attrLabel": [{
        "handleLabel": 0
      }]
    };
  }
  static get style() {
    return bfTabCss();
  }
}, [769, "bf-tab", {
  "attrLabel": [513, "label"]
}, void 0, {
  "attrLabel": [{
    "handleLabel": 0
  }]
}]);
function defineCustomElement$165() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-tab"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-tab":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfTab$1);
        }
        break;
    }
  });
}
var defineCustomElement65 = defineCustomElement$165;

// dist/_stencil/bf-table.js
var bfTableCss = () => `:host{--bf-table-font:var(--bf-theme-font-family, inherit);--bf-table-radius:var(--bf-theme-radius-md, 8px);--bf-table-border-width:var(--bf-theme-border-width, 1px);--bf-table-border-style:var(--bf-theme-border-style, solid);--bf-table-border-color:var(--bf-theme-table-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-table-bg:var(--bf-theme-table-bg, var(--bf-theme-surface-1, #ffffff));--bf-table-color:var(--bf-theme-table-color, var(--bf-theme-text-1, #0f172a));--bf-table-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-table-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-table-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-table-font);color:var(--bf-table-color)}.root{background:var(--bf-table-bg);color:var(--bf-table-color);border-width:var(--bf-table-border-width);border-style:var(--bf-table-border-style);border-color:var(--bf-table-border-color);border-radius:var(--bf-table-radius);padding:var(--bf-table-padding-y) var(--bf-table-padding-x);transition:var(--bf-table-transition)}`;
var BfTable$1 = /* @__PURE__ */ proxyCustomElement(class BfTable extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "e5ebac33d66372068a3890d5a5fb2cda29330bf6" }, h("div", { key: "df33c7680f642507c8463d2d4fac4897db4cac4b", class: "root", part: "root" }, h("slot", { key: "3a55189358e6371819a8dcdde8fedcec253faed5" })));
  }
  static get style() {
    return bfTableCss();
  }
}, [257, "bf-table"]);
function defineCustomElement$166() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-table"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-table":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfTable$1);
        }
        break;
    }
  });
}
var defineCustomElement66 = defineCustomElement$166;

// dist/_stencil/bf-tag.js
var bfTagCss = () => `:host{--bf-tag-font:var(--bf-theme-font-family, inherit);--bf-tag-radius:var(--bf-theme-radius-md, 8px);--bf-tag-border-width:var(--bf-theme-border-width, 1px);--bf-tag-border-style:var(--bf-theme-border-style, solid);--bf-tag-border-color:var(--bf-theme-tag-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-tag-bg:var(--bf-theme-tag-bg, var(--bf-theme-surface-1, #ffffff));--bf-tag-color:var(--bf-theme-tag-color, var(--bf-theme-text-1, #0f172a));--bf-tag-padding-y:0.35rem;--bf-tag-padding-x:0.55rem;--bf-tag-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:inline-block;font:var(--bf-tag-font);color:var(--bf-tag-color)}.root{display:inline-flex;align-items:center;justify-content:center;gap:0.3rem;line-height:1;font-size:0.82rem;font-weight:600;background:var(--bf-tag-bg);color:var(--bf-tag-color);border-width:var(--bf-tag-border-width);border-style:var(--bf-tag-border-style);border-color:var(--bf-tag-border-color);border-radius:var(--bf-tag-radius);padding:var(--bf-tag-padding-y) var(--bf-tag-padding-x);transition:var(--bf-tag-transition)}.root[data-size='sm']{font-size:0.74rem;padding:0.22rem 0.42rem}.root[data-size='lg']{font-size:0.9rem;padding:0.45rem 0.68rem}.root[data-variant='badge']{font-size:0.72rem;font-weight:700;min-width:1.35rem;padding:0.14rem 0.42rem;border-radius:999px}.root[data-variant='pill']{border-radius:999px}.root[data-variant='chip']{padding-right:0.75rem}`;
var BfTag$1 = /* @__PURE__ */ proxyCustomElement(class BfTag extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "observer");
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.applyRoot());
    this.observer.observe(this.el, { attributes: true });
    this.applyRoot();
  }
  disconnectedCallback() {
    this.observer?.disconnect();
  }
  applyRoot() {
    const root = this.el.shadowRoot?.querySelector(".root");
    if (!(root instanceof H)) {
      return;
    }
    const explicit = (this.el.getAttribute("variant") || "").toLowerCase();
    let variant = "tag";
    if (["tag", "badge", "chip", "pill"].includes(explicit)) {
      variant = explicit;
    } else if (this.el.hasAttribute("badge")) {
      variant = "badge";
    } else if (this.el.hasAttribute("chip")) {
      variant = "chip";
    } else if (this.el.hasAttribute("pill")) {
      variant = "pill";
    }
    root.dataset.variant = variant;
    const size = (this.el.getAttribute("size") || "md").toLowerCase();
    root.dataset.size = ["sm", "md", "lg"].includes(size) ? size : "md";
  }
  componentDidRender() {
    this.applyRoot();
  }
  render() {
    return h(Host, { key: "f6efa304958f4ad2ea66a6e873046cc9162743f6" }, h("div", { key: "86d2fd5bad1b5268b042104274e83df50d815962", class: "root", part: "root", "data-variant": "tag", "data-size": "md" }, h("slot", { key: "9a0ebb636c5799665afb013a5d45ea5cf7865b9c" })));
  }
  static get style() {
    return bfTagCss();
  }
}, [257, "bf-tag"]);
function defineCustomElement$167() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-tag"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-tag":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfTag$1);
        }
        break;
    }
  });
}
var defineCustomElement67 = defineCustomElement$167;

// dist/_stencil/bf-timeline.js
var bfTimelineCss = () => `:host{--bf-timeline-font:var(--bf-theme-font-family, inherit);--bf-timeline-radius:var(--bf-theme-radius-md, 8px);--bf-timeline-border-width:var(--bf-theme-border-width, 1px);--bf-timeline-border-style:var(--bf-theme-border-style, solid);--bf-timeline-border-color:var(--bf-theme-timeline-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-timeline-bg:var(--bf-theme-timeline-bg, var(--bf-theme-surface-1, #ffffff));--bf-timeline-color:var(--bf-theme-timeline-color, var(--bf-theme-text-1, #0f172a));--bf-timeline-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-timeline-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-timeline-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-timeline-font);color:var(--bf-timeline-color)}.root{background:var(--bf-timeline-bg);color:var(--bf-timeline-color);border-width:var(--bf-timeline-border-width);border-style:var(--bf-timeline-border-style);border-color:var(--bf-timeline-border-color);border-radius:var(--bf-timeline-radius);padding:var(--bf-timeline-padding-y) var(--bf-timeline-padding-x);transition:var(--bf-timeline-transition)}`;
var BfTimeline$1 = /* @__PURE__ */ proxyCustomElement(class BfTimeline extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "9ed907402843ec1555bd1b7bc92208990f8d1c12" }, h("div", { key: "5feacfe174691f10395a8ceb7fa4e01a29332b70", class: "root", part: "root" }, h("slot", { key: "26e2ee8b28fd75bfb7201b6f449ec65523d00c8e" })));
  }
  static get style() {
    return bfTimelineCss();
  }
}, [257, "bf-timeline"]);
function defineCustomElement$168() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-timeline"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-timeline":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfTimeline$1);
        }
        break;
    }
  });
}
var defineCustomElement68 = defineCustomElement$168;

// dist/_stencil/bf-toast.js
var bfToastCss = () => `:host{--bf-toast-font:var(--bf-theme-font-family, inherit);--bf-toast-radius:var(--bf-theme-radius-md, 8px);--bf-toast-border-width:var(--bf-theme-border-width, 1px);--bf-toast-border-style:var(--bf-theme-border-style, solid);--bf-toast-border-color:var(--bf-theme-toast-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-toast-bg:var(--bf-theme-toast-bg, var(--bf-theme-surface-1, #ffffff));--bf-toast-color:var(--bf-theme-toast-color, var(--bf-theme-text-1, #0f172a));--bf-toast-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-toast-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-toast-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);--bf-toast-success-bg:var(--bf-theme-success-bg, #dcfce7);--bf-toast-success-color:var(--bf-theme-success-color, #166534);--bf-toast-warning-bg:var(--bf-theme-warning-bg, #fef3c7);--bf-toast-warning-color:var(--bf-theme-warning-color, #92400e);--bf-toast-error-bg:var(--bf-theme-error-bg, #fee2e2);--bf-toast-error-color:var(--bf-theme-error-color, #991b1b);--bf-toast-info-bg:var(--bf-theme-info-bg, var(--bf-toast-bg));--bf-toast-info-color:var(--bf-theme-info-color, var(--bf-toast-color));--bf-toast-snackbar-bg:var(--bf-theme-snackbar-bg, #111827);--bf-toast-snackbar-color:var(--bf-theme-snackbar-color, #f8fafc);display:block;font:var(--bf-toast-font);color:var(--bf-toast-color);z-index:1000}.root{display:grid;grid-template-columns:auto 1fr auto;align-items:start;gap:0.5rem;min-width:16rem;max-width:30rem;background:var(--bf-toast-bg);color:var(--bf-toast-color);border-width:var(--bf-toast-border-width);border-style:var(--bf-toast-border-style);border-color:var(--bf-toast-border-color);border-radius:var(--bf-toast-radius);padding:var(--bf-toast-padding-y) var(--bf-toast-padding-x);transition:var(--bf-toast-transition);box-shadow:0 8px 28px rgba(15, 23, 42, 0.18)}.icon{width:1.1rem;height:1.1rem;display:inline-flex;align-items:center;justify-content:center;font-weight:700;line-height:1;margin-top:0.1rem}.content{min-width:0}.close{border:0;background:transparent;color:currentColor;font:inherit;line-height:1;cursor:pointer;padding:0;opacity:0.75}.close:hover{opacity:1}.root[data-open='false']{display:none}.root[data-variant='alert']{border-left-width:4px}.root[data-variant='notification']{border-radius:calc(var(--bf-toast-radius) + 4px)}.root[data-variant='snackbar']{background:var(--bf-toast-snackbar-bg);color:var(--bf-toast-snackbar-color);border-color:transparent;border-radius:999px;padding-inline:0.9rem;min-width:14rem}.root[data-variant='snackbar'] .icon{display:none}.root[data-variant='banner']{width:min(100%, 64rem);max-width:64rem;border-radius:10px;box-shadow:none}.root[data-variant='banner'] .icon{display:none}.root[data-type='success']{background:var(--bf-toast-success-bg);color:var(--bf-toast-success-color)}.root[data-type='warning']{background:var(--bf-toast-warning-bg);color:var(--bf-toast-warning-color)}.root[data-type='error']{background:var(--bf-toast-error-bg);color:var(--bf-toast-error-color)}.root[data-type='info']{background:var(--bf-toast-info-bg);color:var(--bf-toast-info-color)}.root[data-variant='snackbar'][data-type='success'],.root[data-variant='snackbar'][data-type='warning'],.root[data-variant='snackbar'][data-type='error'],.root[data-variant='snackbar'][data-type='info']{background:var(--bf-toast-snackbar-bg);color:var(--bf-toast-snackbar-color)}`;
var BfToast$1 = /* @__PURE__ */ proxyCustomElement(class BfToast extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "observer");
    __publicField(this, "durationTimer");
    __publicField(this, "onCloseClick", () => {
      this.hide();
      this.el.dispatchEvent(new CustomEvent("bf-close", {
        bubbles: true,
        composed: true,
        detail: { id: this.el.id || "" }
      }));
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this.el, {
      attributes: true
    });
  }
  disconnectedCallback() {
    this.observer?.disconnect();
    this.clearDurationTimer();
  }
  async show() {
    this.el.setAttribute("open", "");
  }
  async hide() {
    this.el.removeAttribute("open");
  }
  get open() {
    return this.el.hasAttribute("open");
  }
  set open(next) {
    if (next) {
      this.el.setAttribute("open", "");
    } else {
      this.el.removeAttribute("open");
    }
  }
  variant() {
    const explicit = (this.el.getAttribute("variant") || "").toLowerCase();
    if (["toast", "alert", "notification", "snackbar", "banner"].includes(explicit)) {
      return explicit;
    }
    if (this.el.hasAttribute("alert")) {
      return "alert";
    }
    if (this.el.hasAttribute("notification")) {
      return "notification";
    }
    if (this.el.hasAttribute("snackbar")) {
      return "snackbar";
    }
    if (this.el.hasAttribute("banner")) {
      return "banner";
    }
    return "toast";
  }
  type() {
    const explicit = (this.el.getAttribute("type") || "").toLowerCase();
    if (["success", "warning", "error", "info"].includes(explicit)) {
      return explicit;
    }
    if (this.el.hasAttribute("success")) {
      return "success";
    }
    if (this.el.hasAttribute("warning")) {
      return "warning";
    }
    if (this.el.hasAttribute("error")) {
      return "error";
    }
    return "info";
  }
  isValidPosition(position) {
    return [
      "top-left",
      "top-center",
      "top-right",
      "bottom-left",
      "bottom-center",
      "bottom-right"
    ].includes(position);
  }
  position() {
    const variant = this.variant();
    const explicit = (this.el.getAttribute("position") || "").toLowerCase().replace(/\s+/g, "-");
    if (explicit && this.isValidPosition(explicit)) {
      return explicit;
    }
    if (variant === "snackbar" && !this.el.hasAttribute("top") && !this.el.hasAttribute("bottom") && !this.el.hasAttribute("left") && !this.el.hasAttribute("right") && !this.el.hasAttribute("center") && !this.el.hasAttribute("position")) {
      return "bottom-center";
    }
    if (variant === "banner" && !this.el.hasAttribute("top") && !this.el.hasAttribute("bottom") && !this.el.hasAttribute("left") && !this.el.hasAttribute("right") && !this.el.hasAttribute("center") && !this.el.hasAttribute("position")) {
      return "top-center";
    }
    const y = this.el.hasAttribute("bottom") ? "bottom" : "top";
    let x = "right";
    if (this.el.hasAttribute("left")) {
      x = "left";
    }
    if (this.el.hasAttribute("center")) {
      x = "center";
    }
    if (this.el.hasAttribute("right")) {
      x = "right";
    }
    return `${y}-${x}`;
  }
  duration() {
    const parsed = Number.parseInt(this.el.getAttribute("duration") || "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }
  iconSymbol() {
    switch (this.type()) {
      case "success":
        return "\u2713";
      case "warning":
        return "!";
      case "error":
        return "x";
      default:
        return "i";
    }
  }
  clearDurationTimer() {
    if (!this.durationTimer) {
      return;
    }
    clearTimeout(this.durationTimer);
    this.durationTimer = void 0;
  }
  scheduleAutoHide() {
    this.clearDurationTimer();
    const ms = this.duration();
    if (!this.open || ms <= 0) {
      return;
    }
    this.durationTimer = setTimeout(() => {
      this.hide();
    }, ms);
  }
  applyPosition(position) {
    const anchored = this.el.hasAttribute("position") || this.el.hasAttribute("top") || this.el.hasAttribute("bottom") || this.el.hasAttribute("left") || this.el.hasAttribute("right") || this.el.hasAttribute("center");
    if (!anchored) {
      this.el.style.position = "";
      this.el.style.top = "";
      this.el.style.bottom = "";
      this.el.style.left = "";
      this.el.style.right = "";
      this.el.style.transform = "";
      this.el.style.zIndex = "";
      return;
    }
    this.el.style.position = "fixed";
    this.el.style.zIndex = "1000";
    this.el.style.top = "";
    this.el.style.bottom = "";
    this.el.style.left = "";
    this.el.style.right = "";
    this.el.style.transform = "";
    const [y, x] = position.split("-");
    if (y === "bottom") {
      this.el.style.bottom = "1rem";
    } else {
      this.el.style.top = "1rem";
    }
    if (x === "left") {
      this.el.style.left = "1rem";
    } else if (x === "right") {
      this.el.style.right = "1rem";
    } else {
      this.el.style.left = "50%";
      this.el.style.transform = "translateX(-50%)";
    }
  }
  sync() {
    const root = this.el.shadowRoot?.querySelector(".root");
    const icon = this.el.shadowRoot?.querySelector(".icon");
    if (!(root instanceof H) || !(icon instanceof H)) {
      return;
    }
    const variant = this.variant();
    const type = this.type();
    const position = this.position();
    if (!this.el.hasAttribute("open")) {
      this.el.setAttribute("open", "");
    }
    root.setAttribute("data-variant", variant);
    root.setAttribute("data-type", type);
    root.setAttribute("data-position", position);
    root.setAttribute("data-open", this.open ? "true" : "false");
    icon.textContent = this.iconSymbol();
    this.applyPosition(position);
    this.el.setAttribute("role", variant === "alert" ? "alert" : "status");
    this.el.setAttribute("aria-live", variant === "alert" ? "assertive" : "polite");
    this.scheduleAutoHide();
  }
  componentDidRender() {
    this.sync();
  }
  render() {
    return h(Host, { key: "144ee0bd6a794545ee5eaf2eb8a47c52cdad25eb" }, h("div", { key: "c5ea1c10c22a534076d50cc5751cd85cb9221a91", class: "root", part: "root" }, h("span", { key: "8d0817a1919b1d5675fc2de9333d15acddd4f837", class: "icon", part: "icon", "aria-hidden": "true" }), h("div", { key: "b6543ae6fdd16333e8d3f9f3b2c165ab1cce7c77", class: "content", part: "content" }, h("slot", { key: "065d21f25a050f83a0eb416f108288b6a53015f5" })), h("button", { key: "d6c7e3a151723dc920f14c958a176cdb98a69b52", class: "close", part: "close", type: "button", "aria-label": "Close", onClick: this.onCloseClick }, "\xD7")));
  }
  static get style() {
    return bfToastCss();
  }
}, [257, "bf-toast", {
  "show": [64],
  "hide": [64]
}]);
function defineCustomElement$169() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-toast"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-toast":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfToast$1);
        }
        break;
    }
  });
}
var defineCustomElement69 = defineCustomElement$169;

// dist/_stencil/bf-toggle.js
var bfToggleCss = () => `:host{--bf-toggle-font:var(--bf-theme-font-family, inherit);--bf-toggle-radius:var(--bf-theme-radius-md, 8px);--bf-toggle-border-width:var(--bf-theme-border-width, 1px);--bf-toggle-border-style:var(--bf-theme-border-style, solid);--bf-toggle-border-color:var(--bf-theme-toggle-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-toggle-bg:var(--bf-theme-toggle-bg, var(--bf-theme-surface-1, #ffffff));--bf-toggle-color:var(--bf-theme-toggle-color, var(--bf-theme-text-1, #0f172a));--bf-toggle-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-toggle-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-toggle-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-toggle-font);color:var(--bf-toggle-color)}.root{display:inline-flex;align-items:center;gap:0.55rem;background:var(--bf-toggle-bg);color:var(--bf-toggle-color);border-width:var(--bf-toggle-border-width);border-style:var(--bf-toggle-border-style);border-color:var(--bf-toggle-border-color);border-radius:var(--bf-toggle-radius);padding:var(--bf-toggle-padding-y) var(--bf-toggle-padding-x);transition:var(--bf-toggle-transition);cursor:pointer}.track{display:none}.root[data-variant='switch']{border-color:transparent;background:transparent;padding:0}.root[data-variant='switch'] .track{display:inline-flex;align-items:center;width:2.2rem;height:1.3rem;border-radius:999px;background:var(--bf-theme-surface-2, #cbd5e1);padding:0.15rem;transition:background-color 140ms ease}.root[data-variant='switch'] .thumb{width:1rem;height:1rem;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0, 0, 0, 0.2);transform:translateX(0);transition:transform 140ms ease}.root[data-variant='switch'].is-checked .track{background:var(--bf-theme-button-primary-bg, #2563eb)}.root[data-variant='switch'].is-checked .thumb{transform:translateX(0.9rem)}.root[data-variant='toggle'].is-checked{background:color-mix(in srgb, var(--bf-theme-button-primary-bg, #2563eb) 12%, var(--bf-toggle-bg));border-color:var(--bf-theme-button-primary-bg, #2563eb)}.root:disabled{opacity:0.55;cursor:not-allowed}`;
var BfToggle$1 = /* @__PURE__ */ proxyCustomElement(class BfToggle extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "attrLabel");
    __publicField(this, "observer");
    __publicField(this, "onClick", () => {
      if (this.el.hasAttribute("disabled")) {
        return;
      }
      this.checked = !this.checked;
      this.el.dispatchEvent(new CustomEvent("bf-change", {
        bubbles: true,
        composed: true,
        detail: {
          checked: this.checked
        }
      }));
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  componentDidRender() {
    this.sync();
  }
  handleLabel() {
    this.sync();
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this.el, {
      attributes: true,
      attributeFilter: ["checked", "disabled", "label", "switch", "variant"]
    });
  }
  disconnectedCallback() {
    this.observer?.disconnect();
  }
  get checked() {
    return this.el.hasAttribute("checked");
  }
  set checked(next) {
    if (next) {
      this.el.setAttribute("checked", "");
    } else {
      this.el.removeAttribute("checked");
    }
  }
  variant() {
    const variant = (this.el.getAttribute("variant") || "").toLowerCase();
    if (variant === "switch" || this.el.hasAttribute("switch")) {
      return "switch";
    }
    return "toggle";
  }
  sync() {
    const root = this.el.shadowRoot?.querySelector(".root");
    const text = this.el.shadowRoot?.querySelector(".text");
    if (!(root instanceof HTMLButtonElement) || !(text instanceof H)) {
      return;
    }
    const variant = this.variant();
    root.setAttribute("data-variant", variant);
    root.setAttribute("aria-pressed", String(this.checked));
    root.setAttribute("role", "switch");
    root.setAttribute("aria-checked", String(this.checked));
    root.disabled = this.el.hasAttribute("disabled");
    root.classList.toggle("is-checked", this.checked);
    const labelAttr = this.el.getAttribute("label");
    if (labelAttr) {
      root.setAttribute("aria-label", labelAttr);
    } else {
      root.removeAttribute("aria-label");
    }
    text.hidden = variant === "switch" && !(this.el.textContent || "").trim();
  }
  render() {
    return h(Host, { key: "b333ee9819595d3fd88be22aab7344d8a2f2b1a5" }, h("button", { key: "5489e3a452ecfe09124611167cec46871688868b", class: "root", part: "root", type: "button", onClick: this.onClick }, h("span", { key: "73615ce76c5c494fe45f6848018c39a5e873440e", class: "track", part: "track" }, h("span", { key: "e3c9b91251b8dfff5ddfb1349aa2f84183c44be0", class: "thumb", part: "thumb" })), h("span", { key: "2def954163460dd24e769354a4e623012c92f15b", class: "text", part: "text" }, h("slot", { key: "1ad28071dad3fa850db71be970c406b3731bcc7f" }))));
  }
  static get watchers() {
    return {
      "attrLabel": [{
        "handleLabel": 0
      }]
    };
  }
  static get style() {
    return bfToggleCss();
  }
}, [769, "bf-toggle", {
  "attrLabel": [513, "label"]
}, void 0, {
  "attrLabel": [{
    "handleLabel": 0
  }]
}]);
function defineCustomElement$170() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-toggle"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-toggle":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfToggle$1);
        }
        break;
    }
  });
}
var defineCustomElement70 = defineCustomElement$170;

// dist/_stencil/bf-toolbar.js
var bfToolbarCss = () => `:host{--bf-toolbar-font:var(--bf-theme-font-family, inherit);--bf-toolbar-radius:var(--bf-theme-radius-md, 8px);--bf-toolbar-border-width:var(--bf-theme-border-width, 1px);--bf-toolbar-border-style:var(--bf-theme-border-style, solid);--bf-toolbar-border-color:var(--bf-theme-toolbar-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-toolbar-bg:var(--bf-theme-toolbar-bg, var(--bf-theme-surface-1, #ffffff));--bf-toolbar-color:var(--bf-theme-toolbar-color, var(--bf-theme-text-1, #0f172a));--bf-toolbar-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-toolbar-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-toolbar-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-toolbar-font);color:var(--bf-toolbar-color)}.root{background:var(--bf-toolbar-bg);color:var(--bf-toolbar-color);border-width:var(--bf-toolbar-border-width);border-style:var(--bf-toolbar-border-style);border-color:var(--bf-toolbar-border-color);border-radius:var(--bf-toolbar-radius);padding:var(--bf-toolbar-padding-y) var(--bf-toolbar-padding-x);transition:var(--bf-toolbar-transition)}`;
var BfToolbar$1 = /* @__PURE__ */ proxyCustomElement(class BfToolbar extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "6ced500fd14a5703325e83b6f67963855205212b" }, h("div", { key: "a4ed455dbfd06fedef63a5b9e220ca6f32c6209c", class: "root", part: "root" }, h("slot", { key: "a6c8dbd8d47e167c73a6f030e32d0f5538ee46f2" })));
  }
  static get style() {
    return bfToolbarCss();
  }
}, [257, "bf-toolbar"]);
function defineCustomElement$171() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-toolbar"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-toolbar":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfToolbar$1);
        }
        break;
    }
  });
}
var defineCustomElement71 = defineCustomElement$171;

// dist/_stencil/bf-tree-view.js
var bfTreeViewCss = () => `:host{--bf-tree-view-font:var(--bf-theme-font-family, inherit);--bf-tree-view-radius:var(--bf-theme-radius-md, 8px);--bf-tree-view-border-width:var(--bf-theme-border-width, 1px);--bf-tree-view-border-style:var(--bf-theme-border-style, solid);--bf-tree-view-border-color:var(--bf-theme-tree-view-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-tree-view-bg:var(--bf-theme-tree-view-bg, var(--bf-theme-surface-1, #ffffff));--bf-tree-view-color:var(--bf-theme-tree-view-color, var(--bf-theme-text-1, #0f172a));--bf-tree-view-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-tree-view-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-tree-view-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-tree-view-font);color:var(--bf-tree-view-color)}.root{background:var(--bf-tree-view-bg);color:var(--bf-tree-view-color);border-width:var(--bf-tree-view-border-width);border-style:var(--bf-tree-view-border-style);border-color:var(--bf-tree-view-border-color);border-radius:var(--bf-tree-view-radius);padding:var(--bf-tree-view-padding-y) var(--bf-tree-view-padding-x);transition:var(--bf-tree-view-transition)}`;
var BfTreeView$1 = /* @__PURE__ */ proxyCustomElement(class BfTreeView extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "fda0da87d487ddb86fb29e2e0adaa7c2df83e2d6" }, h("div", { key: "9dc6b6e5d9f8422c06165bc6e64ef0bd44ec0ded", class: "root", part: "root" }, h("slot", { key: "69804513da7917ea1e83938b2041df57ecdf110c" })));
  }
  static get style() {
    return bfTreeViewCss();
  }
}, [257, "bf-tree-view"]);
function defineCustomElement$172() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-tree-view"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-tree-view":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfTreeView$1);
        }
        break;
    }
  });
}
var defineCustomElement72 = defineCustomElement$172;

// dist/_stencil/bf-video-player.js
var bfVideoPlayerCss = () => `:host{--bf-video-player-font:var(--bf-theme-font-family, inherit);--bf-video-player-radius:var(--bf-theme-radius-md, 8px);--bf-video-player-border-width:var(--bf-theme-border-width, 1px);--bf-video-player-border-style:var(--bf-theme-border-style, solid);--bf-video-player-border-color:var(--bf-theme-video-player-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-video-player-bg:var(--bf-theme-video-player-bg, var(--bf-theme-surface-1, #ffffff));--bf-video-player-color:var(--bf-theme-video-player-color, var(--bf-theme-text-1, #0f172a));--bf-video-player-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-video-player-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-video-player-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-video-player-font);color:var(--bf-video-player-color)}.root{background:var(--bf-video-player-bg);color:var(--bf-video-player-color);border-width:var(--bf-video-player-border-width);border-style:var(--bf-video-player-border-style);border-color:var(--bf-video-player-border-color);border-radius:var(--bf-video-player-radius);padding:var(--bf-video-player-padding-y) var(--bf-video-player-padding-x);transition:var(--bf-video-player-transition)}`;
var BfVideoPlayer$1 = /* @__PURE__ */ proxyCustomElement(class BfVideoPlayer extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "81419556ddfb42db0612fb581b7aed31b6eb3165" }, h("div", { key: "f514c2f2a6584f493c6dc4e5d22c35271171e874", class: "root", part: "root" }, h("slot", { key: "8614f59db2b75655302ac83711e05e86f4c7f1d8" })));
  }
  static get style() {
    return bfVideoPlayerCss();
  }
}, [257, "bf-video-player"]);
function defineCustomElement$173() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-video-player"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-video-player":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfVideoPlayer$1);
        }
        break;
    }
  });
}
var defineCustomElement73 = defineCustomElement$173;

// dist/_stencil/bf-virtual-list.js
var bfVirtualListCss = () => `:host{--bf-virtual-list-font:var(--bf-theme-font-family, inherit);--bf-virtual-list-radius:var(--bf-theme-radius-md, 8px);--bf-virtual-list-border-width:var(--bf-theme-border-width, 1px);--bf-virtual-list-border-style:var(--bf-theme-border-style, solid);--bf-virtual-list-border-color:var(--bf-theme-virtual-list-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-virtual-list-bg:var(--bf-theme-virtual-list-bg, var(--bf-theme-surface-1, #ffffff));--bf-virtual-list-color:var(--bf-theme-virtual-list-color, var(--bf-theme-text-1, #0f172a));--bf-virtual-list-padding-y:var(--bf-theme-space-2, 0.6rem);--bf-virtual-list-padding-x:var(--bf-theme-space-3, 0.9rem);--bf-virtual-list-transition:var(--bf-theme-transition-bg, background-color 120ms ease),   var(--bf-theme-transition-color, color 120ms ease),   var(--bf-theme-transition-border, border-color 120ms ease);display:block;font:var(--bf-virtual-list-font);color:var(--bf-virtual-list-color)}.root{background:var(--bf-virtual-list-bg);color:var(--bf-virtual-list-color);border-width:var(--bf-virtual-list-border-width);border-style:var(--bf-virtual-list-border-style);border-color:var(--bf-virtual-list-border-color);border-radius:var(--bf-virtual-list-radius);padding:var(--bf-virtual-list-padding-y) var(--bf-virtual-list-padding-x);transition:var(--bf-virtual-list-transition)}`;
var BfVirtualList$1 = /* @__PURE__ */ proxyCustomElement(class BfVirtualList extends H {
  constructor(registerHost2) {
    super();
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  render() {
    return h(Host, { key: "1e22e7e61a688281ddb4e38a157760b88813e0cb" }, h("div", { key: "49e968183b15b2088232b02c1d3fe1645148c226", class: "root", part: "root" }, h("slot", { key: "b0e8e0c6ec3e6d78ef376bfdcf5aa77860945ea8" })));
  }
  static get style() {
    return bfVirtualListCss();
  }
}, [257, "bf-virtual-list"]);
function defineCustomElement$174() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-virtual-list"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-virtual-list":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfVirtualList$1);
        }
        break;
    }
  });
}
var defineCustomElement74 = defineCustomElement$174;

// dist/_stencil/bf-wizard.js
var bfWizardCss = () => `:host{--bf-wizard-font:var(--bf-theme-font-family, inherit);--bf-wizard-radius:var(--bf-theme-radius-md, 10px);--bf-wizard-border-color:var(--bf-theme-wizard-border-color, var(--bf-theme-border-1, #cbd5e1));--bf-wizard-bg:var(--bf-theme-wizard-bg, var(--bf-theme-surface-1, #ffffff));--bf-wizard-color:var(--bf-theme-wizard-color, var(--bf-theme-text-1, #0f172a));--bf-wizard-accent:var(--bf-theme-button-primary-bg, #2563eb);--bf-wizard-muted:var(--bf-theme-text-2, #64748b);display:block;font:var(--bf-wizard-font);color:var(--bf-wizard-color)}.root{background:var(--bf-wizard-bg);color:var(--bf-wizard-color);border:1px solid var(--bf-wizard-border-color);border-radius:var(--bf-wizard-radius);padding:0.85rem;display:grid;gap:0.8rem}.steps{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:0.55rem}.steps li{display:inline-flex;align-items:center;gap:0.4rem;color:var(--bf-wizard-muted)}.steps .dot{width:1.4rem;height:1.4rem;border-radius:999px;border:1px solid var(--bf-wizard-border-color);display:inline-flex;align-items:center;justify-content:center;font-size:0.78rem}.steps li.current{color:var(--bf-wizard-color);font-weight:600}.steps li.current .dot{background:var(--bf-wizard-accent);color:#fff;border-color:var(--bf-wizard-accent)}.steps li.done .dot{border-color:var(--bf-wizard-accent);color:var(--bf-wizard-accent)}.content.is-empty{display:none}.actions{display:flex;justify-content:space-between;gap:0.6rem}.actions button{border:1px solid var(--bf-wizard-border-color);background:var(--bf-theme-surface-1, #fff);color:inherit;border-radius:7px;padding:0.35rem 0.7rem;cursor:pointer}.actions button:disabled{opacity:0.55;cursor:not-allowed}.root[data-mode='stepper'] .content,.root[data-mode='stepper'] .actions{display:none}`;
var BfWizard$1 = /* @__PURE__ */ proxyCustomElement(class BfWizard extends H {
  constructor(registerHost2) {
    super();
    __publicField(this, "observer");
    __publicField(this, "onPrevClick", async () => {
      await this.prev();
      this.emitChange();
    });
    __publicField(this, "onNextClick", async () => {
      await this.next();
      this.emitChange();
    });
    if (registerHost2 !== false) {
      this.__registerHost();
    }
    this.__attachShadow();
  }
  get el() {
    return this;
  }
  connectedCallback() {
    this.observer = new MutationObserver(() => this.sync());
    this.observer.observe(this.el, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  disconnectedCallback() {
    this.observer?.disconnect();
  }
  async next() {
    this.el.setAttribute("step", `${Math.min(this.items().length, this.stepValue() + 1)}`);
  }
  async prev() {
    this.el.setAttribute("step", `${Math.max(1, this.stepValue() - 1)}`);
  }
  get step() {
    return this.stepValue();
  }
  set step(next) {
    this.el.setAttribute("step", `${next}`);
  }
  mode() {
    const mode = (this.el.getAttribute("mode") || "").toLowerCase();
    if (mode === "stepper" || this.el.hasAttribute("stepper")) {
      return "stepper";
    }
    return "wizard";
  }
  items() {
    const explicit = (this.el.getAttribute("steps") || "").split(",").map((item) => item.trim()).filter(Boolean);
    if (explicit.length) {
      return explicit;
    }
    const titles = Array.from(this.el.children).filter((child) => child.tagName.toLowerCase() === "section").map((panel) => panel.getAttribute("title") || panel.id || "Step");
    if (titles.length) {
      return titles;
    }
    return ["Step 1", "Step 2", "Step 3"];
  }
  stepValue() {
    const parsed = Number.parseInt(this.el.getAttribute("step") || "1", 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      return 1;
    }
    return Math.min(parsed, this.items().length);
  }
  emitChange() {
    this.el.dispatchEvent(new CustomEvent("bf-change", {
      bubbles: true,
      composed: true,
      detail: {
        step: this.stepValue(),
        mode: this.mode()
      }
    }));
  }
  renderSteps(items, current) {
    const ol = this.el.shadowRoot?.querySelector(".steps");
    if (!(ol instanceof HTMLOListElement)) {
      return;
    }
    ol.replaceChildren();
    items.forEach((label, index) => {
      const li = document.createElement("li");
      const stepNumber = index + 1;
      if (stepNumber === current) {
        li.classList.add("current");
      } else if (stepNumber < current) {
        li.classList.add("done");
      }
      li.innerHTML = `<span class="dot">${stepNumber}</span><span class="label">${label}</span>`;
      ol.append(li);
    });
  }
  syncPanels(current) {
    const content = this.el.shadowRoot?.querySelector(".content");
    const panels = Array.from(this.el.children).filter((child) => child.tagName.toLowerCase() === "section");
    if (!(content instanceof H)) {
      return;
    }
    if (!panels.length) {
      content.classList.add("is-empty");
      return;
    }
    content.classList.remove("is-empty");
    panels.forEach((panel, index) => {
      panel.hidden = index + 1 !== current;
    });
  }
  sync() {
    const root = this.el.shadowRoot?.querySelector(".root");
    const prevBtn = this.el.shadowRoot?.querySelector(".prev");
    const nextBtn = this.el.shadowRoot?.querySelector(".next");
    if (!(root instanceof H) || !(prevBtn instanceof HTMLButtonElement) || !(nextBtn instanceof HTMLButtonElement)) {
      return;
    }
    const mode = this.mode();
    const items = this.items();
    const current = this.stepValue();
    root.setAttribute("data-mode", mode);
    this.renderSteps(items, current);
    this.syncPanels(current);
    prevBtn.hidden = mode === "stepper";
    nextBtn.hidden = mode === "stepper";
    prevBtn.disabled = current <= 1;
    nextBtn.disabled = current >= items.length;
  }
  componentDidRender() {
    this.sync();
  }
  render() {
    return h(Host, { key: "f8a590a2ab2386272185bd2ccd4fa2323ee1a074" }, h("div", { key: "e345a7b5ab86f3f6715c44fb36653c4c08bfda5f", class: "root", part: "root" }, h("ol", { key: "7be919cf2d067c1cd513d0468d7ac0ab4f9befcc", class: "steps", part: "steps" }), h("div", { key: "0fabb7c728c6537044b59e664eb81bb84cff9e83", class: "content", part: "content" }, h("slot", { key: "40e4b4a843b603cba35a0d340460ba1757571d26", onSlotchange: () => this.sync() })), h("div", { key: "bbbf120ac19bae03731394936d6839edebe2fb14", class: "actions", part: "actions" }, h("button", { key: "02172375a532359b66209d583cbc829a6e0b4115", class: "prev", type: "button", part: "prev", onClick: this.onPrevClick }, "Back"), h("button", { key: "5abb8514fcfaac01b1626e3d8944b602ae296d3e", class: "next", type: "button", part: "next", onClick: this.onNextClick }, "Next"))));
  }
  static get style() {
    return bfWizardCss();
  }
}, [257, "bf-wizard", {
  "next": [64],
  "prev": [64]
}]);
function defineCustomElement$175() {
  if (typeof customElements === "undefined") {
    return;
  }
  const components = ["bf-wizard"];
  components.forEach((tagName) => {
    switch (tagName) {
      case "bf-wizard":
        if (!customElements.get(transformTag(tagName))) {
          customElements.define(transformTag(tagName), BfWizard$1);
        }
        break;
    }
  });
}
var defineCustomElement75 = defineCustomElement$175;

// src/stencil-bundle.ts
var _registry = [
  defineCustomElement,
  defineCustomElement2,
  defineCustomElement3,
  defineCustomElement4,
  defineCustomElement5,
  defineCustomElement6,
  defineCustomElement7,
  defineCustomElement8,
  defineCustomElement9,
  defineCustomElement10,
  defineCustomElement11,
  defineCustomElement12,
  defineCustomElement13,
  defineCustomElement14,
  defineCustomElement15,
  defineCustomElement16,
  defineCustomElement17,
  defineCustomElement18,
  defineCustomElement19,
  defineCustomElement20,
  defineCustomElement21,
  defineCustomElement22,
  defineCustomElement23,
  defineCustomElement24,
  defineCustomElement25,
  defineCustomElement26,
  defineCustomElement27,
  defineCustomElement28,
  defineCustomElement29,
  defineCustomElement30,
  defineCustomElement31,
  defineCustomElement32,
  defineCustomElement33,
  defineCustomElement34,
  defineCustomElement35,
  defineCustomElement36,
  defineCustomElement37,
  defineCustomElement38,
  defineCustomElement39,
  defineCustomElement40,
  defineCustomElement41,
  defineCustomElement42,
  defineCustomElement43,
  defineCustomElement44,
  defineCustomElement45,
  defineCustomElement46,
  defineCustomElement47,
  defineCustomElement48,
  defineCustomElement49,
  defineCustomElement50,
  defineCustomElement51,
  defineCustomElement52,
  defineCustomElement53,
  defineCustomElement54,
  defineCustomElement55,
  defineCustomElement56,
  defineCustomElement57,
  defineCustomElement58,
  defineCustomElement59,
  defineCustomElement60,
  defineCustomElement61,
  defineCustomElement62,
  defineCustomElement63,
  defineCustomElement64,
  defineCustomElement65,
  defineCustomElement66,
  defineCustomElement67,
  defineCustomElement68,
  defineCustomElement69,
  defineCustomElement70,
  defineCustomElement71,
  defineCustomElement72,
  defineCustomElement73,
  defineCustomElement74,
  defineCustomElement75
];
for (const define of _registry) {
  define();
}

// src/runtime/runtime.ts
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

// src/index.ts
setupBareframeRuntime();
