import { useMemo, useState } from 'react';
import type { ThemeId } from '../../theme/themes';
import { FramePreview } from '../components/FramePreview';
import { useDesigner } from '../store';

/** Edit mode: pick a designed control and link it to another screen for the prototype. */
export function FlowMapScreenLinkPanel() {
	const { state, dispatch } = useDesigner();
	const { project, ui } = state;
	const frame = project.frames.find((f) => f.id === ui.selectedFrameId);
	const page = frame ? project.pages.find((p) => p.id === frame.pageId) : null;
	const [targetFrameId, setTargetFrameId] = useState('');
	const themeId = (frame?.themeId ?? project.defaultThemeId) as ThemeId;

	const otherFrames = useMemo(
		() => project.frames.filter((f) => !f.ghost && f.id !== frame?.id),
		[project.frames, frame?.id],
	);

	if (!frame || !page) return null;

	const selectedNode = ui.selectedNodeId ? page.nodes[ui.selectedNodeId] : null;
	const linkedConnector = project.connectors.find(
		(c) => c.fromFrameId === frame.id && c.fromNodeId === ui.selectedNodeId,
	);

	return (
		<aside className="flow-map-link-panel" data-testid="flow-map-link-panel">
			<header>
				<strong>Link to screen</strong>
				<span>{frame.name}</span>
			</header>
			<div className="flow-map-link-panel__preview">
				<FramePreview
					frame={frame}
					page={page}
					themeId={themeId}
					customTokens={project.customTokenOverrides}
					selectedNodeId={ui.selectedNodeId}
					onSelectNode={(nodeId) => dispatch({ type: 'selectNode', nodeId })}
				/>
			</div>
			<p className="bx-hint">Click a button or control in the preview, then choose a destination screen.</p>
			<div className="field">
				<label htmlFor="link-target-screen">Destination screen</label>
				<select
					id="link-target-screen"
					data-testid="link-target-screen"
					value={targetFrameId}
					onChange={(e) => setTargetFrameId(e.target.value)}
				>
					<option value="">Select screen…</option>
					{otherFrames.map((f) => (
						<option key={f.id} value={f.id}>
							{f.name}
						</option>
					))}
				</select>
			</div>
			<button
				type="button"
				className="btn btn-primary btn-sm"
				data-testid="link-node-to-screen"
				disabled={!ui.selectedNodeId || !targetFrameId}
				onClick={() =>
					dispatch({
						type: 'linkNodeToScreen',
						fromFrameId: frame.id,
						fromNodeId: ui.selectedNodeId!,
						toFrameId: targetFrameId,
						label: selectedNode?.instance?.props?.children
							? String(selectedNode.instance.props.children)
							: 'Next',
					})
				}
			>
				Link selection
			</button>
			{linkedConnector ? (
				<p className="bx-hint" role="status">
					Linked to {project.frames.find((f) => f.id === linkedConnector.toFrameId)?.name ?? 'screen'}.
				</p>
			) : null}
		</aside>
	);
}