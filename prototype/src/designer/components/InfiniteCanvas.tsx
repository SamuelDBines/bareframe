import { useCallback, useEffect, useRef, useState } from 'react';
import type { ThemeId } from '../../theme/themes';
import { THEME_LABELS } from '../../theme/themes';
import { breakpointForWidth } from '../breakpoints';
import { DEFAULT_DEVICE_PRESETS, getDevicePreset } from '../devicePresets';
import { useDesigner } from '../store';
import type { Frame } from '../types';
import { FramePreview } from './FramePreview';

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2.5;

export function InfiniteCanvas() {
	const { state, dispatch, fitAll, fitSelection } = useDesigner();
	const { project, ui } = state;
	const containerRef = useRef<HTMLDivElement>(null);
	const [spaceDown, setSpaceDown] = useState(false);
	const dragRef = useRef<{ frameId: string; ox: number; oy: number; startX: number; startY: number } | null>(null);
	const panRef = useRef<{ startX: number; startY: number; camX: number; camY: number } | null>(null);

	const page = project.pages.find((p) => p.id === ui.activePageId);

	const zoomAround = useCallback(
		(clientX: number, clientY: number, delta: number) => {
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;
			const { x, y, zoom } = project.canvas;
			const nextZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom + delta));
			const mx = clientX - rect.left;
			const my = clientY - rect.top;
			const wx = (mx - x) / zoom;
			const wy = (my - y) / zoom;
			const nx = mx - wx * nextZoom;
			const ny = my - wy * nextZoom;
			dispatch({ type: 'setCamera', patch: { zoom: nextZoom, x: nx, y: ny } });
		},
		[project.canvas, dispatch],
	);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
			if (e.code === 'Space') {
				e.preventDefault();
				setSpaceDown(e.type === 'keydown');
			}
			if (e.key === 'Escape') dispatch({ type: 'exitCompare' });
			if (e.shiftKey && e.key === '1') fitAll();
			if (e.shiftKey && e.key === '2') fitSelection();
			if (e.shiftKey && e.key === '0') dispatch({ type: 'setCamera', patch: { zoom: 1 } });
		};
		window.addEventListener('keydown', onKey);
		window.addEventListener('keyup', onKey);
		return () => {
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('keyup', onKey);
		};
	}, [dispatch, fitAll, fitSelection]);

	const onWheel = (e: React.WheelEvent) => {
		if (e.ctrlKey || e.metaKey) {
			e.preventDefault();
			zoomAround(e.clientX, e.clientY, e.deltaY > 0 ? -0.08 : 0.08);
		} else {
			dispatch({
				type: 'setCamera',
				patch: { x: project.canvas.x - e.deltaX, y: project.canvas.y - e.deltaY },
			});
		}
	};

	const frames = project.frames.filter((f) => f.ghost || f.pageId === ui.activePageId);

	const renderFrame = (frame: Frame) => {
		if (!page) return null;
		const preset = getDevicePreset(frame.devicePresetId);
		const themeId = (frame.themeId ?? project.defaultThemeId) as ThemeId;
		const trial = project.trials.find((t) => t.id === frame.trialId);
		const bp = breakpointForWidth(frame.width);
		const selected = ui.selectedFrameId === frame.id;

		return (
			<div
				key={frame.id}
				className={`canvas-frame-wrap${selected ? ' selected' : ''}${frame.ghost ? ' ghost' : ''}`}
				style={{
					position: 'absolute',
					left: frame.x,
					top: frame.y,
					width: frame.width,
				}}
				onPointerDown={(e) => {
					if (frame.readOnly) {
						dispatch({ type: 'selectFrame', frameId: frame.id });
						return;
					}
					if (spaceDown || e.button === 1) return;
					e.stopPropagation();
					dispatch({ type: 'selectFrame', frameId: frame.id });
					dragRef.current = {
						frameId: frame.id,
						ox: frame.x,
						oy: frame.y,
						startX: e.clientX,
						startY: e.clientY,
					};
					(e.target as HTMLElement).setPointerCapture(e.pointerId);
				}}
				onPointerMove={(e) => {
					const d = dragRef.current;
					if (!d || d.frameId !== frame.id) return;
					const z = project.canvas.zoom;
					dispatch({
						type: 'moveFrame',
						frameId: frame.id,
						x: d.ox + (e.clientX - d.startX) / z,
						y: d.oy + (e.clientY - d.startY) / z,
					});
				}}
				onPointerUp={() => {
					dragRef.current = null;
				}}
			>
				<div
					className="frame-label"
					style={{ transform: `scale(${1 / project.canvas.zoom})`, transformOrigin: 'bottom left' }}
				>
					{frame.name} · {preset?.label ?? 'Custom'} · {frame.width}×{frame.height} ·{' '}
					{THEME_LABELS[themeId]}
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
						customTokens={project.customTokenOverrides}
						trial={trial}
						selectedNodeId={selected ? ui.selectedNodeId : null}
						onSelectNode={(id) => {
							dispatch({ type: 'selectFrame', frameId: frame.id });
							dispatch({ type: 'selectNode', nodeId: id });
						}}
					/>
				</div>
				{selected && !frame.readOnly && (
					<div className="frame-toolbar">
						<select
							value={frame.devicePresetId}
							onChange={(e) =>
								dispatch({ type: 'setFrameDevice', frameId: frame.id, presetId: e.target.value })
							}
						>
							{DEFAULT_DEVICE_PRESETS.map((p) => (
								<option key={p.id} value={p.id}>{p.label}</option>
							))}
						</select>
						<button
							type="button"
							className="btn btn-ghost"
							style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
							onClick={() =>
								dispatch({
									type: 'duplicateFrameToDevices',
									frameId: frame.id,
									presetIds: ['iphone-15', 'ipad-mini', 'desktop-1440'],
								})
							}
						>
							+ devices
						</button>
						<button
							type="button"
							className="btn btn-ghost"
							style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
							onClick={() =>
								dispatch({ type: 'createStyleTrial', frameId: frame.id })
							}
						>
							Trial
						</button>
					</div>
				)}
			</div>
		);
	};

	return (
		<div
			ref={containerRef}
			className="infinite-canvas"
			onWheel={onWheel}
			onPointerDown={(e) => {
				if (spaceDown || e.button === 1) {
					panRef.current = {
						startX: e.clientX,
						startY: e.clientY,
						camX: project.canvas.x,
						camY: project.canvas.y,
					};
					(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
				} else if (e.target === e.currentTarget) {
					dispatch({ type: 'selectFrame', frameId: null });
				}
			}}
			onPointerMove={(e) => {
				const p = panRef.current;
				if (!p) return;
				dispatch({
					type: 'setCamera',
					patch: {
						x: p.camX + (e.clientX - p.startX),
						y: p.camY + (e.clientY - p.startY),
					},
				});
			}}
			onPointerUp={() => {
				panRef.current = null;
			}}
		>
			<div
				className="canvas-world"
				style={{
					transform: `translate(${project.canvas.x}px, ${project.canvas.y}px) scale(${project.canvas.zoom})`,
					transformOrigin: '0 0',
				}}
			>
				{frames.map(renderFrame)}
			</div>
			<div className="canvas-zoom-controls">
				<button type="button" onClick={() => zoomAround(window.innerWidth / 2, window.innerHeight / 2, -0.1)}>−</button>
				<span>{Math.round(project.canvas.zoom * 100)}%</span>
				<button type="button" onClick={() => zoomAround(window.innerWidth / 2, window.innerHeight / 2, 0.1)}>+</button>
				<button type="button" onClick={() => fitAll()}>Fit all</button>
			</div>
			{ui.compare && (
				<div className="compare-bar">
					Compare mode — sync selection on
					<button type="button" className="btn btn-secondary" onClick={() => dispatch({ type: 'makeCompareReal' })}>
						Make real frames
					</button>
					<button type="button" className="btn btn-ghost" onClick={() => dispatch({ type: 'exitCompare' })}>
						Exit
					</button>
				</div>
			)}
		</div>
	);
}
