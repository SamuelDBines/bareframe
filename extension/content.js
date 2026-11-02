function selectorFor(el) {
  if (el.id) return `#${CSS.escape(el.id)}`;
  const parts = [];
  let node = el;
  while (node && node.nodeType === 1 && parts.length < 4) {
    let part = node.nodeName.toLowerCase();
    if (node.classList?.length) part += '.' + [...node.classList].slice(0, 2).join('.');
    parts.unshift(part);
    node = node.parentElement;
  }
  return parts.join(' > ');
}

document.addEventListener(
  'click',
  (ev) => {
    const t = ev.target;
    if (!(t instanceof Element)) return;
    chrome.runtime.sendMessage({
      type: 'click-capture',
      click: {
        x: ev.clientX,
        y: ev.clientY,
        selector: selectorFor(t),
        role: t.getAttribute('role') ?? undefined,
        name: t.getAttribute('aria-label') || t.textContent?.trim().slice(0, 80) || undefined,
      },
    });
  },
  true,
);
