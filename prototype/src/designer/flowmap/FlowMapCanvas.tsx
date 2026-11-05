import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ThemeId } from '../../theme/themes';
import { SEVERITY_ORDER, severityOf, useReview, type Severity } from '../../app/ReviewContext';
import type { ReviewIssue } from '../../app/reviewApi';
import { FramePreview } from '../components/FramePreview';
import { useDesigner } from '../store';
import type { Annotation, Frame, Page } from '../types';
import {
	FLOW_CARD_HEIGHT,
	FLOW_CARD_WIDTH,
	FLOW_LABEL_BOX_HEIGHT,
	FLOW_THUMB_HEIGHT,
	autoLayoutFlowMap,
	boundsForFlowMapFrames,
	routeConnectors,
} from './flowMapLayout';
import { panCamera, setCameraZoomAtScreenPoint, zoomCameraAroundPoint, type Camera } from '../camera';
import type { ContextMenuState } from './FlowMapContextMenu';

const THUMB_SCALE = FLOW_CARD_WIDTH / 393;
const SEV_LABEL: Record<Severity, string> = { critical: 'Critical', major: 'Major', minor: 'Minor', info: 'Info' };

function applyWorldTransform(el: HTMLElement | null, camera: Camera) {
	if (!el) return;
	el.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`;
}

/** Severity-coloured flag cluster pinned to a card's top-right corner. */
function CardFlags({
	issues,
	activeIssueId,
	onOpen,
}: {
	issues: ReviewIssue[];
	activeIssueId: string | null;
	onOpen: (issue: ReviewIssue) => void;
}) {
	const open = issues
		.filter((i) => i.status === 'open')
		.sort((a, b) => SEVERITY_ORDER.indexOf(severityOf(a)) - SEVERITY_ORDER.indexOf(severityOf(b)));
	if (open.length === 0) {
		return issues.length ? (
			<span className="map-flag map-flag--ok" title="All findings on this screen are handled" aria-hidden>
				✓
			</span>
		) : null;
	}
	const active = open.find((i) => i.id === activeIssueId);
	return (
		<div className="map-flags">
			{open.map((issue) => {
				const sev = severityOf(issue);
				return (
					<button
						key={issue.id}
						type="button"
						className={`map-flag map-flag--${sev}${issue.id === activeIssueId ? ' is-active' : ''}`}
						aria-label={`${SEV_LABEL[sev]} finding: ${issue.title}`}
						onPointerDown={(e) => e.stopPropagation()}
						onClick={(e) => {
							e.stopPropagation();
							onOpen(issue);
						}}
					>
						!
					</button>
				);
			})}
			{active ? (
				<div className="map-callout bx-reveal" role="status">
					<span className={`bx-sev bx-sev--${severityOf(active)}`}>{SEV_LABEL[severityOf(active)]}</span>
					<strong>{active.title}</strong>
				</div>
			) : null}
		</div>
	);
}

function LegacyPins({ annotations }: { annotations: Annotation[] }) {
	const callouts = annotations.filter((a) => a.kind !== 'note');
	if (!callouts.length) return null;
	return (
		<div className="map-flags">
			{callouts.map((a) => (
				<span key={a.id} className="map-flag map-flag--major" title={a.text}>
					!
				</span>
			))}
		</div>
	);
}

function FlowMapCard({
	frame,
	page,
	themeId,
	customTokens,
	selected,
	dimmed,
	onSelect,
	onDrag,
	annotations,
	issues,
	zoom,
	connectMode,
	connectSource,
	readOnly,
	onContextMenu,
	onMenuKey,
}: {
	frame: Frame;
	page: Page;
	themeId: ThemeId;
	customTokens: Record<string, string>;
	selected: boolean;
	dimmed: boolean;
	onSelect: () => void;
	onDrag: (x: number, y: number) => void;
	annotations: Annotation[];
	issues: ReviewIssue[] | null;
	zoom: number;
	connectMode?: boolean;
	connectSource?: boolean;
	readOnly?: boolean;
	onContextMenu?: (e: React.MouseEvent, frame: Frame) => void;
	onMenuKey?: (e: React.KeyboardEvent, frame: Frame) => void;
}) {
	const review = useReview();
	const dragRef = useRef<{ x: number; y: number; ox: number; oy: number; moved: boolean } | null>(null);
	const notes = annotations.filter((a) => a.kind === 'note');
	const openCount = issues?.filter((i) => i.status === 'open').length ?? 0;

	return (
		<div
			className={`flow-map-card${selected ? ' flow-map-card--selected' : ''}${
				connectSource ? ' flow-map-card--connect-source' : ''
			}${connectMode ? ' flow-map-card--connectable' : ''}${dimmed ? ' flow-map-card--dimmed' : ''}`}
			style={{
				left: frame.x,
				top: frame.y,
				width: FLOW_CARD_WIDTH,
				height: FLOW_CARD_HEIGHT,
				['--flow-thumb-height' as string]: `${FLOW_THUMB_HEIGHT}px`,
				['--flow-thumb-scale' as string]: String(THUMB_SCALE),
			}}
			onPointerDown={(e) => {
				if (e.button !== 0) return;
				e.stopPropagation();
				onSelect();
				if (connectMode || readOnly) return;
				dragRef.current = { x: e.clientX, y: e.clientY, ox: frame.x, oy: frame.y, moved: false };
				const onMove = (ev: PointerEvent) => {
					const d = dragRef.current;
					if (!d) return;
					d.moved = true;
					onDrag(d.ox + (ev.clientX - d.x) / zoom, d.oy + (ev.clientY - d.y) / zoom);
				};
				const onUp = () => {
					dragRef.current = null;
					window.removeEventListener('pointermove', onMove);
					window.removeEventListener('pointerup', onUp);
				};
				window.addEventListener('pointermove', onMove);
				window.addEventListener('pointerup', onUp);
			}}
			onContextMenu={(e) => {
				if (readOnly) return;
				e.preventDefault();
				e.stopPropagation();
				onContextMenu?.(e, frame);
			}}
		>
			<button
				type="button"
				className="flow-map-card__hit"
				data-frame-id={frame.id}
				data-testid="flow-map-card-hit"
				aria-pressed={selected}
				aria-haspopup="menu"
				aria-label={`${frame.name}${openCount ? `, ${openCount} open finding${openCount === 1 ? '' : 's'}` : ''}`}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						onSelect();
						return;
					}
					if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) {
						e.preventDefault();
						onMenuKey?.(e, frame);
					}
				}}
			/>
			<div className="flow-map-card__thumb">
				<div className="flow-map-card__thumb-inner" aria-hidden>
					<FramePreview
						frame={{ ...frame, width: 393, height: 520 }}
						page={page}
						themeId={themeId}
						customTokens={customTokens}
						selectedNodeId={null}
						onSelectNode={() => undefined}
					/>
				</div>
				{notes.length ? (
					<span className="flow-map-card__note" title={notes.map((n) => n.text).join('\n')}>
						{notes.length} fix note{notes.length === 1 ? '' : 's'}
					</span>
				) : null}
			</div>
			<footer className="flow-map-card__footer">{frame.name}</footer>
			{issues && review ? (
				<CardFlags
					issues={issues}
					activeIssueId={review.activeIssueId}
					onOpen={(issue) => {
						review.setActiveIssue(issue.id);
						onSelect();
					}}
				/>
			) : (
				<LegacyPins annotations={annotations} />
			)}
		</div>
	);
}

export function FlowMapCanvas({
	connectMode,
	connectFromFrameId,
	onConnectFrameSelect,
	readOnly,
	onContextMenuChange,
}: {
	connectMode?: boolean;
	connectFromFrameId?: string | null;
	onConnectFrameSelect?: (frameId: string) => void;
	readOnly?: boolean;
	onContextMenuChange?: (menu: ContextMenuState) => void;
	onRenameFrame?: (frameId: string, currentName: string) => void;
	onRequestDeleteFrame?: (frame: Frame, connectorCount: number) => void;
	onAddScreenFromMenu?: () => void;
}) {
	const { state, dispatch, fitAll } = useDesigner();
	const review = useReview();
	const { project, ui } = state;
	const camera = ui.camera;
	const containerRef = useRef<HTMLDivElement>(null);
	const worldRef = useRef<HTMLDivElement>(null);
	const liveCameraRef = useRef(camera);
	const [viewport, setViewport] = useState({ w: 900, h: 600 });

	const frames = useMemo(
		() => project.frames.filter((f) => !f.ghost && project.pages.some((p) => p.id === f.pageId)),
		[project.frames, project.pages],
	);

	const routed = useMemo(() => routeConnectors(frames, project.connectors), [frames, project.connectors]);
	const connectorById = useMemo(() => new Map(project.connectors.map((c) => [c.id, c])), [project.connectors]);

	const issuesByFrame = useMemo(() => {
		if (!review) return null;
		const map = new Map<string, ReviewIssue[]>();
		for (const i of review.issues) {
			if (!i.frameId || i.status === 'dismissed') continue;
			map.set(i.frameId, [...(map.get(i.frameId) ?? []), i]);
		}
		return map;
	}, [review]);

	useEffect(() => {
		liveCameraRef.current = camera;
		applyWorldTransform(worldRef.current, camera);
	}, [camera]);

	const runFit = useCallback(() => {
		window.requestAnimationFrame(() => fitAll());
	}, [fitAll]);

	const didInitialFit = useRef(false);

	useEffect(() => {
		if (frames.length === 0) return;
		if (didInitialFit.current) return;
		didInitialFit.current = true;
		runFit();
		const t = window.setTimeout(runFit, 180);
		return () => window.clearTimeout(t);
	}, [frames.length, runFit]);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const ro = new ResizeObserver(() => setViewport({ w: el.clientWidth, h: el.clientHeight }));
		ro.observe(el);
		setViewport({ w: el.clientWidth, h: el.clientHeight });
		return () => ro.disconnect();
	}, []);

	const commitCamera = useCallback(
		(next: Camera) => {
			liveCameraRef.current = next;
			applyWorldTransform(worldRef.current, next);
			dispatch({ type: 'setCamera', patch: next });
		},
		[dispatch],
	);

	// Bring a selected card into view (e.g. from the side panel or keyboard).
	useEffect(() => {
		const f = frames.find((fr) => fr.id === ui.selectedFrameId);
		if (!f) return;
		const cam = liveCameraRef.current;
		const left = f.x * cam.zoom + cam.x;
		const top = f.y * cam.zoom + cam.y;
		const w = FLOW_CARD_WIDTH * cam.zoom;
		const h = FLOW_CARD_HEIGHT * cam.zoom;
		const pad = 48;
		let dx = 0;
		let dy = 0;
		if (left < pad) dx = pad - left;
		else if (left + w > viewport.w - pad) dx = viewport.w - pad - (left + w);
		if (top < pad + 56) dy = pad + 56 - top;
		else if (top + h > viewport.h - pad) dy = viewport.h - pad - (top + h);
		if (dx || dy) commitCamera(panCamera(cam, dx, dy));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ui.selectedFrameId]);

	const zoomBy = (delta: number) => {
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return;
		commitCamera(
			zoomCameraAroundPoint(liveCameraRef.current, rect.left + rect.width / 2, rect.top + rect.height / 2, rect.left, rect.top, delta),
		);
	};

	const onWheel = (e: React.WheelEvent) => {
		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect) return;
		if (e.ctrlKey || e.metaKey) {
			e.preventDefault();
			const cam = liveCameraRef.current;
			const factor = Math.exp(-e.deltaY * 0.0025);
			commitCamera(setCameraZoomAtScreenPoint(cam, e.clientX, e.clientY, rect.left, rect.top, cam.zoom * factor));
			return;
		}
		commitCamera(panCamera(liveCameraRef.current, -e.deltaX, -e.deltaY));
	};

	useEffect(() => {
		// React's onWheel is passive; block browser zoom on pinch inside the canvas.
		const el = containerRef.current;
		if (!el) return;
		const block = (e: WheelEvent) => {
			if (e.ctrlKey || e.metaKey) e.preventDefault();
		};
		el.addEventListener('wheel', block, { passive: false });
		return () => el.removeEventListener('wheel', block);
	}, []);

	const onKeyDown = (e: React.KeyboardEvent) => {
		const target = e.target as HTMLElement;
		if (target.closest('input, textarea, select')) return;
		const step = e.shiftKey ? 240 : 64;
		const cam = liveCameraRef.current;
		switch (e.key) {
			case 'ArrowLeft':
				if (target === e.currentTarget) commitCamera(panCamera(cam, step, 0));
				else focusNeighbour(target, 'left');
				break;
			case 'ArrowRight':
				if (target === e.currentTarget) commitCamera(panCamera(cam, -step, 0));
				else focusNeighbour(target, 'right');
				break;
			case 'ArrowUp':
				if (target === e.currentTarget) commitCamera(panCamera(cam, 0, step));
				else focusNeighbour(target, 'up');
				break;
			case 'ArrowDown':
				if (target === e.currentTarget) commitCamera(panCamera(cam, 0, -step));
				else focusNeighbour(target, 'down');
				break;
			case '+':
			case '=':
				zoomBy(0.1);
				break;
			case '-':
			case '_':
				zoomBy(-0.1);
				break;
			case '0':
				runFit();
				break;
			case 'Escape':
				dispatch({ type: 'selectFrame', frameId: null });
				review?.setActiveIssue(null);
				break;
			default:
				return;
		}
		e.preventDefault();
	};

	/** Arrow keys on a focused card jump to the nearest card in that direction. */
	const focusNeighbour = (el: HTMLElement, dir: 'left' | 'right' | 'up' | 'down') => {
		const id = el.closest<HTMLElement>('[data-frame-id]')?.dataset.frameId;
		const from = frames.find((f) => f.id === id);
		if (!from) return;
		let best: Frame | null = null;
		let bestScore = Infinity;
		for (const f of frames) {
			if (f.id === from.id) continue;
			const dx = f.x - from.x;
			const dy = f.y - from.y;
			const ok = dir === 'left' ? dx < -10 : dir === 'right' ? dx > 10 : dir === 'up' ? dy < -10 : dy > 10;
			if (!ok) continue;
			const main = dir === 'left' || dir === 'right' ? Math.abs(dx) : Math.abs(dy);
			const cross = dir === 'left' || dir === 'right' ? Math.abs(dy) : Math.abs(dx);
			const score = main + cross * 2;
			if (score < bestScore) {
				best = f;
				bestScore = score;
			}
		}
		if (best) {
			containerRef.current?.querySelector<HTMLElement>(`[data-frame-id="${best.id}"]`)?.focus();
			dispatch({ type: 'selectFrame', frameId: best.id });
		}
	};

	const bounds = useMemo(() => {
		const b = boundsForFlowMapFrames(frames);
		if (!b) return { w: 800, h: 600, minX: 0, minY: 0, maxX: 800, maxY: 600 };
		const pad = 160;
		return { minX: b.x, minY: b.y - pad, w: b.w, h: b.h + pad * 2, maxX: b.x + b.w, maxY: b.y + b.h + pad };
	}, [frames]);

	const cam = liveCameraRef.current;
	const miniW = 168;
	const miniH = Math.max(72, Math.min(120, (bounds.h / bounds.w) * miniW));
	const miniScale = Math.min(miniW / bounds.w, miniH / bounds.h);
	const viewRect = {
		x: (-cam.x / cam.zoom - bounds.minX) * miniScale,
		y: (-cam.y / cam.zoom - bounds.minY) * miniScale,
		w: (viewport.w / cam.zoom) * miniScale,
		h: (viewport.h / cam.zoom) * miniScale,
	};

	const moveCameraToMini = (clientX: number, clientY: number, el: Element) => {
		const r = el.getBoundingClientRect();
		const wx = (clientX - r.left) / miniScale + bounds.minX;
		const wy = (clientY - r.top) / miniScale + bounds.minY;
		const z = liveCameraRef.current.zoom;
		commitCamera({ zoom: z, x: viewport.w / 2 - wx * z, y: viewport.h / 2 - wy * z });
	};

	const selected = frames.some((f) => f.id === ui.selectedFrameId) ? ui.selectedFrameId : null;
	const svgW = bounds.maxX + 400;
	const svgH = bounds.maxY + 400;

	const openContextMenu = (clientX: number, clientY: number, frame: Frame) => {
		dispatch({ type: 'selectFrame', frameId: frame.id });
		onContextMenuChange?.({ kind: 'frame', frame, x: clientX, y: clientY });
	};

	const openCanvasMenu = (clientX: number, clientY: number) => {
		onContextMenuChange?.({ kind: 'canvas', x: clientX, y: clientY });
	};

	return (
		<div
			className={`flow-map-viewport${connectMode ? ' is-connecting' : ''}`}
			ref={containerRef}
			onWheel={onWheel}
			onKeyDown={onKeyDown}
			tabIndex={0}
			role="application"
			aria-roledescription="flow map"
			aria-label="Flow map. Arrow keys pan, plus and minus zoom, 0 fits the flow. Tab to move between screens."
			data-testid="flow-map-viewport"
		>
			<div
				className="flow-map-grid"
				onContextMenu={(e) => {
					if (readOnly || e.target !== e.currentTarget) return;
					e.preventDefault();
					openCanvasMenu(e.clientX, e.clientY);
				}}
				onPointerDown={(e) => {
					if (e.target !== e.currentTarget) return;
					dispatch({ type: 'selectFrame', frameId: null });
					review?.setActiveIssue(null);
					const start = { x: e.clientX, y: e.clientY, cam: { ...liveCameraRef.current } };
					const onMove = (ev: PointerEvent) => {
						commitCamera({
							...start.cam,
							x: start.cam.x + (ev.clientX - start.x),
							y: start.cam.y + (ev.clientY - start.y),
						});
					};
					const onUp = () => {
						window.removeEventListener('pointermove', onMove);
						window.removeEventListener('pointerup', onUp);
					};
					window.addEventListener('pointermove', onMove);
					window.addEventListener('pointerup', onUp);
				}}
			>
				<div ref={worldRef} className="flow-map-world">
					<svg className="flow-map-edges" width={svgW} height={svgH} aria-hidden>
						<defs>
							<marker id="flow-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
								<path d="M 0 0 L 10 5 L 0 10 z" fill="var(--bx-accent, #5b3df5)" />
							</marker>
							<marker id="flow-arrow-muted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
								<path d="M 0 0 L 10 5 L 0 10 z" fill="#b9b4d9" />
							</marker>
						</defs>
						{routed.map((r) => {
							const c = connectorById.get(r.id)!;
							const touches = !selected || c.fromFrameId === selected || c.toFrameId === selected;
							return (
								<g key={r.id} className={`flow-edge flow-edge--${r.kind}${touches ? '' : ' is-muted'}`}>
									<path d={r.d} className="flow-map-edge" markerEnd={touches ? 'url(#flow-arrow)' : 'url(#flow-arrow-muted)'} />
									<g transform={`translate(${r.label.x - r.label.w / 2}, ${r.label.y - FLOW_LABEL_BOX_HEIGHT / 2})`}>
										<rect width={r.label.w} height={FLOW_LABEL_BOX_HEIGHT} rx={FLOW_LABEL_BOX_HEIGHT / 2} className="flow-map-edge-pill" />
										<text x={r.label.w / 2} y={FLOW_LABEL_BOX_HEIGHT / 2 + 5} className="flow-map-edge-pill-text">
											{r.label.text}
										</text>
										<title>{c.label ?? c.trigger ?? 'Next'}</title>
									</g>
								</g>
							);
						})}
					</svg>
					{frames.map((frame) => {
						const page = project.pages.find((p) => p.id === frame.pageId);
						if (!page) return null;
						const themeId = (frame.themeId ?? project.defaultThemeId) as ThemeId;
						const anns = project.annotations.filter((a) => a.frameId === frame.id);
						const linked =
							!selected ||
							selected === frame.id ||
							project.connectors.some(
								(c) =>
									(c.fromFrameId === selected && c.toFrameId === frame.id) ||
									(c.toFrameId === selected && c.fromFrameId === frame.id),
							);
						return (
							<FlowMapCard
								key={frame.id}
								frame={frame}
								page={page}
								themeId={themeId}
								customTokens={project.customTokenOverrides}
								selected={selected === frame.id}
								dimmed={!linked}
								onSelect={() => {
									dispatch({ type: 'selectFrame', frameId: frame.id });
									if (connectMode && onConnectFrameSelect) onConnectFrameSelect(frame.id);
								}}
								onDrag={(x, y) => dispatch({ type: 'moveFrame', frameId: frame.id, x, y })}
								annotations={anns}
								issues={issuesByFrame ? issuesByFrame.get(frame.id) ?? [] : null}
								zoom={liveCameraRef.current.zoom}
								connectMode={connectMode}
								connectSource={connectFromFrameId === frame.id}
								readOnly={readOnly}
								onContextMenu={(e, fr) => openContextMenu(e.clientX, e.clientY, fr)}
								onMenuKey={(e, fr) => {
									const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
									openContextMenu(rect.left + rect.width / 2, rect.top + 8, fr);
								}}
							/>
						);
					})}
				</div>
			</div>

			{frames.length === 0 ? (
				<div className="flow-map-empty" role="status">
					<strong>This map is empty</strong>
					<span>
						{readOnly ? 'Nothing has been added yet.' : 'Import from Figma, or switch to Edit and add your first screen.'}
					</span>
				</div>
			) : null}

			{connectMode ? (
				<div className="flow-map-connect-hint" role="status">
					{connectFromFrameId ? 'Now pick the screen it leads to' : 'Pick the screen the connection starts from'}
				</div>
			) : null}

			{frames.length > 0 ? (
				<div
					className="flow-map-minimap"
					style={{ width: miniW, height: miniH }}
					onPointerDown={(e) => {
						const el = e.currentTarget;
						moveCameraToMini(e.clientX, e.clientY, el);
						const move = (ev: PointerEvent) => moveCameraToMini(ev.clientX, ev.clientY, el);
						const up = () => {
							window.removeEventListener('pointermove', move);
							window.removeEventListener('pointerup', up);
						};
						window.addEventListener('pointermove', move);
						window.addEventListener('pointerup', up);
					}}
					aria-hidden
				>
					<svg width={miniW} height={miniH}>
						{frames.map((f) => {
							const open = issuesByFrame?.get(f.id)?.some((i) => i.status === 'open');
							return (
								<rect
									key={f.id}
									x={(f.x - bounds.minX) * miniScale}
									y={(f.y - bounds.minY) * miniScale}
									width={FLOW_CARD_WIDTH * miniScale}
									height={FLOW_CARD_HEIGHT * miniScale}
									rx={2}
									className={`mini-card${f.id === selected ? ' is-selected' : ''}${open ? ' has-flags' : ''}`}
								/>
							);
						})}
						<rect
							x={Math.max(0, viewRect.x)}
							y={Math.max(0, viewRect.y)}
							width={Math.max(10, Math.min(miniW - Math.max(0, viewRect.x), viewRect.w))}
							height={Math.max(10, Math.min(miniH - Math.max(0, viewRect.y), viewRect.h))}
							className="mini-view"
						/>
					</svg>
				</div>
			) : null}

			<div className="flow-map-zoom-bar" role="toolbar" aria-label="Zoom">
				<button type="button" className="zoom-btn" onClick={() => zoomBy(-0.1)} aria-label="Zoom out">
					−
				</button>
				<span className="zoom-level" aria-live="polite">
					{Math.round(camera.zoom * 100)}%
				</span>
				<button type="button" className="zoom-btn" onClick={() => zoomBy(0.1)} aria-label="Zoom in">
					+
				</button>
				<span className="zoom-sep" />
				<button type="button" className="zoom-btn zoom-btn--text" onClick={() => runFit()}>
					Fit
				</button>
				{readOnly ? null : (
					<button
						type="button"
						className="zoom-btn zoom-btn--text"
						onClick={() => {
							for (const u of autoLayoutFlowMap(project)) {
								dispatch({ type: 'moveFrame', frameId: u.frameId, x: u.x, y: u.y });
							}
							runFit();
						}}
						data-testid="auto-layout"
					>
						Auto-layout
					</button>
				)}
			</div>
		</div>
	);
}
