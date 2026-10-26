import { memo } from 'react';
import type { ThemeId } from '../../theme/themes';
import { THEME_LABELS } from '../../theme/themes';
import { breakpointForWidth } from '../breakpoints';
import { Select } from '../../components/Select';
import { DEFAULT_DEVICE_PRESETS, getDevicePreset } from '../devicePresets';
import { FRAME_LABEL_HEIGHT } from '../frameLayout';
import type { Frame, Page, StyleTrial } from '../types';
import { FramePreview } from './FramePreview';

type Props = {
	frame: Frame;
	page: Page;
	themeId: ThemeId;
	customTokens: Record<string, string>;
	trial?: StyleTrial;
	selected: boolean;
	selectedNodeId: string | null;
	zoom: number;
	spaceDown: boolean;
	onSelectFrame: (frameId: string) => void;
	onSelectNode: (frameId: string, nodeId: string) => void;
	onMoveFrame: (frameId: string, x: number, y: number) => void;
	onSetDevice: (frameId: string, presetId: string) => void;
	onDuplicateDevices: (frameId: string) => void;
	onCreateTrial: (frameId: string) => void;
};

export const CanvasFrame = memo(function CanvasFrame({
	frame,
	page,
	themeId,
	customTokens,
	trial,
	selected,
	selectedNodeId,
	zoom,
	spaceDown,
	onSelectFrame,
	onSelectNode,
	onMoveFrame,
	onSetDevice,
	onDuplicateDevices,
	onCreateTrial,
}: Props) {
	const preset = getDevicePreset(frame.devicePresetId);
	const bp = breakpointForWidth(frame.width);
	const shortDevice = preset?.label.split(' ').slice(0, 2).join(' ') ?? 'Custom';
	const labelText = `${frame.name} · ${shortDevice} · ${THEME_LABELS[themeId]}`;

	return (
		<div
			className={`canvas-frame-wrap${selected ? ' selected' : ''}${frame.ghost ? ' ghost' : ''}`}
			style={{
				position: 'absolute',
				left: frame.x,
				top: frame.y - FRAME_LABEL_HEIGHT,
				width: frame.width,
			}}
			onPointerDown={(e) => {
				if (frame.readOnly) {
					onSelectFrame(frame.id);
					return;
				}
				if (spaceDown || e.button === 1) return;
				e.stopPropagation();
				onSelectFrame(frame.id);
				const startX = e.clientX;
				const startY = e.clientY;
				const ox = frame.x;
				const oy = frame.y;
				const onMove = (ev: PointerEvent) => {
					onMoveFrame(
						frame.id,
						ox + (ev.clientX - startX) / zoom,
						oy + (ev.clientY - startY) / zoom,
					);
				};
				const onUp = () => {
					window.removeEventListener('pointermove', onMove);
					window.removeEventListener('pointerup', onUp);
					window.removeEventListener('pointercancel', onUp);
				};
				window.addEventListener('pointermove', onMove);
				window.addEventListener('pointerup', onUp);
				window.addEventListener('pointercancel', onUp);
			}}
		>
			<div className="frame-label" title={labelText}>
				<span className="frame-label-text">{labelText}</span>
				{frame.trialId && <span className="trial-chip">Trial</span>}
				<span className="bp-chip">{bp}</span>
			</div>
			<div
				className="frame-chrome"
				style={{
					width: frame.width,
					height: frame.height,
					outline: frame.ghost ? '2px dashed var(--bf-theme-border-1)' : undefined,
				}}
			>
				<FramePreview
					frame={frame}
					page={page}
					themeId={themeId}
					customTokens={customTokens}
					trial={trial}
					selectedNodeId={selected ? selectedNodeId : null}
					onSelectNode={(id) => onSelectNode(frame.id, id)}
				/>
			</div>
			{selected && !frame.readOnly && (
				<div className="frame-toolbar">
					<Select
						value={frame.devicePresetId}
						onChange={(e) => onSetDevice(frame.id, e.target.value)}
					>
						{DEFAULT_DEVICE_PRESETS.map((p) => (
							<option key={p.id} value={p.id}>{p.label}</option>
						))}
					</Select>
					<button
						type="button"
						className="btn btn-ghost"
						style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
						onClick={() => onDuplicateDevices(frame.id)}
					>
						+ devices
					</button>
					<button
						type="button"
						className="btn btn-ghost"
						style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
						onClick={() => onCreateTrial(frame.id)}
					>
						Trial
					</button>
				</div>
			)}
		</div>
	);
});
