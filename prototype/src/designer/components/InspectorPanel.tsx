import type { ReactNode } from 'react';
import { Select } from '../../components/Select';
import { THEME_IDS, THEME_LABELS, type ThemeId } from '../../theme/themes';
import { breakpointForWidth } from '../breakpoints';
import { getDevicePreset } from '../devicePresets';
import { useDesigner } from '../store';

export function InspectorPanel() {
	const { state, dispatch } = useDesigner();
	const { project, ui } = state;
	const frame = project.frames.find((f) => f.id === ui.selectedFrameId);
	const page = project.pages.find((p) => p.id === ui.activePageId);
	const node = ui.selectedNodeId && page ? page.nodes[ui.selectedNodeId] : null;
	const trial = frame?.trialId ? project.trials.find((t) => t.id === frame.trialId) : undefined;
	const bp = frame ? breakpointForWidth(frame.width) : 'base';

	return (
		<aside className="designer-inspector">
			<div className="inspector-scope">
				Edit scope:
				<button
					type="button"
					className={ui.editScope === 'base' ? 'active' : ''}
					onClick={() => dispatch({ type: 'setEditScope', scope: 'base' })}
				>
					All breakpoints
				</button>
				<button
					type="button"
					className={ui.editScope === 'breakpoint' ? 'active' : ''}
					onClick={() => dispatch({ type: 'setEditScope', scope: 'breakpoint' })}
				>
					This breakpoint ({bp})
				</button>
			</div>

			<Accordion title="Selection">
				{frame && (
					<p className="inspector-crumb">
						{frame.name} › {node?.name ?? '—'}
					</p>
				)}
				{node && (
					<div className="field">
						<label>Name</label>
						<input readOnly value={node.name} />
					</div>
				)}
			</Accordion>

			{frame && (
				<Accordion title="Frame">
					<div className="field">
						<label>Device</label>
						<input readOnly value={getDevicePreset(frame.devicePresetId)?.label ?? 'Custom'} />
					</div>
					<Select
						label="Theme"
						value={frame.themeId ?? project.defaultThemeId}
						onChange={(e) =>
							dispatch({
								type: 'setFrameTheme',
								frameId: frame.id,
								themeId: e.target.value as ThemeId,
							})
						}
					>
						{THEME_IDS.map((id) => (
							<option key={id} value={id}>{THEME_LABELS[id]}</option>
						))}
					</Select>
					{trial && (
						<div className="field">
							<Select
								label="Trial token"
								defaultValue=""
								onChange={(e) => {
									const [token, value] = e.target.value.split('|');
									if (token && value)
										dispatch({ type: 'setTrialToken', token, value });
								}}
							>
								<option value="">Tweak primary…</option>
								<option value="--bf-theme-button-primary-bg|#0ea5e9">Primary → sky</option>
								<option value="--bf-theme-button-primary-bg|#7c3aed">Primary → violet</option>
							</Select>
							<button
								type="button"
								className="btn btn-secondary"
								style={{ marginTop: '0.5rem' }}
								onClick={() => dispatch({ type: 'promoteTrial', trialId: trial.id, to: 'page' })}
							>
								Apply trial to page
							</button>
							<button
								type="button"
								className="btn btn-ghost"
								style={{ marginTop: '0.25rem' }}
								onClick={() => dispatch({ type: 'promoteTrial', trialId: trial.id, to: 'new-theme' })}
							>
								Save as theme
							</button>
						</div>
					)}
				</Accordion>
			)}

			{node?.instance && (
				<Accordion title="Component">
					<div className="field">
						<label>Definition</label>
						<input readOnly value={node.instance.definitionId} />
					</div>
					<Select
						label="Variant"
						value={node.instance.variantKey}
						onChange={(e) =>
							dispatch({ type: 'updateNodeVariant', nodeId: node.id, variantKey: e.target.value })
						}
					>
						{['primary', 'secondary', 'ghost', 'elevated', 'default'].map((v) => (
							<option key={v} value={v}>{v}</option>
						))}
					</Select>
				</Accordion>
			)}

			{node?.content?.text !== undefined && (
				<Accordion title="Content">
					<div className="field">
						<label>Text</label>
						<input
							value={node.content.text ?? ''}
							onChange={(e) =>
								dispatch({ type: 'updateNodeContent', nodeId: node.id, text: e.target.value })
							}
						/>
					</div>
				</Accordion>
			)}

			{node && (
				<Accordion title="Layout">
					<Select
						label="Mode"
						value={node.layout.mode}
						onChange={(e) =>
							dispatch({
								type: 'updateNodeLayout',
								nodeId: node.id,
								layout: { mode: e.target.value as typeof node.layout.mode },
							})
						}
					>
						{['stack', 'row', 'column', 'grid', 'free'].map((m) => (
							<option key={m} value={m}>{m}</option>
						))}
					</Select>
					<div className="field">
						<label>Gap</label>
						<input
							type="number"
							value={node.layout.gap}
							onChange={(e) =>
								dispatch({
									type: 'updateNodeLayout',
									nodeId: node.id,
									layout: { gap: Number(e.target.value) },
								})
							}
						/>
					</div>
					<Select
						label="Width mode"
						value={node.layout.widthMode}
						onChange={(e) =>
							dispatch({
								type: 'updateNodeLayout',
								nodeId: node.id,
								layout: { widthMode: e.target.value as typeof node.layout.widthMode },
							})
						}
					>
						{['fill', 'hug', 'fixed', 'percent'].map((m) => (
							<option key={m} value={m}>{m}</option>
						))}
					</Select>
				</Accordion>
			)}

			{node && (
				<Accordion title="Responsive">
					<p className="sidebar-hint">
						Overrides on <strong>{bp}</strong> when edit scope is breakpoint-only. Row on Home actions
						reflows column on phone frames.
					</p>
				</Accordion>
			)}
		</aside>
	);
}

function Accordion({ title, children }: { title: string; children: ReactNode }) {
	return (
		<details className="inspector-accordion" open>
			<summary>{title}</summary>
			<div className="inspector-body">{children}</div>
		</details>
	);
}
