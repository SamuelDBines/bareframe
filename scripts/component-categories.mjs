/** Single source for cataloguing components (matches former generate-examples taxonomy). */

export function categoryForSlug(slug) {
	const tokens = slug.split('-');
	const has = (value) => tokens.includes(value);
	const hasAny = (...values) => values.some((value) => has(value));

	if (hasAny('code', 'editor', 'textarea')) {
		return 'editor';
	}
	if (hasAny('calendar', 'date', 'countdown', 'timeline')) {
		return 'date-time';
	}
	if (
		hasAny(
			'input',
			'field',
			'textarea',
			'search',
			'select',
			'combobox',
			'autocomplete',
			'color',
			'number',
			'otp',
			'checkbox',
			'radio',
			'switch',
			'slider',
			'rating',
			'range',
			'toggle',
			'upload',
			'file',
		)
	) {
		return 'forms';
	}
	if (
		hasAny(
			'chart',
			'graph',
			'heatmap',
			'sparkline',
			'gantt',
			'treemap',
			'gauge',
			'donut',
			'pie',
		)
	) {
		return 'charts';
	}
	if (
		hasAny(
			'dialog',
			'modal',
			'drawer',
			'sheet',
			'bottom',
			'popover',
			'tooltip',
			'toast',
			'expanded',
			'error',
		)
	) {
		return 'feedback';
	}
	if (
		hasAny(
			'nav',
			'menu',
			'breadcrumb',
			'tab',
			'pagination',
			'toolbar',
			'action',
			'quick',
			'navigation',
			'link',
			'anchor',
		)
	) {
		return 'navigation';
	}
	if (hasAny('table', 'data', 'grid', 'list', 'tree', 'key', 'value', 'filter')) {
		return 'collections';
	}
	if (hasAny('canvas')) {
		return 'canvas';
	}
	if (hasAny('avatar', 'icon', 'image', 'video', 'carousel', 'map')) {
		return 'media';
	}
	return 'base';
}
