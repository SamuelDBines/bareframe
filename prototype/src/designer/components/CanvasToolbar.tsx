import { Select } from '../../components/Select';
import { THEME_IDS, THEME_LABELS, type ThemeId } from '../../theme/themes';
import { DEFAULT_DEVICE_PRESETS, DUPLICATE_TO_DEVICES_DEFAULT } from '../devicePresets';
import {
	presetIdForViewportKind,
	prototypeViewportKindForFrame,
	type PrototypeViewportKind,
} from '../prototypeDeviceViewport';
import { DeviceViewportSwitcher } from './DeviceViewportSwitcher';
import { useDesigner } from '../store';
import { useAppCanvasChrome } from '../AppCanvasChrome';
import { beginProCheckout } from '../../app/billingUi';
import { createProjectShare } from '../../app/reviewApi';
import { useState } from 'react';
import { friendlyError } from '../../app/apiError';

function compareSelectValue(compare: ReturnType<typeof useDesigner>['state']['ui']['compare']): string {
	if (!compare) return '';
	return compare.kind;
}

export function CanvasToolbar() {
	const { state, dispatch } = useDesigner();
	const { project, ui } = state;
	const frame = project.frames.find((f) => f.id === ui.selectedFrameId);
	const canvasViewportKind: PrototypeViewportKind = frame
		? prototypeViewportKindForFrame(frame)
		: 'phone';
	const compareValue = compareSelectValue(ui.compare);
	const chrome = useAppCanvasChrome();
	const [toast, setToast] = useState<string | null>(null);

	async function handleShare() {
		if (!chrome.projectId) return;
		try {
			const { publicUrl } = await createProjectShare(chrome.projectId);
			await navigator.clipboard.writeText(publicUrl);
			setToast('Share link copied');
		} catch {
			setToast('Could not create share link');
		}
	}

	async function handleUpgrade() {
		try {
			const msg = await beginProCheckout();
			if (msg) setToast(msg);
		} catch (e) {
			setToast(friendlyError(e, 'Checkout failed'));
		}
	}

	return (
		<div className="canvas-subtoolbar">
			{(chrome.showShare || chrome.showUpgrade) && (
				<div className="canvas-app-actions">
					{chrome.showShare && chrome.projectId ? (
						<button type="button" className="btn btn-secondary btn-sm" onClick={() => void handleShare()}>
							Share canvas
						</button>
					) : null}
					{chrome.showUpgrade ? (
						<button type="button" className="btn btn-primary btn-sm" onClick={() => void handleUpgrade()}>
							Upgrade · £20/mo
						</button>
					) : null}
					{toast ? <span className="canvas-app-toast">{toast}</span> : null}
				</div>
			)}
			<DeviceViewportSwitcher
				className="device-viewport-switch--canvas"
				value={canvasViewportKind}
				aria-label="Frame device size"
				onChange={(kind) => {
					if (!frame) return;
					dispatch({ type: 'setFrameDevice', frameId: frame.id, presetId: presetIdForViewportKind(kind) });
				}}
			/>
			<div className="canvas-subtoolbar-mobile-toggles">
				<button
					type="button"
					className="btn btn-ghost designer-panel-toggle"
					aria-expanded={ui.mobilePanel === 'left'}
					onClick={() =>
						dispatch({
							type: 'setMobilePanel',
							panel: ui.mobilePanel === 'left' ? 'none' : 'left',
						})
					}
				>
					Pages
				</button>
				<button
					type="button"
					className="btn btn-ghost designer-panel-toggle"
					aria-expanded={ui.mobilePanel === 'right'}
					onClick={() =>
						dispatch({
							type: 'setMobilePanel',
							panel: ui.mobilePanel === 'right' ? 'none' : 'right',
						})
					}
				>
					Inspect
				</button>
			</div>
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
