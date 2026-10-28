import { useEffect, useState } from 'react';
import { loadDocExamples, type LoadedDocExample } from '../../components/library/loadDocExamples';
import type { ComponentRegistryEntry } from '../../components/library/types';
import { PreviewCodeTabs } from './docs/PreviewCodeTabs';
import { DocSection } from './docs/DocsShell';
import { ComponentPlayground } from './ComponentPlayground';

export function ComponentDocPage({ entry }: { entry: ComponentRegistryEntry }) {
	const [docExamples, setDocExamples] = useState<LoadedDocExample[]>([]);
	const [examplesLoading, setExamplesLoading] = useState(Boolean(entry.docExamples?.length));

	useEffect(() => {
		if (!entry.docExamples?.length) {
			setExamplesLoading(false);
			return;
		}
		let cancelled = false;
		loadDocExamples(entry.slug, entry.docExamples)
			.then((loaded) => {
				if (!cancelled) setDocExamples(loaded);
			})
			.finally(() => {
				if (!cancelled) setExamplesLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [entry.slug, entry.docExamples]);

	return (
		<>
			<DocSection id="overview" title="Overview">
				<div className="doc-prose">
					<p>{entry.overview ?? entry.description}</p>
					{entry.whenToUse ? <p>{entry.whenToUse}</p> : null}
				</div>
			</DocSection>

			<DocSection id="playground" title="Playground">
				<ComponentPlayground entry={entry} />
			</DocSection>

			{examplesLoading ? (
				<DocSection id="examples" title="Examples">
					<p className="doc-prose">Loading examples…</p>
				</DocSection>
			) : docExamples.length > 0 ? (
				<DocSection id="examples" title="Examples">
					<div className="doc-examples-list">
						{docExamples.map((ex) => (
							<DocExampleCard key={ex.title} {...ex} />
						))}
					</div>
				</DocSection>
			) : null}

			{entry.dosDonts?.length ? (
				<DocSection id="guidelines" title="Do's and don'ts">
					<div className="doc-dodont-grid">
						{entry.dosDonts.map((row) => (
							<div key={row.do} style={{ display: 'contents' }}>
								<div className="doc-dodont-card doc-dodont-card--do">
									<strong>Do</strong>
									{row.do}
								</div>
								<div className="doc-dodont-card doc-dodont-card--dont">
									<strong>Don&apos;t</strong>
									{row.dont}
								</div>
							</div>
						))}
					</div>
				</DocSection>
			) : null}

			{entry.themeTokens?.length ? (
				<DocSection id="tokens" title="Theme tokens">
					<ul className="doc-token-list">
						{entry.themeTokens.map((t) => (
							<li key={t}>
								<span className="doc-token-swatch">
									<span className="doc-token-swatch__chip" style={{ ['--token-preview' as string]: `var(${t})` }} />
									<code>{t}</code>
								</span>
							</li>
						))}
					</ul>
				</DocSection>
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
	return (
		<article className="doc-example-card-v2">
			<h3>{title}</h3>
			{description ? <p>{description}</p> : null}
			<PreviewCodeTabs
				preview={
					<div className="doc-example-preview" data-bf-theme="light">
						<Component />
					</div>
				}
				code={source}
			/>
		</article>
	);
}
