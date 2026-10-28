import { useMemo, useState } from 'react';
import { loadDocExamples } from '../../components/library/loadDocExamples';
import type { ComponentRegistryEntry } from '../../components/library/types';
import { THEME_LABELS, type ThemeId } from '../../theme/themes';
import { ComponentPlayground } from './ComponentPlayground';

export function ComponentDocPage({ entry }: { entry: ComponentRegistryEntry }) {
	const docExamples = useMemo(
		() => (entry.docExamples?.length ? loadDocExamples(entry.slug, entry.docExamples) : []),
		[entry],
	);

	return (
		<>
			<section className="doc-section">
				<h2>Overview</h2>
				<p>{entry.overview ?? entry.description}</p>
				{entry.whenToUse ? <p>{entry.whenToUse}</p> : null}
			</section>

			<section className="doc-section">
				<h2>Playground</h2>
				<ComponentPlayground entry={entry} />
			</section>

			{docExamples.length > 0 ? (
				<section className="doc-section">
					<h2>Examples</h2>
					<div className="doc-examples">
						{docExamples.map((ex) => (
							<DocExampleCard key={ex.title} {...ex} />
						))}
					</div>
				</section>
			) : null}

			{entry.dosDonts?.length ? (
				<section className="doc-section">
					<h2>Do&apos;s and don&apos;ts</h2>
					<ul className="doc-dosdonts">
						{entry.dosDonts.map((row) => (
							<li key={row.do}>
								<span className="doc-do">Do</span> {row.do}
								<br />
								<span className="doc-dont">Don&apos;t</span> {row.dont}
							</li>
						))}
					</ul>
				</section>
			) : null}

			{entry.themeTokens?.length ? (
				<section className="doc-section">
					<h2>Theming tokens</h2>
					<ul>
						{entry.themeTokens.map((t) => (
							<li key={t}>
								<code>{t}</code>
							</li>
						))}
					</ul>
				</section>
			) : null}
		</>
	);
}

function DocExampleCard({
	title,
	description,
	Component,
	source,
}: {
	title: string;
	description?: string;
	Component: React.ComponentType;
	source: string;
}) {
	const [copied, setCopied] = useState(false);
	return (
		<div className="card doc-example-card">
			<h3>{title}</h3>
			{description ? <p>{description}</p> : null}
			<div className="playground__example-preview" data-bf-theme="light">
				<Component />
			</div>
			<div className="playground__code-header">
				<span className="doc-example-source-label">Source</span>
				<button
					type="button"
					className="btn btn-secondary btn-sm"
					onClick={async () => {
						await navigator.clipboard.writeText(source.trim());
						setCopied(true);
						window.setTimeout(() => setCopied(false), 1500);
					}}
				>
					{copied ? 'Copied' : 'Copy'}
				</button>
			</div>
			<pre className="code-block">{source.trim()}</pre>
		</div>
	);
}

export function VariantThemeMatrix({ entry }: { entry: ComponentRegistryEntry }) {
	const themes: ThemeId[] = ['light', 'dark', 'aurora', 'noir'];
	if (!entry.variants.length) return null;
	const variant = entry.variants[0];
	return (
		<section className="doc-section">
			<h2>Variants across themes</h2>
			<div className="gallery-theme-row">
				{themes.map((themeId) => (
					<div key={themeId} className="gallery-theme-cell" data-bf-theme={themeId}>
						<span className="gallery-theme-cell__label">{THEME_LABELS[themeId]}</span>
						<div className="bf-docs-preview">{entry.render({ ...entry.defaultProps, variant })}</div>
					</div>
				))}
			</div>
		</section>
	);
}
