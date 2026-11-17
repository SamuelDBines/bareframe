import type { DesignDevice, DesignTreeNode, ScreenBrief } from '@bareframe/designer-core';

type TemplateKey =
	| 'login'
	| 'sign-up'
	| 'dashboard'
	| 'settings'
	| 'list'
	| 'detail'
	| 'checkout'
	| 'pricing'
	| 'generic';

function inferTemplate(screenName: string, purpose: string): TemplateKey {
	const hay = `${screenName} ${purpose}`.toLowerCase();
	if (/\b(log\s*in|sign\s*in)\b/.test(hay)) return 'login';
	if (/\b(sign\s*up|register|create account)\b/.test(hay)) return 'sign-up';
	if (/\b(dashboard|home|overview)\b/.test(hay)) return 'dashboard';
	if (/\b(settings|preferences|profile)\b/.test(hay)) return 'settings';
	if (/\b(list|inbox|catalog|browse)\b/.test(hay)) return 'list';
	if (/\b(detail|item|product)\b/.test(hay)) return 'detail';
	if (/\b(checkout|payment|cart)\b/.test(hay)) return 'checkout';
	if (/\b(pricing|plans)\b/.test(hay)) return 'pricing';
	return 'generic';
}

function heading(screenName: string) {
	return { type: 'heading' as const, level: 1 as const, text: screenName };
}

function field(label: string): DesignTreeNode {
	return { type: 'input', props: { label, placeholder: label } };
}

function primary(label: string): DesignTreeNode {
	return { type: 'button', props: { label, variant: 'primary' } };
}

function secondary(label: string): DesignTreeNode {
	return { type: 'button', props: { label, variant: 'secondary' } };
}

function stack(children: DesignTreeNode[], gap = 16): DesignTreeNode {
	return { type: 'stack', gap, padding: 24, children: children };
}

function buildTemplateBody(key: TemplateKey, screenName: string, brief: ScreenBrief): DesignTreeNode[] {
	switch (key) {
		case 'login':
			return [heading(screenName), field('Email'), field('Password'), primary('Sign in'), secondary('Forgot password?')];
		case 'sign-up':
			return [heading(screenName), field('Email'), field('Password'), field('Full name'), primary('Create account')];
		case 'dashboard':
			return [
				heading(screenName),
				{ type: 'card', props: { title: 'Today', body: brief.purpose || 'Your summary for today.' } },
				{ type: 'card', props: { title: 'Recent', body: 'Latest activity and shortcuts.' } },
				primary(brief.keyContent[0] ?? 'New item'),
			];
		case 'settings':
			return [
				heading(screenName),
				{ type: 'card', props: { title: 'Profile', body: 'Name, email and avatar.' } },
				{ type: 'card', props: { title: 'Notifications', body: 'Choose what you hear about.' } },
				primary('Save changes'),
			];
		case 'list':
			return [
				heading(screenName),
				field('Search'),
				{ type: 'card', props: { title: 'Item one', body: 'Tap to open.' } },
				{ type: 'card', props: { title: 'Item two', body: 'Tap to open.' } },
			];
		case 'detail':
			return [
				heading(screenName),
				{ type: 'text', text: brief.purpose || 'Details for this item.' },
				primary('Save'),
				secondary('Back'),
			];
		case 'checkout':
			return [
				heading(screenName),
				{ type: 'card', props: { title: 'Order summary', body: 'Subtotal and delivery.' } },
				field('Card number'),
				primary('Pay now'),
			];
		case 'pricing':
			return [
				heading(screenName),
				{ type: 'card', props: { title: 'Free', body: 'Get started at no cost.' } },
				{ type: 'card', props: { title: 'Pro', body: 'For teams that ship often.' } },
				primary('Choose plan'),
			];
		default:
			return [
				heading(screenName),
				{ type: 'text', text: brief.purpose || screenName },
				...(brief.keyContent.slice(0, 4).map((item) =>
					/field|email|password|search/i.test(item) ? field(item.replace(/\s*field$/i, '')) : { type: 'card' as const, props: { title: item, body: `${item} on this screen.` } },
				) as DesignTreeNode[]),
			];
	}
}

/** Component-library layout from screen name and brief, no LLM. */
export function templateDesignStates(
	screenName: string,
	brief: ScreenBrief,
	outgoingActions: string[],
	_device: DesignDevice,
): Record<string, DesignTreeNode> {
	const key = inferTemplate(screenName, brief.purpose);
	const body = buildTemplateBody(key, screenName, brief);
	const actions: DesignTreeNode[] = outgoingActions.slice(0, 4).map((label, i) =>
		i === 0 ? primary(label) : secondary(label),
	);
	const defaultState = stack([...body, ...(actions.length ? [{ type: 'row' as const, gap: 12, padding: 0, children: actions }] : [])]);
	const states: Record<string, DesignTreeNode> = { default: defaultState };
	if (brief.states.includes('empty')) {
		states.empty = stack([heading(screenName), { type: 'text', text: 'Nothing here yet.' }]);
	}
	if (brief.states.includes('loading')) {
		states.loading = stack([{ type: 'text', text: 'Loading…' }]);
	}
	if (brief.states.includes('error')) {
		states.error = stack([
			{ type: 'alert', props: { text: 'Something went wrong. Try again.', variant: 'danger' } },
		]);
	}
	if (brief.states.includes('success')) {
		states.success = stack([{ type: 'alert', props: { text: 'Saved.', variant: 'success' } }]);
	}
	return states;
}