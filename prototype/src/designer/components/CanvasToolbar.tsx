import { Select } from '../../components/Select';
import { THEME_IDS, THEME_LABELS, type ThemeId } from '../../theme/themes';
import { DEFAULT_DEVICE_PRESETS, DUPLICATE_TO_DEVICES_DEFAULT } from '../devicePresets';
import { useDesigner } from '../store';

function compareSelectValue(compare: ReturnType<typeof useDesigner>['state']['ui']['compare']): string {
	if (!compare) return '';
	return compare.kind;
}

export function CanvasToolbar() {
	const { state, dispatch } = useDesigner();
	const { project, ui } = state;
	const frame = project.frames.find((f) => f.id === ui.selectedFrameId);
	const compareValue = compareSelectValue(ui.compare);

	return (
		<div className="canvas-subtoolbar">
			<Select
				label="Device"
				value={frame?.devicePresetId ?? 'iphone-15'}
				onChange={(e) => {
					if (frame)
						dispatch({ type: 'setFrameDevice', frameId: frame.id, presetId: e.target.value });
				}}
			>
				{DEFAULT_DEVICE_PRESETS.slice(0, 10).map((p) => (
					<option key={p.id} value={p.id}>{p.label}</option>
				))}
			</Select>
			<Select
				label="Theme"
				value={frame?.themeId ?? project.defaultThemeId}
				onChange={(e) => {
					const id = e.target.value as ThemeId;
					if (frame) dispatch({ type: 'setFrameTheme', frameId: frame.id, themeId: id });
					else dispatch({ type: 'setDefaultTheme', themeId: id });
				}}
			>
				{THEME_IDS.map((id) => (
					<option key={id} value={id}>{THEME_LABELS[id]}</option>
				))}
			</Select>
			<Select
				label="Compare"
				value={compareValue}
				onChange={(e) => {
					const v = e.target.value;
					if (!v) {
						dispatch({ type: 'exitCompare' });
						return;
					}
					if (v === 'devices') {
						dispatch({
							type: 'setCompare',
							compare: { kind: 'devices', pageId: ui.activePageId, tempFrameIds: [] },
						});
					}
					if (v === 'themes' && frame) {
						dispatch({
							type: 'setCompare',
							compare: {
								kind: 'themes',
								sourceFrameId: frame.id,
								themeIds: ['aurora', 'noir', 'light'] as ThemeId[],
								ghostFrameIds: [],
							},
						});
					}
					if (v === 'matrix') {
						dispatch({
							type: 'setCompare',
							compare: {
								kind: 'matrix',
								pageId: ui.activePageId,
								themeIds: ['light', 'dark', 'aurora'] as ThemeId[],
								devicePresetIds: DUPLICATE_TO_DEVICES_DEFAULT,
								ghostFrameIds: [],
							},
						});
					}
				}}
			>
				<option value="">Off</option>
				<option value="devices">Devices for page</option>
				<option value="themes">Themes for frame</option>
				<option value="matrix">Device × theme grid</option>
			</Select>
			<button
				type="button"
				className="btn btn-ghost"
				onClick={() =>
					frame &&
					dispatch({
						type: 'duplicateFrameToDevices',
						frameId: frame.id,
						presetIds: DUPLICATE_TO_DEVICES_DEFAULT,
					})
				}
			>
				Duplicate to devices
			</button>
		</div>
	);
}
