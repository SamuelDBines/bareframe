import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { friendlyError } from '../../app/apiError';
import type { ThemeId } from '../../theme/themes';
import { useAppCanvasChrome } from '../AppCanvasChrome';
import { DeviceViewportSwitcher } from '../components/DeviceViewportSwitcher';
import { FramePreview } from '../components/FramePreview';
import {
	PROTOTYPE_DEVICE_CHROME,
	type PrototypeViewportKind,
	prototypeDeviceMetrics,
	prototypeStageScale,
	prototypeViewportKindForFrame,
} from '../prototypeDeviceViewport';
import { useDesigner } from '../store';
import type { Connector, Frame } from '../types';
import { copyShareLink } from './FlowMapToolbar';
import type { DesignSpec } from '@bareframe/designer-core';
import { resolveMapPreviewPage } from './resolveMapPreviewPage';
import { viewportToDesignDevice } from './designViewport';

/** Entry screen: explicit override, else first screen nothing links to (falls back to left-most). */
function entryFrame(frames: Frame[], connectors: Connector[], explicitEntryFrameId?: string | null) {
	if (explicitEntryFrameId && frames.some((f) => f.id === explicitEntryFrameId)) {
		return frames.find((f) => f.id === explicitEntryFrameId)!;
	}
	const targets = new Set(connectors.map((c) => c.toFrameId));
	const sorted = [...frames].sort((a, b) => a.x - b.x || a.y - b.y);
	return sorted.find((f) => !targets.has(f.id)) ?? sorted[0];
}

/**
 * Full-screen click-through. Hotspots come from the connectors leaving the
 * current screen; number keys follow them, Backspace goes back, Esc exits.
 */
type PlayerProps = {
	onExit: () => void;
	viewportKind?: PrototypeViewportKind;
	onViewportKindChange?: (kind: PrototypeViewportKind) => void;
	previewDesigns?: Map<string, DesignSpec>;
};

export function PrototypePlayer({ onExit, viewportKind: controlledViewport, onViewportKindChange, previewDesigns }: PlayerProps) {
	const { state } = useDesigner();
	const chrome = useAppCanvasChrome();
	const { project } = state;
	const frames = useMemo(
		() => project.frames.filter((f) => !f.ghost && project.pages.some((p) => p.id === f.pageId)),
		[project.frames, project.pages],
	);
	const start = useMemo(
		() => entryFrame(frames, project.connectors, project.prototypeEntryFrameId),
		[frames, project.connectors, project.prototypeEntryFrameId],
	);
	const [currentId, setCurrentId] = useState<string | null>(start?.id ?? null);
	const [history, setHistory] = useState<string[]>([]);
	const [toast, setToast] = useState<string | null>(null);
	const [localViewport, setLocalViewport] = useState<PrototypeViewportKind>('phone');
	const viewportKind = controlledViewport ?? localViewport;
	const setViewportKind = onViewportKindChange ?? setLocalViewport;
	const [stageScale, setStageScale] = useState(1);
	const [flowBlockHeight, setFlowBlockHeight] = useState(0);
	const closeRef = useRef<HTMLButtonElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const flowRef = useRef<HTMLDivElement>(null);

	const frame = frames.find((f) => f.id === currentId) ?? start;
	const page = frame ? project.pages.find((p) => p.id === frame.pageId) : null;
	const themeId = (frame?.themeId ?? project.defaultThemeId) as ThemeId;
	const outgoing = frame ? project.connectors.filter((c) => c.fromFrameId === frame.id && frames.some((f) => f.id === c.toFrameId)) : [];
	const nameOf = (id: string) => frames.find((f) => f.id === id)?.name ?? 'Next';
	const nodeLinkTargets = useMemo(() => {
		const m = new Map<string, string>();
		for (const c of outgoing) {
			if (c.fromNodeId) m.set(c.fromNodeId, c.toFrameId);
		}
		return m;
	}, [outgoing]);
	const protoHotspotNodeIds = useMemo(() => [...nodeLinkTargets.keys()], [nodeLinkTargets]);

	const metrics = frame && page ? prototypeDeviceMetrics(viewportKind, frame, page) : null;
	const chromeStyle = PROTOTYPE_DEVICE_CHROME[viewportKind];

	useEffect(() => {
		if (controlledViewport != null || !frame) return;
		setLocalViewport(prototypeViewportKindForFrame(frame));
	}, [frame?.id, controlledViewport]);

	const previewPage = useMemo(() => {
		if (!page || !frame) return null;
		const device = viewportToDesignDevice(viewportKind);
		const outgoingLabels = outgoing.map((c) => c.label ?? 'Next');
		return resolveMapPreviewPage(
			page,
			device,
			previewDesigns ?? new Map(),
			project.productBrief?.description ?? project.name,
			outgoingLabels,
		);
	}, [page, frame, viewportKind, previewDesigns, project.productBrief?.description, project.name, outgoing]);

	const go = (to: string) => {
		if (!frame) return;
		setHistory((h) => [...h, frame.id]);
		setCurrentId(to);
	};
	const back = () => {
		const prev = history[history.length - 1];
		if (!prev) return;
		setHistory((h) => h.slice(0, -1));
		setCurrentId(prev);
	};
	const restart = () => {
		setHistory([]);
		setCurrentId(start?.id ?? null);
	};

	useEffect(() => {
		const prev = document.activeElement as HTMLElement | null;
		closeRef.current?.focus();
		document.body.style.overflow = 'hidden';
		stageRef.current?.scrollTo({ top: 0, left: 0 });
		return () => {
			document.body.style.overflow = '';
			prev?.focus();
		};
	}, []);

	useEffect(() => {
		if (!metrics) return;
		const stage = stageRef.current;
		if (!stage) return;
		const fit = () => {
			const flowH = flowRef.current?.offsetHeight ?? 0;
			setFlowBlockHeight(flowH);
			const stageRect = stage.getBoundingClientRect();
			const marginX = stageRect.width < 520 ? 16 : 48;
			const marginY = stageRect.height < 640 ? 20 : 32;
			const flowGap = 16;
			// Scale device chrome only; connector hotspots stay full size (transform on the whole stack
			// left an oversized layout box that stole clicks below the mock).
			const stageHForDevice = Math.max(120, stageRect.height - flowH - flowGap);
			const nextScale = prototypeStageScale(
				metrics.outerW,
				metrics.outerH,
				stageRect.width,
				stageHForDevice,
				marginX,
				marginY,
			);
			setStageScale(nextScale);
			stage.scrollTo({ top: 0, left: 0 });
		};
		fit();
		const ro = new ResizeObserver(fit);
		ro.observe(stage);
		if (flowRef.current) ro.observe(flowRef.current);
		window.addEventListener('resize', fit);
		return () => {
			ro.disconnect();
			window.removeEventListener('resize', fit);
		};
	}, [metrics?.outerW, metrics?.outerH, outgoing.length]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onExit();
			else if (e.key === 'Backspace' || e.key === 'ArrowLeft') back();
			else if (/^[1-9]$/.test(e.key)) {
				const c = outgoing[Number(e.key) - 1];
				if (c) go(c.toFrameId);
			} else return;
			e.preventDefault();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	useEffect(() => {
		if (!toast) return;
		const t = window.setTimeout(() => setToast(null), 3200);
		return () => window.clearTimeout(t);
	}, [toast]);

	const step = history.length + 1;
	const scaledDeviceW = metrics ? metrics.outerW * stageScale : 0;
	const scaledDeviceH = metrics ? metrics.outerH * stageScale : 0;

	return createPortal(
		<div className="proto" role="dialog" aria-modal="true" aria-label="Prototype preview" data-testid="prototype-player">
			<header className="proto__bar">
				<div className="proto__title">
					<strong>{project.name}</strong>
					<span>
						{frame?.name ?? 'No screens'} · step {step}
					</span>
				</div>
				<div className="proto__bar-center">
					<DeviceViewportSwitcher value={viewportKind} onChange={setViewportKind} className="device-viewport-switch--proto" />
				</div>
				<div className="proto__actions">
					{toast ? (
						<span className="proto__toast" role="status">
							{toast}
						</span>
					) : null}
					<button type="button" className="proto__btn" onClick={back} disabled={history.length === 0}>
						← Back
					</button>
					<button type="button" className="proto__btn" onClick={restart}>
						Restart
					</button>
					{chrome.projectId && chrome.showShare ? (
						<button
							type="button"
							className="proto__btn proto__btn--primary"
							onClick={() =>
								void copyShareLink(chrome.projectId!)
									.then(setToast)
									.catch((e) => setToast(friendlyError(e, 'We couldn’t create a share link.')))
							}
						>
							Copy share link
						</button>
					) : null}
					<button ref={closeRef} type="button" className="proto__btn" onClick={onExit} aria-label="Close prototype">
						✕ Close
					</button>
				</div>
			</header>

			<div className="proto__stage" ref={stageRef}>
				{frame && page && metrics ? (
					<div
						className="proto__stage-slot"
						style={{
							width: scaledDeviceW,
							height: scaledDeviceH + flowBlockHeight + 16,
							maxWidth: '100%',
						}}
					>
						<div
							className="proto__device-stack"
							style={{ width: scaledDeviceW, maxWidth: '100%' }}
							data-viewport={viewportKind}
							data-stage-scale={Math.round(stageScale * 1000) / 1000}
						>
						<div
							className="proto__device-scale"
							style={{ width: scaledDeviceW, height: scaledDeviceH }}
						>
						<div
							className={`proto__device proto__device--${viewportKind}`}
							style={{
								width: metrics.outerW,
								height: metrics.outerH,
								padding: chromeStyle.padding,
								borderRadius: chromeStyle.radius,
								transform: `scale(${stageScale})`,
								transformOrigin: 'top center',
							}}
						>
							<div
								className="proto__screen"
								style={{
									width: metrics.shellW,
									height: metrics.shellH,
									borderRadius: chromeStyle.screenRadius,
								}}
							>
								<div
									className="proto__screen-fit"
									style={{
										width: metrics.drawnW,
										height: metrics.drawnH,
									}}
									data-testid="proto-screen-fit"
									data-content-w={metrics.contentW}
									data-content-h={metrics.contentH}
									data-drawn-w={Math.round(metrics.drawnW * 100) / 100}
									data-drawn-h={Math.round(metrics.drawnH * 100) / 100}
								>
									<div
										className="proto__screen-scale"
										style={{
											width: metrics.contentW,
											height: metrics.contentH,
											transform: `scale(${metrics.contentScale})`,
										}}
									>
										<FramePreview
											frame={frame}
											page={previewPage ?? page}
											themeId={themeId}
											customTokens={project.customTokenOverrides}
											selectedNodeId={null}
											protoHotspotNodeIds={protoHotspotNodeIds}
											onSelectNode={(nodeId) => {
												const to = nodeLinkTargets.get(nodeId);
												if (to) go(to);
											}}
											lockDocumentHeight
										/>
									</div>
								</div>
							</div>
						</div>
						</div>

						<div className="proto__flow" ref={flowRef}>
							{outgoing.map((c, i) => (
								<button
									key={c.id}
									type="button"
									className="proto-hotspot"
									onClick={() => go(c.toFrameId)}
									aria-label={`${c.label ?? 'Next'}: go to ${nameOf(c.toFrameId)} (key ${i + 1})`}
								>
									<kbd>{i + 1}</kbd>
									<span>{c.label ?? 'Next'}</span>
									<em>→ {nameOf(c.toFrameId)}</em>
								</button>
							))}
							{outgoing.length === 0 ? (
								<div className="proto-end">
									<strong>End of this path</strong>
									<button type="button" className="proto__btn" onClick={restart}>
										Start again
									</button>
								</div>
							) : null}
						</div>
					</div>
					</div>
				) : (
					<p className="proto__empty">Add screens to the map to preview the flow.</p>
				)}
			</div>
			<p className="proto__hint" aria-hidden>
				Tap a hotspot or press its number · ← back · Esc to exit
			</p>
		</div>,
		document.body,
	);
}
