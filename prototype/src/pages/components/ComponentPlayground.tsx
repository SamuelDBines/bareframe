import { useCallback, useMemo, useState, type ChangeEvent } from 'react';
import { THEME_IDS, THEME_LABELS, type ThemeId } from '../../theme/themes';
import { generateComponentSnippet } from '../../components/library/codegen';
import type { ComponentRegistryEntry, PreviewInteractionState } from '../../components/library/types';
import { PreviewCodeTabs } from './docs/PreviewCodeTabs';
import { PlaygroundPortalProvider, PlaygroundOverlayLayer } from './docs/PlaygroundPortal';

type ViewportId = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_WIDTH: Record<ViewportId, string> = {
	mobile: '375px',
	tablet: '768px',
	desktop: '100%',
};

type Props = {
	entry: ComponentRegistryEntry;
};

function previewWrapperClass(state: PreviewInteractionState): string {
	return [
		'bf-docs-preview',
		state === 'hover' && 'bf-preview-hover',
		state === 'focus' && 'bf-preview-focus',
		state === 'disabled' && 'bf-preview-disabled',
		state === 'loading' && 'bf-preview-loading',
	]
		.filter(Boolean)
		.join(' ');
}

function mergeProps(
	entry: ComponentRegistryEntry,
	overrides: Record<string, unknown>,
): Record<string, unknown> {
	const merged = { ...entry.defaultProps, ...overrides };
	if (merged.__interaction) {
		delete merged.__interaction;
	}
	return merged;
}

export function ComponentPlayground({ entry }: Props) {
	const [props, setProps] = useState<Record<string, unknown>>(() => ({ ...entry.defaultProps }));
	const [previewTheme, setPreviewTheme] = useState<ThemeId>('light');
	const [colorMode, setColorMode] = useState<'theme' | 'light' | 'dark'>('theme');
	const [viewport, setViewport] = useState<ViewportId>('desktop');

	const interaction = (props.__interaction as PreviewInteractionState) ?? 'default';
	const effectiveTheme: ThemeId =
		colorMode === 'theme' ? previewTheme : colorMode === 'dark' ? 'dark' : 'light';

	const liveProps = useMemo(() => mergeProps(entry, props), [entry, props]);
	const snippet = useMemo(() => generateComponentSnippet(entry, liveProps), [entry, liveProps]);

	const setProp = useCallback((key: string, value: unknown) => {
		setProps((prev) => ({ ...prev, [key]: value }));
	}, []);

	const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

	const previewProps = useMemo(() => {
		let next: Record<string, unknown> = liveProps;

		if (Object.prototype.hasOwnProperty.call(entry.defaultProps, 'open')) {
			const userOnOpenChange = liveProps.onOpenChange as ((open: boolean) => void) | undefined;
			next = {
				...next,
				onOpenChange: (open: boolean) => {
					setProp('open', open);
					userOnOpenChange?.(open);
				},
			};
		}

		if (Object.prototype.hasOwnProperty.call(entry.defaultProps, 'page')) {
			const userOnPageChange = liveProps.onPageChange as ((page: number) => void) | undefined;
			next = {
				...next,
				onPageChange: (page: number) => {
					setProp('page', page);
					userOnPageChange?.(page);
				},
			};
		}

		if (entry.slug === 'select') {
			const userOnSelectionChange = liveProps.onSelectionChange as ((key: unknown) => void) | undefined;
			next = {
				...next,
				onSelectionChange: (key: unknown) => {
					setProp('value', String(key));
					userOnSelectionChange?.(key);
				},
			};
		}

		if (entry.slug === 'slider') {
			const userOnChange = liveProps.onChange as ((e: ChangeEvent<HTMLInputElement>) => void) | undefined;
			next = {
				...next,
				onChange: (e: ChangeEvent<HTMLInputElement>) => {
					setProp('value', Number(e.target.value));
					userOnChange?.(e);
				},
			};
		}

		if (entry.slug === 'tabs') {
			const userOnChange = liveProps.onChange as ((value: string) => void) | undefined;
			const tabValue = liveProps.defaultValue ?? liveProps.value;
			next = {
				...next,
				value: tabValue,
				onChange: (value: string) => {
					setProp('defaultValue', value);
					userOnChange?.(value);
				},
			};
		}

		if (entry.slug === 'switch') {
			const userOnChange = liveProps.onChange as ((e: ChangeEvent<HTMLInputElement>) => void) | undefined;
			next = {
				...next,
				onChange: (e: ChangeEvent<HTMLInputElement>) => {
					setProp('checked', e.target.checked);
					userOnChange?.(e);
				},
			};
		}

		if (entry.slug === 'checkbox') {
			const userOnChange = liveProps.onChange as ((e: ChangeEvent<HTMLInputElement>) => void) | undefined;
			next = {
				...next,
				onChange: (e: ChangeEvent<HTMLInputElement>) => {
					setProp('checked', e.target.checked);
					userOnChange?.(e);
				},
			};
		}

		if (entry.slug === 'radio-group') {
			const userOnChange = liveProps.onChange as ((value: string) => void) | undefined;
			next = {
				...next,
				onChange: (value: string) => {
					setProp('value', value);
					userOnChange?.(value);
				},
			};
		}

		return next;
	}, [entry.defaultProps, entry.slug, liveProps, setProp]);

	const applyVariant = useCallback(
		(variant: string) => {
			if ('variant' in entry.defaultProps || entry.controls.some((c) => c.prop === 'variant')) {
				setProp('variant', variant);
			}
		},
		[entry, setProp],
	);

	const activeVariant = typeof liveProps.variant === 'string' ? liveProps.variant : entry.variants[0];

	const previewNode = (
		<div
			className="playground-frame"
			data-bf-theme={effectiveTheme}
			style={{ maxWidth: VIEWPORT_WIDTH[viewport], margin: viewport === 'desktop' ? undefined : '0 auto' }}
		>
			<div className="playground-frame__toolbar playground-frame__toolbar--compact">
				<select
					className="playground-toolbar__theme-select"
					value={previewTheme}
					onChange={(e) => setPreviewTheme(e.target.value as ThemeId)}
					aria-label="Preview theme"
				>
					{THEME_IDS.filter((id) => id !== 'system').map((id) => (
						<option key={id} value={id}>
							{THEME_LABELS[id]}
						</option>
					))}
				</select>
				<div className="playground-toolbar__segments">
					<div className="playground__segmented playground__segmented--compact" role="group" aria-label="Color mode">
						{(['theme', 'light', 'dark'] as const).map((mode) => (
							<button
								key={mode}
								type="button"
								className={colorMode === mode ? 'is-active' : undefined}
								onClick={() => setColorMode(mode)}
							>
								{mode === 'theme' ? 'Auto' : mode === 'light' ? 'Light' : 'Dark'}
							</button>
						))}
					</div>
					<div className="playground__segmented playground__segmented--compact" role="group" aria-label="Viewport width">
						{(Object.keys(VIEWPORT_WIDTH) as ViewportId[]).map((vp) => (
							<button
								key={vp}
								type="button"
								className={viewport === vp ? 'is-active' : undefined}
								onClick={() => setViewport(vp)}
							>
								{vp.charAt(0).toUpperCase() + vp.slice(1)}
							</button>
						))}
					</div>
				</div>
			</div>
			<div
				className={`playground-frame__canvas ${previewWrapperClass(interaction)}`}
				data-testid="playground-preview"
			>
			<PlaygroundPortalProvider portalRoot={portalRoot}>
				<PlaygroundOverlayLayer onPortalRootChange={setPortalRoot} />
				<div className="playground-preview-content">{entry.render(previewProps)}</div>
			</PlaygroundPortalProvider>
			</div>
		</div>
	);

	return (
		<div className="playground-shell">
			<div className="playground-hero">
				<div>
					<PreviewCodeTabs preview={previewNode} code={snippet} />
					{entry.variants.length > 0 ? (
						<div className="playground__variants" style={{ marginTop: '0.75rem' }}>
							<span className="playground__variants-label">Variants</span>
							<div className="playground__variant-pills">
								{entry.variants.map((v) => (
									<button
										key={v}
										type="button"
										className={`badge-pill playground__variant-pill${activeVariant === v ? ' is-active' : ''}`}
										onClick={() => applyVariant(v)}
										aria-pressed={activeVariant === v}
									>
										{v}
									</button>
								))}
							</div>
						</div>
					) : null}
				</div>
			</div>

			<aside className="playground-panel" aria-label="Playground controls">
				<p className="playground-panel__title">Controls</p>
				<div className="playground__control-stack">
					{entry.controls.map((control) => {
						const value = props[control.prop] ?? entry.defaultProps[control.prop];
						if (control.kind === 'interaction') {
							return (
								<label key={control.prop} className="playground__control">
									<span>{control.label}</span>
									<select
										value={String(interaction)}
										onChange={(e) => setProp('__interaction', e.target.value)}
									>
										{(control.options ?? []).map((o) => (
											<option key={o} value={o}>
												{o}
											</option>
										))}
									</select>
								</label>
							);
						}
						if (control.kind === 'boolean') {
							return (
								<label key={control.prop} className="playground__control playground__control--row">
									<input
										type="checkbox"
										checked={Boolean(value)}
										onChange={(e) => setProp(control.prop, e.target.checked)}
									/>
									<span>{control.label}</span>
								</label>
							);
						}
						if (control.kind === 'select') {
							return (
								<label key={control.prop} className="playground__control">
									<span>{control.label}</span>
									<select
										value={String(value ?? '')}
										onChange={(e) => setProp(control.prop, e.target.value)}
									>
										{(control.options ?? []).map((o) => (
											<option key={o} value={o}>
												{o}
											</option>
										))}
									</select>
								</label>
							);
						}
						if (control.kind === 'number') {
							return (
								<label key={control.prop} className="playground__control">
									<span>{control.label}</span>
									<input
										type="number"
										min={control.min}
										max={control.max}
										step={control.step ?? 1}
										value={Number(value ?? 0)}
										onChange={(e) => setProp(control.prop, Number(e.target.value))}
									/>
								</label>
							);
						}
						if (control.kind === 'textarea') {
							return (
								<label key={control.prop} className="playground__control">
									<span>{control.label}</span>
									<textarea
										rows={3}
										value={String(value ?? '')}
										onChange={(e) => setProp(control.prop, e.target.value)}
									/>
								</label>
							);
						}
						return (
							<label key={control.prop} className="playground__control">
								<span>{control.label}</span>
								<input
									type="text"
									value={String(value ?? '')}
									onChange={(e) => setProp(control.prop, e.target.value)}
								/>
							</label>
						);
					})}
				</div>
			</aside>
		</div>
	);
}
