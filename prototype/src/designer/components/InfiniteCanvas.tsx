import { useCallback, useEffect, useRef, useState } from 'react';
import type { ThemeId } from '../../theme/themes';
import { THEME_LABELS } from '../../theme/themes';
import { cameraForPan, type PanAnchor } from '../canvasPanSession';
import { setCameraZoomAtScreenPoint, zoomCameraAroundPoint, type Camera } from '../camera';
import { getDevicePreset } from '../devicePresets';
import type { MatrixLayout } from '../frameLayout';
import { useDesigner } from '../store';
import { useDesignerCanvasInput } from '../useDesignerCanvasInput';
import { CanvasFrame } from './CanvasFrame';

function MatrixHeaders({ layout }: { layout: MatrixLayout }) {
	const { originX, originY, headerW, headerH, colPresetIds, rowThemeIds, colX, colWidths, rowY, rowHeights } =
		layout;

	return (
		<>
			<div
				className="matrix-corner-label"
				style={{ left: originX, top: originY, width: headerW, height: headerH }}
			>
				Theme ↓ / Device →
			</div>
			{colPresetIds.map((id, i) => (
				<div
					key={`col-${id}`}
					className="matrix-col-header"
					style={{
						left: colX[i] ?? originX + headerW,
						top: originY,
						width: colWidths[i],
						height: headerH,
					}}
				>
					{getDevicePreset(id)?.label ?? id}
				</div>
			))}
			{rowThemeIds.map((themeId, ri) => (
				<div
					key={`row-${themeId}`}
					className="matrix-row-header"
					style={{
						left: originX,
						top: rowY[ri],
						width: headerW,
						height: rowHeights[ri],
					}}
				>
					{THEME_LABELS[themeId as ThemeId] ?? themeId}
				</div>
			))}
		</>
	);
}

function applyWorldTransform(el: HTMLElement | null, camera: Camera) {
	if (!el) return;
	el.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`;
}

function pointerDistance(
	a: { x: number; y: number },
	b: { x: number; y: number },
): number {
	return Math.hypot(b.x - a.x, b.y - a.y);
}

export function InfiniteCanvas() {
	const { state, dispatch, fitAll, fitSelection } = useDesigner();
	const { project, ui } = state;
	const camera = ui.camera;
	const containerRef = useRef<HTMLDivElement>(null);
	const worldRef = useRef<HTMLDivElement>(null);
	const liveCameraRef = useRef<Camera>(camera);
	const [spaceDown, setSpaceDown] = useState(false);
	const [zoomLabel, setZoomLabel] = useState(() => Math.round(camera.zoom * 100));
	const panRef = useRef<PanAnchor | null>(null);
	const windowPanCleanupRef = useRef<(() => void) | null>(null);
	const pinchRef = useRef<{
		startDist: number;
		startZoom: number;
		startCam: Camera;
		centerX: number;
		centerY: number;
	} | null>(null);
	const pointersRef = useRef(new Map<number, { x: number; y: number }>());

	const page = project.pages.find((p) => p.id === ui.activePageId);

	useEffect(() => {
		if (panRef.current || pinchRef.current) return;
		liveCameraRef.current = camera;
		applyWorldTransform(worldRef.current, camera);
		setZoomLabel(Math.round(camera.zoom * 100));
	}, [camera]);

	useEffect(
		() => () => {
			windowPanCleanupRef.current?.();
		},
		[],
	);

	const commitCamera = useCallback(
		(next: Camera) => {
			liveCameraRef.current = next;
			applyWorldTransform(worldRef.current, next);
			setZoomLabel(Math.round(next.zoom * 100));
			dispatch({ type: 'setCamera', patch: next });
		},
		[dispatch],
	);

	const zoomAround = useCallback(
		(clientX: number, clientY: number, delta: number) => {
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;
			const next = zoomCameraAroundPoint(
				liveCameraRef.current,
				clientX,
				clientY,
				rect.left,
				rect.top,
				delta,
			);
			commitCamera(next);
		},
		[commitCamera],
	);

	const endWindowPan = useCallback(() => {
		windowPanCleanupRef.current?.();
		windowPanCleanupRef.current = null;
	}, []);

	const clearPan = useCallback(() => {
		endWindowPan();
		panRef.current = null;
		pinchRef.current = null;
		pointersRef.current.clear();
	}, [endWindowPan]);

	const applyPanMove = useCallback((clientX: number, clientY: number) => {
		const p = panRef.current;
		if (!p) return;
		const next = cameraForPan(p, clientX, clientY, liveCameraRef.current);
		liveCameraRef.current = next;
		applyWorldTransform(worldRef.current, next);
	}, []);

	const startWindowPan = useCallback(
		(clientX: number, clientY: number) => {
			endWindowPan();
			panRef.current = {
				startX: clientX,
				startY: clientY,
				camX: liveCameraRef.current.x,
				camY: liveCameraRef.current.y,
			};
			const onMove = (ev: PointerEvent) => applyPanMove(ev.clientX, ev.clientY);
			const onUp = () => {
				endWindowPan();
				if (panRef.current) {
					commitCamera(liveCameraRef.current);
					panRef.current = null;
				}
			};
			window.addEventListener('pointermove', onMove);
			window.addEventListener('pointerup', onUp);
			window.addEventListener('pointercancel', onUp);
			windowPanCleanupRef.current = () => {
				window.removeEventListener('pointermove', onMove);
				window.removeEventListener('pointerup', onUp);
				window.removeEventListener('pointercancel', onUp);
			};
		},
		[applyPanMove, commitCamera, endWindowPan],
	);

	const zoomTo100 = useCallback(() => {
		commitCamera({ ...liveCameraRef.current, zoom: 1 });
	}, [commitCamera]);

	useDesignerCanvasInput({
		containerRef,
		workspaceSelector: '.designer-workspace-v2',
		liveCameraRef,
		commitCamera,
		zoomAround,
		onSpaceChange: setSpaceDown,
		onClearPan: clearPan,
		fitAll,
		fitSelection,
		zoomTo100,
		dispatch,
	});

	const frames = project.frames.filter((f) => {
		if (ui.compare?.kind === 'matrix') {
			return f.ghost && ui.compare.ghostFrameIds.includes(f.id);
		}
		if (ui.compare?.kind === 'themes') {
			const src = ui.compare.sourceFrameId;
			return (
				f.id === src ||
				(f.ghost && ui.compare.ghostFrameIds.includes(f.id))
			);
		}
		return (f.pageId === ui.activePageId && !f.ghost) || (f.ghost && ui.compare?.kind === 'devices');
	});

	const shouldPan = (e: React.PointerEvent) =>
		spaceDown ||
		e.button === 1 ||
		(e.pointerType === 'touch' && e.target === e.currentTarget);

	const onPointerDown = (e: React.PointerEvent) => {
		pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
		const pts = [...pointersRef.current.values()];

		if (pts.length === 2) {
			const [a, b] = pts;
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;
			panRef.current = null;
			pinchRef.current = {
				startDist: pointerDistance(a, b),
				startZoom: liveCameraRef.current.zoom,
				startCam: { ...liveCameraRef.current },
				centerX: (a.x + b.x) / 2 - rect.left,
				centerY: (a.y + b.y) / 2 - rect.top,
			};
			return;
		}

		if (shouldPan(e)) {
			e.preventDefault();
			startWindowPan(e.clientX, e.clientY);
		} else if (e.target === e.currentTarget) {
			dispatch({ type: 'selectFrame', frameId: null });
		}
	};

	const onPointerMove = (e: React.PointerEvent) => {
		if (pointersRef.current.has(e.pointerId)) {
			pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
		}

		const pinch = pinchRef.current;
		if (pinch && pointersRef.current.size >= 2) {
			const pts = [...pointersRef.current.values()];
			if (pts.length >= 2) {
				const [a, b] = pts;
				const dist = pointerDistance(a, b);
				const nextZoom = pinch.startZoom * (dist / pinch.startDist);
				const rect = containerRef.current?.getBoundingClientRect();
				if (rect) {
					const midX = (a.x + b.x) / 2;
					const midY = (a.y + b.y) / 2;
					const next = setCameraZoomAtScreenPoint(
						pinch.startCam,
						midX,
						midY,
						rect.left,
						rect.top,
						nextZoom,
					);
					liveCameraRef.current = next;
					applyWorldTransform(worldRef.current, next);
					setZoomLabel(Math.round(next.zoom * 100));
				}
			}
			return;
		}

		applyPanMove(e.clientX, e.clientY);
	};

	const onPointerUp = (e: React.PointerEvent) => {
		pointersRef.current.delete(e.pointerId);
		if (pinchRef.current && pointersRef.current.size < 2) {
			pinchRef.current = null;
			commitCamera(liveCameraRef.current);
		}
		if (e.nativeEvent.getModifierState) {
			if (!e.nativeEvent.getModifierState(' ')) setSpaceDown(false);
		}
	};

	const zoomCenter = () => {
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return { x: 0, y: 0 };
		return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
	};

	return (
		<div
			ref={containerRef}
			className={`infinite-canvas${spaceDown ? ' infinite-canvas--space-pan' : ''}`}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}
		>
			<div
				ref={worldRef}
				className="canvas-world"
				data-camera-x={liveCameraRef.current.x}
				data-camera-y={liveCameraRef.current.y}
				data-camera-zoom={liveCameraRef.current.zoom}
			>
				{ui.compare?.kind === 'matrix' && ui.compare.layout && (
					<MatrixHeaders layout={ui.compare.layout} />
				)}
				{page &&
					frames.map((frame) => {
						const themeId = (frame.themeId ?? project.defaultThemeId) as ThemeId;
						const trial = project.trials.find((t) => t.id === frame.trialId);
						return (
							<CanvasFrame
								key={frame.id}
								frame={frame}
								page={page}
								themeId={themeId}
								customTokens={project.customTokenOverrides}
								trial={trial}
								selected={ui.selectedFrameId === frame.id}
								selectedNodeId={ui.selectedNodeId}
								zoom={liveCameraRef.current.zoom}
								spaceDown={spaceDown}
								onSelectFrame={(frameId) => dispatch({ type: 'selectFrame', frameId })}
								onSelectNode={(frameId, nodeId) => {
									dispatch({ type: 'selectFrame', frameId });
									dispatch({ type: 'selectNode', nodeId });
								}}
								onMoveFrame={(frameId, x, y) =>
									dispatch({ type: 'moveFrame', frameId, x, y })
								}
								onSetDevice={(frameId, presetId) =>
									dispatch({ type: 'setFrameDevice', frameId, presetId })
								}
								onDuplicateDevices={(frameId) =>
									dispatch({
										type: 'duplicateFrameToDevices',
										frameId,
										presetIds: ['iphone-15', 'ipad-mini', 'desktop-1440'],
									})
								}
								onCreateTrial={(frameId) =>
									dispatch({ type: 'createStyleTrial', frameId })
								}
							/>
						);
					})}
			</div>
			<div className="canvas-zoom-controls">
				<button
					type="button"
					onClick={() => {
						const c = zoomCenter();
						zoomAround(c.x, c.y, -0.1);
					}}
				>
					−
				</button>
				<span>{zoomLabel}%</span>
				<button
					type="button"
					onClick={() => {
						const c = zoomCenter();
						zoomAround(c.x, c.y, 0.1);
					}}
				>
					+
				</button>
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
