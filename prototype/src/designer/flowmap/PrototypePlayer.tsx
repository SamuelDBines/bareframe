import { useMemo, useState } from 'react';
import type { ThemeId } from '../../theme/themes';
import { FramePreview } from '../components/FramePreview';
import { useDesigner } from '../store';
import type { Connector, Frame } from '../types';

function hotspotsForFrame(frame: Frame, connectors: Connector[]) {
  const outgoing = connectors.filter((c) => c.fromFrameId === frame.id);
  return outgoing.map((c, i) => ({
    connector: c,
    style: {
      left: `${12 + (i % 2) * 42}%`,
      top: `${58 + Math.floor(i / 2) * 12}%`,
      width: '36%',
      height: '8%',
    },
  }));
}

export function PrototypePlayer() {
  const { state } = useDesigner();
  const { project } = state;
  const frames = useMemo(
    () => project.frames.filter((f) => !f.ghost && project.pages.some((p) => p.id === f.pageId)),
    [project.frames, project.pages],
  );
  const [currentId, setCurrentId] = useState<string | null>(frames[0]?.id ?? null);

  const frame = frames.find((f) => f.id === currentId) ?? frames[0];
  const page = frame ? project.pages.find((p) => p.id === frame.pageId) : null;
  const themeId = (frame?.themeId ?? project.defaultThemeId) as ThemeId;

  if (!frame || !page) {
    return (
      <div className="prototype-player">
        <p style={{ color: '#94a3b8' }}>Add screens to preview the flow.</p>
      </div>
    );
  }

  const hotspots = hotspotsForFrame(frame, project.connectors);

  return (
    <div className="prototype-player" data-testid="prototype-player">
      <div className="prototype-player__device">
        <FramePreview
          frame={frame}
          page={page}
          themeId={themeId}
          customTokens={project.customTokenOverrides}
          selectedNodeId={null}
          onSelectNode={() => undefined}
        />
        {hotspots.map(({ connector, style }) => (
          <button
            key={connector.id}
            type="button"
            className="prototype-hotspot"
            style={style}
            title={connector.label ?? 'Next'}
            aria-label={connector.label ?? 'Navigate'}
            onClick={() => setCurrentId(connector.toFrameId)}
          />
        ))}
      </div>
      <div className="prototype-player__bar">
        {hotspots.map(({ connector }) => (
          <button
            key={`chip-${connector.id}`}
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentId(connector.toFrameId)}
          >
            {connector.label ?? 'Next'}
          </button>
        ))}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCurrentId(frames[0]?.id ?? null)}>
          Restart
        </button>
      </div>
      <p className="ds-meta" style={{ color: '#94a3b8', margin: 0 }}>
        Prototype · {frame.name}
      </p>
    </div>
  );
}
