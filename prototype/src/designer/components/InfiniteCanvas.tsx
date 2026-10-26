import { useCallback, useEffect, useRef, useState } from 'react';
import type { ThemeId } from '../../theme/themes';
import { THEME_LABELS } from '../../theme/themes';
import { panCamera, setCameraZoomAtScreenPoint, zoomCameraAroundPoint, type Camera } from '../camera';
import { getDevicePreset } from '../devicePresets';
import type { MatrixLayout } from '../frameLayout';
import { useDesigner } from '../store';
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
	const panRef = useRef<{ startX: number; startY: number; camX: number; camY: number } | null>(null);
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
		liveCameraRef.current = camera;
		applyWorldTransform(worldRef.current, camera);
		setZoomLabel(Math.round(camera.zoom * 100));
	}, [camera]);

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
			if (e.shiftKey && e.key === '0') commitCamera({ ...liveCameraRef.current, zoom: 1 });
		};
		window.addEventListener('keydown', onKey);
		window.addEventListener('keyup', onKey);
		return () => {
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('keyup', onKey);
		};
	}, [dispatch, fitAll, fitSelection, commitCamera]);

	useEffect(() => {
		const onWheel = (e: WheelEvent) => {
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;
			if (
				e.clientX < rect.left ||
				e.clientX > rect.right ||
				e.clientY < rect.top ||
				e.clientY > rect.bottom
			) {
				return;
			}
			if (e.ctrlKey || e.metaKey) {
				e.preventDefault();
				zoomAround(e.clientX, e.clientY, e.deltaY > 0 ? -0.08 : 0.08);
			} else {
				e.preventDefault();
				const next = panCamera(liveCameraRef.current, -e.deltaX, -e.deltaY);
				commitCamera(next);
			}
		};
		window.addEventListener('wheel', onWheel, { passive: false });
		return () => window.removeEventListener('wheel', onWheel);
	}, [zoomAround, commitCamera]);

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
			panRef.current = {
				startX: e.clientX,
				startY: e.clientY,
				camX: liveCameraRef.current.x,
				camY: liveCameraRef.current.y,
			};
			(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
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

		const p = panRef.current;
		if (!p) return;
		const next = {
			...liveCameraRef.current,
			x: p.camX + (e.clientX - p.startX),
			y: p.camY + (e.clientY - p.startY),
		};
		liveCameraRef.current = next;
		applyWorldTransform(worldRef.current, next);
	};

	const onPointerUp = (e: React.PointerEvent) => {
		pointersRef.current.delete(e.pointerId);
		if (pinchRef.current && pointersRef.current.size < 2) {
			pinchRef.current = null;
			commitCamera(liveCameraRef.current);
		}
		if (panRef.current) {
			panRef.current = null;
			commitCamera(liveCameraRef.current);
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
			className="infinite-canvas"
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onPointerCancel={onPointerUp}
		>
			<div ref={worldRef} className="canvas-world">
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
