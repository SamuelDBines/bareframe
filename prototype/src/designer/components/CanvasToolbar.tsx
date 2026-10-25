import { THEME_IDS, THEME_LABELS, type ThemeId } from '../../theme/themes';
import { DUPLICATE_TO_DEVICES_DEFAULT } from '../devicePresets';
import { useDesigner } from '../store';

export function CanvasToolbar() {
	const { state, dispatch } = useDesigner();
	const { project, ui } = state;
	const frame = project.frames.find((f) => f.id === ui.selectedFrameId);

	return (
		<div className="canvas-subtoolbar">
			<label>
				Device
				<select
					value={frame?.devicePresetId ?? 'iphone-15'}
					onChange={(e) => {
						if (frame)
							dispatch({ type: 'setFrameDevice', frameId: frame.id, presetId: e.target.value });
					}}
				>
					<option value="iphone-15">iPhone 15 393×852</option>
					<option value="ipad-mini">iPad Mini 768×1024</option>
					<option value="desktop-1440">Desktop 1440×900</option>
				</select>
			</label>
			<label>
				Theme
				<select
					value={frame?.themeId ?? project.defaultThemeId}
					onChange={(e) => {
						if (frame)
							dispatch({ type: 'setFrameTheme', frameId: frame.id, themeId: e.target.value as ThemeId });
						else dispatch({ type: 'setDefaultTheme', themeId: e.target.value as ThemeId });
					}}
				>
					{THEME_IDS.map((id) => (
						<option key={id} value={id}>{THEME_LABELS[id]}</option>
					))}
				</select>
			</label>
			<label>
				Compare
				<select
					defaultValue=""
					onChange={(e) => {
						const v = e.target.value;
						if (!v) return;
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
						e.target.value = '';
					}}
				>
					<option value="">Off</option>
					<option value="devices">Devices for page</option>
					<option value="themes">Themes for frame</option>
					<option value="matrix">Device × theme grid</option>
				</select>
			</label>
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
