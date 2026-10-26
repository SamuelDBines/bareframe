import { useCallback, useMemo, useState } from 'react';
import { THEME_IDS, THEME_LABELS, type ThemeId } from '../../theme/themes';
import { generateComponentSnippet } from '../../components/library/codegen';
import type { ComponentRegistryEntry, PreviewInteractionState } from '../../components/library/types';

type ViewportId = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_WIDTH: Record<ViewportId, string> = {
	mobile: '375px',
	tablet: '768px',
	desktop: '100%',
};

type Props = {
	entry: ComponentRegistryEntry;
};

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
	const [copied, setCopied] = useState(false);

	const interaction = (props.__interaction as PreviewInteractionState) ?? 'default';
	const effectiveTheme: ThemeId =
		colorMode === 'theme' ? previewTheme : colorMode === 'dark' ? 'dark' : 'light';

	const liveProps = useMemo(() => mergeProps(entry, props), [entry, props]);
	const snippet = useMemo(() => generateComponentSnippet(entry, liveProps), [entry, liveProps]);

	const setProp = useCallback((key: string, value: unknown) => {
		setProps((prev) => ({ ...prev, [key]: value }));
	}, []);

	const applyVariant = useCallback(
		(variant: string) => {
			if ('variant' in entry.defaultProps || entry.controls.some((c) => c.prop === 'variant')) {
				setProp('variant', variant);
			}
		},
		[entry, setProp],
	);

	const copySnippet = async () => {
		try {
			await navigator.clipboard.writeText(snippet);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	};

	const activeVariant = typeof liveProps.variant === 'string' ? liveProps.variant : entry.variants[0];

	return (
		<div className="playground">
			<section className="playground__preview-section">
				<div className="playground__toolbar">
					<div className="playground__toolbar-group">
						<label className="playground__toolbar-label">
							Theme
							<select
								className="theme-select"
								value={previewTheme}
								onChange={(e) => setPreviewTheme(e.target.value as ThemeId)}
								aria-label="Preview theme"
							>
								{THEME_IDS.filter((id) => id !== 'system').map((id) => (
									<option key={id} value={id}>{THEME_LABELS[id]}</option>
								))}
							</select>
						</label>
						<div className="playground__segmented" role="group" aria-label="Color mode">
							{(['theme', 'light', 'dark'] as const).map((mode) => (
								<button
									key={mode}
									type="button"
									className={colorMode === mode ? 'is-active' : undefined}
									onClick={() => setColorMode(mode)}
								>
									{mode === 'theme' ? 'As theme' : mode === 'light' ? 'Light' : 'Dark'}
								</button>
							))}
						</div>
					</div>
					<div className="playground__toolbar-group">
						<div className="playground__segmented" role="group" aria-label="Viewport width">
							{(Object.keys(VIEWPORT_WIDTH) as ViewportId[]).map((vp) => (
								<button
									key={vp}
									type="button"
									className={viewport === vp ? 'is-active' : undefined}
									onClick={() => setViewport(vp)}
								>
									{vp}
								</button>
							))}
						</div>
					</div>
				</div>

				<div
					className="playground__stage card"
					data-bf-theme={effectiveTheme}
					style={{ maxWidth: VIEWPORT_WIDTH[viewport], margin: viewport === 'desktop' ? undefined : '0 auto' }}
				>
					<div className="playground__canvas" data-testid="playground-preview">
						{entry.render(liveProps, interaction)}
					</div>
				</div>

				<div className="playground__variants">
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
			</section>

			<aside className="playground__controls card">
				<h3>Controls</h3>
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
											<option key={o} value={o}>{o}</option>
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
											<option key={o} value={o}>{o}</option>
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

			<section className="playground__code">
				<div className="playground__code-header">
					<h3>Code</h3>
					<button type="button" className="btn btn-secondary btn-sm" onClick={copySnippet}>
						{copied ? 'Copied' : 'Copy'}
					</button>
				</div>
				<pre className="code-block" data-testid="playground-snippet">{snippet}</pre>
			</section>

			{entry.examples.length > 0 ? (
				<section className="playground__examples">
					<h2>Examples</h2>
					<div className="grid-2">
						{entry.examples.map((ex) => (
							<div key={ex.title} className="card">
								<h3>{ex.title}</h3>
								{ex.description ? <p>{ex.description}</p> : null}
								<div className="playground__example-preview" data-bf-theme={effectiveTheme}>
									{entry.render(mergeProps(entry, ex.props), 'default')}
								</div>
								<button
									type="button"
									className="btn btn-ghost btn-sm"
									onClick={() => setProps({ ...entry.defaultProps, ...ex.props })}
								>
									Load in playground
								</button>
							</div>
						))}
					</div>
				</section>
			) : null}

			<section className="playground__a11y">
				<h2>Accessibility</h2>
				<p>{entry.a11y.summary}</p>
				{entry.a11y.roles?.length ? (
					<p><strong>Roles:</strong> {entry.a11y.roles.join(', ')}</p>
				) : null}
				{entry.a11y.keyboard?.length ? (
					<>
						<h3>Keyboard</h3>
						<ul>
							{entry.a11y.keyboard.map((k) => (
								<li key={k}>{k}</li>
							))}
						</ul>
					</>
				) : null}
			</section>
		</div>
	);
}
