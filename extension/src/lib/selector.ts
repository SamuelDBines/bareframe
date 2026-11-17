function escapeCssIdent(value: string): string {
	if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
		return CSS.escape(value);
	}
	return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

export function selectorFor(el: Element): string {
	if (el.id) return `#${escapeCssIdent(el.id)}`;
	const parts: string[] = [];
	let node: Element | null = el;
	while (node && node.nodeType === 1 && parts.length < 4) {
		let part = node.nodeName.toLowerCase();
		if (node.classList?.length) {
			part += '.' + [...node.classList].slice(0, 2).join('.');
		}
		parts.unshift(part);
		node = node.parentElement;
	}
	return parts.join(' > ');
}

export function clickMetaFromTarget(
	target: Element,
	point: { x: number; y: number },
): {
	x: number;
	y: number;
	w: number;
	h: number;
	selector: string;
	role?: string;
	name?: string;
	text?: string;
} {
	const rect = target.getBoundingClientRect();
	const name =
		target.getAttribute('aria-label')?.trim() ||
		target.getAttribute('title')?.trim() ||
		target.textContent?.trim().slice(0, 80) ||
		undefined;
	return {
		x: point.x,
		y: point.y,
		w: Math.max(8, Math.round(rect.width)),
		h: Math.max(8, Math.round(rect.height)),
		selector: selectorFor(target),
		role: target.getAttribute('role') ?? undefined,
		name,
		text: target.textContent?.trim().slice(0, 120) || undefined,
	};
}