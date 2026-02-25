const BF_ID_PREFIX = 'bf';
const BF_TRANSLATE_DEFAULT = 'en';
const skeletonState = new WeakMap();

function slugFromTagName(tagName) {
	return tagName.toLowerCase().replace(/^bf-/, '');
}

function ensureUniqueIdForElement(element, seenIds) {
	const existing = element.getAttribute('id');
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

	if (!element.hasAttribute('data-qa')) {
		element.setAttribute('data-qa', `test-${id}`);
	}

	if (!element.hasAttribute('data-translate')) {
		const translateLocale = document.documentElement.lang || BF_TRANSLATE_DEFAULT;
		element.setAttribute('data-translate', translateLocale);
	}
}

function applyDefaultsUnder(root, seenIds) {
	if (!(root instanceof Element)) {
		return;
	}

	if (root.tagName.toLowerCase().startsWith('bf-')) {
		applyTestingAndI18nDefaults(root, seenIds);
	}

	for (const element of root.querySelectorAll('*')) {
		if (element.tagName.toLowerCase().startsWith('bf-')) {
			applyTestingAndI18nDefaults(element, seenIds);
		}
	}
}

function parseTargetExpression(value) {
	const normalized = (value || '').trim();
	if (!normalized) {
		return { targetId: '', itemId: '' };
	}
	const [targetId, itemId] = normalized.split(':');
	return { targetId, itemId: itemId || '' };
}

function resolveTarget(value) {
	const { targetId, itemId } = parseTargetExpression(value);
	if (!targetId) {
		return { element: null, itemId: '' };
	}
	return { element: document.getElementById(targetId), itemId };
}

function openElementById(value) {
	const { element, itemId } = resolveTarget(value);
	if (!element) {
		return;
	}
	if (typeof element.openItem === 'function' && itemId) {
		element.openItem(itemId);
		return;
	}
	if (typeof element.open === 'function') {
		element.open();
		return;
	}
	element.setAttribute('open', '');
}

function closeElementById(value) {
	const { element, itemId } = resolveTarget(value);
	if (!element) {
		return;
	}
	if (typeof element.closeItem === 'function' && itemId) {
		element.closeItem(itemId);
		return;
	}
	if (typeof element.close === 'function') {
		element.close();
		return;
	}
	element.removeAttribute('open');
}

function toggleElementById(value) {
	const { element, itemId } = resolveTarget(value);
	if (!element) {
		return;
	}
	if (typeof element.toggleItem === 'function' && itemId) {
		element.toggleItem(itemId);
		return;
	}
	if (typeof element.toggle === 'function') {
		element.toggle();
		return;
	}
	if (element.hasAttribute('open')) {
		element.removeAttribute('open');
		return;
	}
	element.setAttribute('open', '');
}

function parseSkeletonDuration(value) {
	const raw = `${value ?? ''}`.trim();
	if (!raw) {
		return null;
	}
	if (/^-?\d*\.?\d+$/.test(raw)) {
		const ms = Number(raw);
		return Number.isFinite(ms) && ms > 0 ? ms : null;
	}
	if (raw.endsWith('ms')) {
		const ms = Number.parseFloat(raw.slice(0, -2));
		return Number.isFinite(ms) && ms > 0 ? ms : null;
	}
	if (raw.endsWith('s')) {
		const ms = Number.parseFloat(raw.slice(0, -1)) * 1000;
		return Number.isFinite(ms) && ms > 0 ? ms : null;
	}
	return null;
}

function skeletonVariantForElement(element, height) {
	const explicit = (element.getAttribute('skeleton-variant') || '').toLowerCase();
	if (explicit) {
		return explicit;
	}
	const tag = element.tagName.toLowerCase();
	if (tag.includes('image') || tag.includes('video') || tag.includes('canvas') || tag === 'img' || tag === 'video') {
		return 'image';
	}
	if (element.querySelector('img,video,canvas,svg')) {
		return 'image';
	}
	if (height >= 56) {
		return 'image';
	}
	if (height >= 34) {
		return 'button';
	}
	return 'text';
}

function applySkeletonForElement(element) {
	if (!(element instanceof Element)) {
		return;
	}
	if (!element.hasAttribute('skeleton')) {
		return;
	}
	if (element.tagName.toLowerCase() === 'bf-skeleton') {
		return;
	}
	if (skeletonState.has(element)) {
		return;
	}

	const computed = window.getComputedStyle(element);
	const rect = element.getBoundingClientRect();
	const isInline = computed.display.startsWith('inline');
	const width = rect.width > 0 ? rect.width : null;
	const height = rect.height > 0 ? rect.height : null;

	const placeholder = document.createElement('bf-skeleton');
	const variant = skeletonVariantForElement(element, height || 0);
	if (variant) {
		placeholder.setAttribute('variant', variant);
	}
	if (width) {
		placeholder.setAttribute('width', `${Math.round(width)}`);
	} else if (isInline) {
		placeholder.setAttribute('width', '8rem');
	} else {
		placeholder.setAttribute('width', '100%');
	}
	if (height) {
		placeholder.setAttribute('height', `${Math.max(1, Math.round(height))}`);
	}
	if (isInline) {
		placeholder.style.display = 'inline-block';
	}

	element.parentNode?.insertBefore(placeholder, element);

	const previousVisibility = element.style.visibility;
	const previousAriaBusy = element.getAttribute('aria-busy');
	element.style.visibility = 'hidden';
	element.setAttribute('aria-busy', 'true');

	const duration = parseSkeletonDuration(element.getAttribute('skeleton'));
	let timeoutId = null;
	if (duration) {
		timeoutId = window.setTimeout(() => {
			if (element.isConnected) {
				element.removeAttribute('skeleton');
			}
		}, duration);
	}

	skeletonState.set(element, {
		placeholder,
		timeoutId,
		previousVisibility,
		previousAriaBusy,
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
		element.style.removeProperty('visibility');
	}

	if (state.previousAriaBusy == null) {
		element.removeAttribute('aria-busy');
	} else {
		element.setAttribute('aria-busy', state.previousAriaBusy);
	}

	skeletonState.delete(element);
}

function refreshSkeletonForElement(element) {
	clearSkeletonForElement(element);
	if (element.hasAttribute('skeleton')) {
		requestAnimationFrame(() => applySkeletonForElement(element));
	}
}

function refreshSkeletonUnder(root) {
	if (!(root instanceof Element)) {
		return;
	}

	if (root.hasAttribute('skeleton')) {
		refreshSkeletonForElement(root);
	}
	for (const element of root.querySelectorAll('[skeleton]')) {
		refreshSkeletonForElement(element);
	}
}

function clearSkeletonUnder(root) {
	if (!(root instanceof Element)) {
		return;
	}

	clearSkeletonForElement(root);
	for (const element of root.querySelectorAll('*')) {
		clearSkeletonForElement(element);
	}
}

export function setupBareframeRuntime() {
	const seenIds = new Set();
	applyDefaultsUnder(document.documentElement, seenIds);
	refreshSkeletonUnder(document.documentElement);

	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type === 'childList') {
				for (const node of mutation.addedNodes) {
					applyDefaultsUnder(node, seenIds);
					refreshSkeletonUnder(node);
				}
				for (const node of mutation.removedNodes) {
					clearSkeletonUnder(node);
				}
			}

			if (
				mutation.type === 'attributes' &&
				mutation.target instanceof Element &&
				mutation.attributeName === 'skeleton'
			) {
				refreshSkeletonForElement(mutation.target);
			}
		}
	});

	observer.observe(document.documentElement, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ['skeleton'],
	});

	document.addEventListener('click', (event) => {
		const target = event.target instanceof Element ? event.target : null;
		if (!target) {
			return;
		}

		const openTrigger = target.closest('[bf-open]');
		if (openTrigger) {
			openElementById(openTrigger.getAttribute('bf-open'));
			return;
		}

		const closeTrigger = target.closest('[bf-close]');
		if (closeTrigger) {
			closeElementById(closeTrigger.getAttribute('bf-close'));
			return;
		}

		const toggleTrigger = target.closest('[bf-toggle]');
		if (toggleTrigger) {
			toggleElementById(toggleTrigger.getAttribute('bf-toggle'));
		}
	});

	window.bareframe = window.bareframe || {};
	window.bareframe.openById = openElementById;
	window.bareframe.closeById = closeElementById;
	window.bareframe.toggleById = toggleElementById;
}
