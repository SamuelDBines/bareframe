import { useDesigner } from '../store';

const PALETTE = [
	{ id: 'button', label: 'Button', category: 'Actions' },
	{ id: 'card', label: 'Card', category: 'Layout' },
	{ id: 'input', label: 'Input', category: 'Forms' },
	{ id: 'badge', label: 'Badge', category: 'Display' },
	{ id: 'alert', label: 'Alert', category: 'Feedback' },
];

const LAYOUT = ['Stack', 'Row', 'Column', 'Section'];

export function LibrarySidebar() {
	const { state, dispatch } = useDesigner();
	const { project, ui } = state;
	const page = project.pages.find((p) => p.id === ui.activePageId);

	const insertTarget = ui.selectedNodeId
		? page?.nodes[ui.selectedNodeId]?.children.length
			? ui.selectedNodeId
			: page?.nodes[ui.selectedNodeId]?.parentId ?? page?.rootNodeId
		: page?.rootNodeId;

	return (
		<aside className="designer-sidebar">
			<section className="sidebar-section">
				<h4>Pages</h4>
				<ul className="sidebar-list">
					{project.pages.map((p) => (
						<li key={p.id}>
							<button
								type="button"
								className={ui.activePageId === p.id ? 'active' : ''}
								onClick={() => {
									/* active page fixed in prototype */
								}}
							>
								{p.name} <code>{p.routePath}</code>
							</button>
						</li>
					))}
				</ul>
			</section>

			<section className="sidebar-section">
				<h4>Frames</h4>
				<ul className="sidebar-list">
					{project.frames
						.filter((f) => f.pageId === ui.activePageId && !f.ghost)
						.map((f) => (
							<li key={f.id}>
								<button
									type="button"
									className={ui.selectedFrameId === f.id ? 'active' : ''}
									onClick={() => dispatch({ type: 'selectFrame', frameId: f.id })}
								>
									{f.name} · {f.width}×{f.height}
								</button>
							</li>
						))}
				</ul>
				<button type="button" className="btn btn-ghost sidebar-add" onClick={() => dispatch({ type: 'addFrame' })}>
					+ Frame
				</button>
			</section>

			<section className="sidebar-section">
				<h4>Layers</h4>
				{page && <LayersTree page={page} selectedId={ui.selectedNodeId} />}
			</section>

			<section className="sidebar-section">
				<h4>Components</h4>
				<div className="palette-grid">
					{PALETTE.map((c) => (
						<button
							key={c.id}
							type="button"
							className="palette-item"
							onClick={() => {
								if (insertTarget)
									dispatch({ type: 'addComponent', parentId: insertTarget, definitionId: c.id });
							}}
						>
							{c.label}
						</button>
					))}
				</div>
				<p className="sidebar-hint">Layout: {LAYOUT.join(', ')}</p>
			</section>
		</aside>
	);
}

function LayersTree({
	page,
	selectedId,
}: {
	page: { rootNodeId: string; nodes: Record<string, { id: string; name: string; children: string[]; type: string }> };
	selectedId: string | null;
}) {
	const { dispatch } = useDesigner();

	function renderNode(id: string, depth: number) {
		const n = page.nodes[id];
		if (!n) return null;
		return (
			<li key={id}>
				<button
					type="button"
					className={`layer-row${selectedId === id ? ' active' : ''}`}
					style={{ paddingLeft: `${depth * 12 + 4}px` }}
					onClick={() => dispatch({ type: 'selectNode', nodeId: id })}
				>
					<span className="layer-type">{n.type.slice(0, 3).toUpperCase()}</span>
					{n.name}
				</button>
				{n.children.length > 0 && (
					<ul className="layer-children">
						{n.children.map((cid) => renderNode(cid, depth + 1))}
					</ul>
				)}
			</li>
		);
	}

	return <ul className="layers-tree">{renderNode(page.rootNodeId, 0)}</ul>;
}
