import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ThemeId } from '../../theme/themes';
import { FramePreview } from '../components/FramePreview';
import { useDesigner } from '../store';
import type { Annotation, Connector, Frame } from '../types';
import {
  FLOW_CARD_HEIGHT,
  FLOW_CARD_WIDTH,
  autoLayoutFlowMap,
  boundsForFlowMapFrames,
  cardPosition,
  connectorPath,
} from './flowMapLayout';
import { zoomCameraAroundPoint, type Camera } from '../camera';

function applyWorldTransform(el: HTMLElement | null, camera: Camera) {
  if (!el) return;
  el.style.transform = `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`;
}

function Pin({ annotation }: { annotation: Annotation }) {
  return (
    <div className="flow-map-pin" title={annotation.text}>
      <span className="flow-map-pin__dot" />
      <span className="flow-map-pin__text">{annotation.text.split('\n')[0]}</span>
    </div>
  );
}

function FlowMapCard({
  frame,
  page,
  themeId,
  customTokens,
  selected,
  onSelect,
  onDrag,
  annotations,
  zoom,
  connectMode,
  connectSource,
}: {
  frame: Frame;
  page: import('../types').Page;
  themeId: ThemeId;
  customTokens: Record<string, string>;
  selected: boolean;
  onSelect: () => void;
  onDrag: (dx: number, dy: number) => void;
  annotations: Annotation[];
  zoom: number;
  connectMode?: boolean;
  connectSource?: boolean;
}) {
  const pos = cardPosition(frame);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  return (
    <div
      className={`flow-map-card${selected ? ' flow-map-card--selected' : ''}${connectSource ? ' flow-map-card--connect-source' : ''}`}
      style={{ left: pos.left, top: pos.top, width: FLOW_CARD_WIDTH, height: FLOW_CARD_HEIGHT }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        onSelect();
        if (connectMode) return;
        dragRef.current = { x: e.clientX, y: e.clientY, ox: frame.x, oy: frame.y };
        const onMove = (ev: PointerEvent) => {
          const d = dragRef.current;
          if (!d) return;
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
    >
      <header className="flow-map-card__header">
        <strong>{frame.name}</strong>
      </header>
      <div className="flow-map-card__thumb">
        <FramePreview
          frame={{ ...frame, width: 393, height: 520 }}
          page={page}
          themeId={themeId}
          customTokens={customTokens}
          selectedNodeId={null}
          onSelectNode={() => undefined}
        />
      </div>
      {annotations.map((a) => (
        <Pin key={a.id} annotation={a} />
      ))}
    </div>
  );
}

export function FlowMapCanvas({
  connectMode,
  connectFromFrameId,
  onConnectFrameSelect,
}: {
  connectMode?: boolean;
  connectFromFrameId?: string | null;
  onConnectFrameSelect?: (frameId: string) => void;
}) {
  const { state, dispatch, fitAll } = useDesigner();
  const { project, ui } = state;
  const camera = ui.camera;
  const containerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const liveCameraRef = useRef(camera);

  const frames = useMemo(
    () => project.frames.filter((f) => !f.ghost && project.pages.some((p) => p.id === f.pageId)),
    [project.frames, project.pages],
  );

  useEffect(() => {
    liveCameraRef.current = camera;
    applyWorldTransform(worldRef.current, camera);
  }, [camera]);

  useEffect(() => {
    const t = setTimeout(() => fitAll(), 100);
    return () => clearTimeout(t);
  }, [fitAll, frames.length]);

  const commitCamera = useCallback(
    (next: Camera) => {
      liveCameraRef.current = next;
      applyWorldTransform(worldRef.current, next);
      dispatch({ type: 'setCamera', patch: next });
    },
    [dispatch],
  );

  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = zoomCameraAroundPoint(
      liveCameraRef.current,
      e.clientX,
      e.clientY,
      rect.left,
      rect.top,
      e.deltaY > 0 ? -0.08 : 0.08,
    );
    commitCamera(next);
  };

  const bounds = useMemo(() => {
    const b = boundsForFlowMapFrames(frames);
    if (!b) return { w: 400, h: 300, minX: 0, minY: 0 };
    return { minX: b.x, minY: b.y, w: b.w, h: b.h };
  }, [frames]);

  const viewW = containerRef.current?.clientWidth ?? 800;
  const viewH = containerRef.current?.clientHeight ?? 500;
  const cam = liveCameraRef.current;
  const miniLeft = ((-cam.x / cam.zoom - bounds.minX) / bounds.w) * 100;
  const miniTop = ((-cam.y / cam.zoom - bounds.minY) / bounds.h) * 100;
  const miniW = (viewW / cam.zoom / bounds.w) * 100;
  const miniH = (viewH / cam.zoom / bounds.h) * 100;

  const edges = project.connectors.filter(
    (c) => frames.some((f) => f.id === c.fromFrameId) && frames.some((f) => f.id === c.toFrameId),
  );

  return (
    <div className="flow-map-viewport" ref={containerRef} onWheel={onWheel}>
      <div
        className="flow-map-grid"
        onPointerDown={(e) => {
          if (e.target !== e.currentTarget) return;
          dispatch({ type: 'selectFrame', frameId: null });
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
          <svg className="flow-map-edges" width={bounds.w + bounds.minX + 200} height={bounds.h + bounds.minY + 200}>
            <defs>
              <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--flow-edge-color, #64748b)" />
              </marker>
            </defs>
            {edges.map((edge: Connector) => {
              const from = frames.find((f) => f.id === edge.fromFrameId);
              const to = frames.find((f) => f.id === edge.toFrameId);
              if (!from || !to) return null;
              const d = connectorPath(from, to);
              const mx = (from.x + FLOW_CARD_WIDTH + to.x) / 2;
              const my = (from.y + to.y) / 2 + FLOW_CARD_HEIGHT / 2;
              return (
                <g key={edge.id}>
                  <path d={d} className="flow-map-edge" markerEnd="url(#flow-arrow)" />
                  <text x={mx} y={my - 8} className="flow-map-edge-label">
                    {edge.label ?? edge.trigger ?? 'Next'}
                  </text>
                </g>
              );
            })}
          </svg>
          {frames.map((frame) => {
            const page = project.pages.find((p) => p.id === frame.pageId);
            if (!page) return null;
            const themeId = (frame.themeId ?? project.defaultThemeId) as ThemeId;
            const anns = project.annotations.filter((a) => a.frameId === frame.id);
            return (
              <FlowMapCard
                key={frame.id}
                frame={frame}
                page={page}
                themeId={themeId}
                customTokens={project.customTokenOverrides}
                selected={ui.selectedFrameId === frame.id}
                onSelect={() => {
                  dispatch({ type: 'selectFrame', frameId: frame.id });
                  if (connectMode && onConnectFrameSelect) onConnectFrameSelect(frame.id);
                }}
                onDrag={(x, y) => dispatch({ type: 'moveFrame', frameId: frame.id, x, y })}
                annotations={anns}
                zoom={liveCameraRef.current.zoom}
                connectMode={connectMode}
                connectSource={connectFromFrameId === frame.id}
              />
            );
          })}
        </div>
      </div>
      <div className="flow-map-minimap" aria-hidden>
        <div
          className="flow-map-minimap__frame"
          style={{
            left: `${Math.max(0, Math.min(100 - miniW, miniLeft))}%`,
            top: `${Math.max(0, Math.min(100 - miniH, miniTop))}%`,
            width: `${Math.min(100, miniW)}%`,
            height: `${Math.min(100, miniH)}%`,
          }}
        />
      </div>
      <div className="flow-map-zoom-bar">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => fitAll()}>
          Fit flow
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            const updates = autoLayoutFlowMap(project);
            for (const u of updates) {
              dispatch({ type: 'moveFrame', frameId: u.frameId, x: u.x, y: u.y });
            }
          }}
        >
          Auto-layout
        </button>
      </div>
    </div>
  );
}
