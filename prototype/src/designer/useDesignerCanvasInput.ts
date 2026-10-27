import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { applyCanvasGestureScale, applyCanvasWheel } from './canvasInputHandlers';
import { cameraForPan } from './canvasPanSession';
import type { Camera } from './camera';
import { FRAME_PREVIEW_MESSAGE_SOURCE } from './framePreviewHostScript';

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;
	const tag = target.tagName;
	if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
	return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function isInDesignerPanel(target: EventTarget | null): boolean {
	return Boolean(
		target instanceof Element &&
			target.closest('.designer-sidebar, .designer-inspector, .assistant-drawer'),
	);
}

function iframeForMessageSource(source: MessageEventSource | null): HTMLIFrameElement | null {
	if (!source) return null;
	for (const el of document.querySelectorAll('iframe.frame-preview-iframe')) {
		if ((el as HTMLIFrameElement).contentWindow === source) return el as HTMLIFrameElement;
	}
	return null;
}

function toScreenPoint(
	source: MessageEventSource | null,
	localX: number,
	localY: number,
): { x: number; y: number } | null {
	const iframe = iframeForMessageSource(source);
	if (!iframe) return null;
	const r = iframe.getBoundingClientRect();
	return { x: r.left + localX, y: r.top + localY };
}

type Options = {
	containerRef: RefObject<HTMLDivElement | null>;
	workspaceSelector: string;
	liveCameraRef: RefObject<Camera>;
	commitCamera: (next: Camera) => void;
	zoomAround: (clientX: number, clientY: number, delta: number) => void;
	onSpaceChange: (down: boolean) => void;
	onClearPan: () => void;
	fitAll: () => void;
	fitSelection: () => void;
	zoomTo100: () => void;
	dispatch: (action: { type: 'undo' } | { type: 'redo' } | { type: 'exitCompare' }) => void;
};

export function useDesignerCanvasInput({
	containerRef,
	workspaceSelector,
	liveCameraRef,
	commitCamera,
	zoomAround,
	onSpaceChange,
	onClearPan,
	fitAll,
	fitSelection,
	zoomTo100,
	dispatch,
}: Options) {
	const spaceRef = useRef(false);
	const iframePanRef = useRef<{ startX: number; startY: number; camX: number; camY: number } | null>(
		null,
	);
	const gestureRef = useRef<{ startCam: Camera; source: MessageEventSource | null } | null>(null);

	const canvasOrigin = useCallback(() => {
		const rect = containerRef.current?.getBoundingClientRect();
		return { left: rect?.left ?? 0, top: rect?.top ?? 0 };
	}, [containerRef]);

	const resetModifiers = useCallback(() => {
		spaceRef.current = false;
		onSpaceChange(false);
		onClearPan();
		iframePanRef.current = null;
		gestureRef.current = null;
	}, [onSpaceChange, onClearPan]);

	const syncSpaceFromPointer = useCallback(
		(e: { getModifierState?: (key: string) => boolean }) => {
			const down = e.getModifierState?.(' ') ?? false;
			if (down !== spaceRef.current) {
				spaceRef.current = down;
				onSpaceChange(down);
				if (!down) onClearPan();
			}
		},
		[onSpaceChange, onClearPan],
	);

	const handleWheelAtScreen = useCallback(
		(clientX: number, clientY: number, deltaX: number, deltaY: number, ctrlKey: boolean) => {
			const { left, top } = canvasOrigin();
			const next = applyCanvasWheel(liveCameraRef.current, left, top, {
				clientX,
				clientY,
				deltaX,
				deltaY,
				ctrlKey,
			});
			commitCamera(next);
		},
		[canvasOrigin, commitCamera, liveCameraRef],
	);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (isEditableTarget(e.target)) return;

			if (e.code === 'Space' && !e.repeat) {
				e.preventDefault();
				spaceRef.current = true;
				onSpaceChange(true);
			}

			if (e.key === 'Escape') dispatch({ type: 'exitCompare' });

			const mod = e.metaKey || e.ctrlKey;
			if (mod && !e.altKey) {
				if (e.key === '0' || e.code === 'Digit0') {
					e.preventDefault();
					zoomTo100();
					return;
				}
				if (e.key === '=' || e.key === '+' || e.code === 'Equal') {
					e.preventDefault();
					const rect = containerRef.current?.getBoundingClientRect();
					if (rect) {
						zoomAround(rect.left + rect.width / 2, rect.top + rect.height / 2, 0.1);
					}
					return;
				}
				if (e.key === '-' || e.code === 'Minus') {
					e.preventDefault();
					const rect = containerRef.current?.getBoundingClientRect();
					if (rect) {
						zoomAround(rect.left + rect.width / 2, rect.top + rect.height / 2, -0.1);
					}
					return;
				}
				if (e.key === 'z' || e.key === 'Z') {
					e.preventDefault();
					if (e.shiftKey) dispatch({ type: 'redo' });
					else dispatch({ type: 'undo' });
					return;
				}
			}

			if (e.shiftKey && e.key === '1') {
				e.preventDefault();
				fitAll();
			}
			if (e.shiftKey && e.key === '2') {
				e.preventDefault();
				fitSelection();
			}
			if (e.shiftKey && e.key === '0') {
				e.preventDefault();
				zoomTo100();
			}
		};

		const onKeyUp = (e: KeyboardEvent) => {
			if (e.code === 'Space') {
				e.preventDefault();
				spaceRef.current = false;
				onSpaceChange(false);
				onClearPan();
			}
			if (e.key === 'Meta' || e.key === 'Control') {
				resetModifiers();
			}
		};

		window.addEventListener('keydown', onKeyDown, true);
		window.addEventListener('keyup', onKeyUp, true);
		window.addEventListener('blur', resetModifiers);
		const onVis = () => {
			if (document.visibilityState !== 'visible') resetModifiers();
		};
		document.addEventListener('visibilitychange', onVis);

		return () => {
			window.removeEventListener('keydown', onKeyDown, true);
			window.removeEventListener('keyup', onKeyUp, true);
			window.removeEventListener('blur', resetModifiers);
			document.removeEventListener('visibilitychange', onVis);
		};
	}, [
		containerRef,
		dispatch,
		fitAll,
		fitSelection,
		onClearPan,
		onSpaceChange,
		resetModifiers,
		zoomAround,
		zoomTo100,
	]);

	useEffect(() => {
		const pointerOpts = { capture: true } as const;
		const onPointerDown = (e: PointerEvent) => syncSpaceFromPointer(e);
		const onPointerUp = (e: PointerEvent) => syncSpaceFromPointer(e);
		window.addEventListener('pointerdown', onPointerDown, pointerOpts);
		window.addEventListener('pointerup', onPointerUp, pointerOpts);
		return () => {
			window.removeEventListener('pointerdown', onPointerDown, pointerOpts);
			window.removeEventListener('pointerup', onPointerUp, pointerOpts);
		};
	}, [syncSpaceFromPointer]);

	useEffect(() => {
		const isOverCanvas = (clientX: number, clientY: number) => {
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return false;
			return (
				clientX >= rect.left &&
				clientX <= rect.right &&
				clientY >= rect.top &&
				clientY <= rect.bottom
			);
		};

		const onWheel = (e: WheelEvent) => {
			if (!document.body.classList.contains('designer-editor-active')) return;

			if (Math.abs(e.deltaX) > 0 && !isInDesignerPanel(e.target)) {
				e.preventDefault();
			}

			if (!isOverCanvas(e.clientX, e.clientY)) return;
			if (isInDesignerPanel(e.target)) return;

			e.preventDefault();
			handleWheelAtScreen(e.clientX, e.clientY, e.deltaX, e.deltaY, e.ctrlKey);
		};

		window.addEventListener('wheel', onWheel, { passive: false, capture: true });
		return () => window.removeEventListener('wheel', onWheel, { capture: true });
	}, [containerRef, handleWheelAtScreen]);

	useEffect(() => {
		const onMessage = (e: MessageEvent) => {
			const data = e.data;
			if (!data || data.source !== FRAME_PREVIEW_MESSAGE_SOURCE) return;
			if (e.origin !== window.location.origin && e.origin !== 'null') return;

			if (data.type === 'wheel') {
				const pt = toScreenPoint(e.source, data.clientX, data.clientY);
				if (!pt) return;
				handleWheelAtScreen(pt.x, pt.y, data.deltaX, data.deltaY, Boolean(data.ctrlKey));
				return;
			}

			if (data.type === 'gesture-start') {
				gestureRef.current = { startCam: { ...liveCameraRef.current }, source: e.source };
				return;
			}

			if (data.type === 'gesture-change' && gestureRef.current?.source === e.source) {
				const pt = toScreenPoint(e.source, data.clientX, data.clientY);
				if (!pt) return;
				const { left, top } = canvasOrigin();
				const next = applyCanvasGestureScale(
					liveCameraRef.current,
					left,
					top,
					pt.x,
					pt.y,
					Number(data.scale) || 1,
					gestureRef.current.startCam,
				);
				commitCamera(next);
				return;
			}

			if (data.type === 'gesture-end') {
				if (gestureRef.current?.source === e.source) gestureRef.current = null;
				return;
			}

			if (data.type === 'pan') {
				const pt = toScreenPoint(e.source, data.clientX, data.clientY);
				if (!pt) return;
				if (data.phase === 'start') {
					iframePanRef.current = {
						startX: pt.x,
						startY: pt.y,
						camX: liveCameraRef.current.x,
						camY: liveCameraRef.current.y,
					};
					return;
				}
				const pan = iframePanRef.current;
				if (!pan) return;
				if (data.phase === 'move') {
					commitCamera(cameraForPan(pan, pt.x, pt.y, liveCameraRef.current));
					return;
				}
				if (data.phase === 'end') {
					iframePanRef.current = null;
				}
			}
		};

		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, [canvasOrigin, commitCamera, handleWheelAtScreen, liveCameraRef]);

	useEffect(() => {
		const workspace = document.querySelector(workspaceSelector);
		if (!workspace) return;

		const lockHorizontalScroll = () => {
			if (window.scrollX !== 0) {
				window.scrollTo({ left: 0, top: window.scrollY, behavior: 'instant' as ScrollBehavior });
			}
		};

		window.addEventListener('scroll', lockHorizontalScroll, { passive: true });
		lockHorizontalScroll();

		return () => window.removeEventListener('scroll', lockHorizontalScroll);
	}, [workspaceSelector]);

	return { spaceRef, resetModifiers, syncSpaceFromPointer };
}
