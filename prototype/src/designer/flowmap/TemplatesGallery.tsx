import { useEffect, useMemo, useState } from 'react';
import type { FlowDevice, TemplateCategory } from '@bareframe/designer-core';
import { fetchProject, fromProjectDocument } from '../projectApi';
import { useDesigner } from '../store';
import { PlatformPicker } from './PlatformPicker';

type TemplateList = {
	categories: TemplateCategory[];
	screens: { id: string; category: string; title: string; description: string; variants: { id: string; title: string }[] }[];
	flows: { id: string; category: string; title: string; description: string; screenCount: number }[];
};

type Props = {
	projectId: string;
	open: boolean;
	onClose: () => void;
	onInserted: (message: string) => void;
};

export function TemplatesGallery({ projectId, open, onClose, onInserted }: Props) {
	const { state, dispatch } = useDesigner();
	const [list, setList] = useState<TemplateList | null>(null);
	const [category, setCategory] = useState<string>('all');
	const [busy, setBusy] = useState(false);
	const [platforms, setPlatforms] = useState<FlowDevice[]>(['mobile']);
	const [tab, setTab] = useState<'flows' | 'screens'>('flows');

	useEffect(() => {
		if (!open) return;
		void fetch('/api/templates', { credentials: 'include' })
			.then((r) => r.json())
			.then((data) => setList(data as TemplateList))
			.catch(() => setList(null));
	}, [open]);

	const flows = useMemo(
		() => (list?.flows ?? []).filter((f) => category === 'all' || f.category === category),
		[list, category],
	);
	const screens = useMemo(
		() => (list?.screens ?? []).filter((s) => category === 'all' || s.category === category),
		[list, category],
	);

	if (!open) return null;

	async function insert(body: Record<string, unknown>) {
		setBusy(true);
		try {
			const remote = await fetchProject(projectId);
			const res = await fetch(`/api/projects/${projectId}/templates/insert`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...body, baseVersion: remote.version }),
			});
			if (!res.ok) throw new Error('insert failed');
			const data = (await res.json()) as { document: import('@bareframe/designer-core').ProjectDocument; version: number };
			dispatch({ type: 'hydrateProject', project: fromProjectDocument(data.document), remoteVersion: data.version });
			onInserted('Template inserted on the map.');
			onClose();
		} catch {
			onInserted('Could not insert the template. Try again.');
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="templates-gallery-backdrop" data-testid="templates-gallery">
			<div className="templates-gallery" role="dialog" aria-labelledby="templates-gallery-title">
				<header className="templates-gallery__head">
					<h2 id="templates-gallery-title">Templates</h2>
					<button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">
						×
					</button>
				</header>
				<div className="templates-gallery__filters">
					<label>
						Category
						<select value={category} onChange={(e) => setCategory(e.target.value)} data-testid="template-category">
							<option value="all">All</option>
							{(list?.categories ?? []).map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</label>
					<div className="flow-seg" role="tablist">
						<button type="button" role="tab" aria-selected={tab === 'flows'} onClick={() => setTab('flows')}>
							Flows
						</button>
						<button type="button" role="tab" aria-selected={tab === 'screens'} onClick={() => setTab('screens')}>
							Screens
						</button>
					</div>
				</div>
				{tab === 'flows' ? (
					<div className="templates-gallery__grid">
						{flows.map((f) => (
							<article key={f.id} className="templates-card">
								<h3>{f.title}</h3>
								<p>{f.description}</p>
								<p className="bx-hint">
									{f.screenCount} screens · {f.category}
								</p>
								<button
									type="button"
									className="btn btn-primary btn-sm"
									disabled={busy || platforms.length === 0}
									data-testid={`insert-flow-${f.id}`}
									onClick={() =>
										void insert({
											kind: 'flow',
											flowTemplateId: f.id,
											devices: platforms,
											merge: state.project.frames.filter((fr) => !fr.ghost).length > 0,
										})
									}
								>
									Insert flow
								</button>
							</article>
						))}
					</div>
				) : (
					<div className="templates-gallery__grid">
						{screens.map((s) => (
							<article key={s.id} className="templates-card">
								<h3>{s.title}</h3>
								<p>{s.description}</p>
								<label className="bx-hint">
									Variant
									<select defaultValue={s.variants[0]?.id} id={`variant-${s.id}`}>
										{s.variants.map((v) => (
											<option key={v.id} value={v.id}>
												{v.title}
											</option>
										))}
									</select>
								</label>
								<button
									type="button"
									className="btn btn-secondary btn-sm"
									disabled={busy}
									data-testid={`insert-screen-${s.id}`}
									onClick={() => {
										const sel = document.querySelector<HTMLSelectElement>(`#variant-${s.id}`);
										void insert({
											kind: 'screen',
											screenTemplateId: s.id,
											variantId: sel?.value,
											device: platforms[0] === 'desktop' ? 'desktop' : platforms[0] === 'tablet' ? 'tablet' : 'phone',
										});
									}}
								>
									Insert screen
								</button>
							</article>
						))}
					</div>
				)}
				<footer className="templates-gallery__foot">
					<PlatformPicker value={platforms} onChange={setPlatforms} />
				</footer>
			</div>
		</div>
	);
}