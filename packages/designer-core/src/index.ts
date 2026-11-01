export * from './types.js';
export * from './devicePresets.js';
export * from './placement.js';
export * from './commands.js';

export function defaultNewId(prefix: string): string {
	return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultCommandContext(
	isValidComponentSlug: (slug: string) => boolean,
): import('./commands.js').CommandContext {
	return {
		isValidComponentSlug,
		newId: defaultNewId,
	};
}
