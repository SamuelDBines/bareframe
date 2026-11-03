import { useState } from 'react';
import { createProjectShare, startProCheckout } from '../../app/reviewApi';
import { useAppCanvasChrome } from '../AppCanvasChrome';
import { useDesigner } from '../store';
import { FigmaImportDialog } from './FigmaImportDialog';

export type FlowWorkspaceMode = 'map' | 'edit' | 'prototype';

type Props = {
  mode: FlowWorkspaceMode;
  onModeChange: (mode: FlowWorkspaceMode) => void;
  connectMode: boolean;
  onConnectModeChange: (on: boolean) => void;
  readOnly?: boolean;
};

export function FlowMapToolbar({
  mode,
  onModeChange,
  connectMode,
  onConnectModeChange,
  readOnly,
}: Props) {
  const { dispatch } = useDesigner();
  const chrome = useAppCanvasChrome();
  const [figmaOpen, setFigmaOpen] = useState(false);
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

  return (
    <>
      <div className="flow-map-toolbar">
        <div className="flow-map-mode-tabs" role="tablist" aria-label="Canvas mode">
          {(['map', 'edit', 'prototype'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-pressed={mode === m}
              data-testid={`flow-mode-${m}`}
              onClick={() => onModeChange(m)}
            >
              {m === 'map' ? 'Flow map' : m === 'edit' ? 'Edit' : 'Prototype'}
            </button>
          ))}
        </div>
        {!readOnly ? (
          <div className="flow-map-toolbar__actions">
            {chrome.projectId ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                data-testid="figma-import-open"
                onClick={() => setFigmaOpen(true)}
              >
                Import Figma
              </button>
            ) : null}
            {mode === 'edit' ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => dispatch({ type: 'addFrame', presetId: 'iphone-15' })}
                >
                  Add screen
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${connectMode ? 'btn-primary' : 'btn-ghost'}`}
                  aria-pressed={connectMode}
                  onClick={() => onConnectModeChange(!connectMode)}
                >
                  Draw connection
                </button>
              </>
            ) : null}
            {chrome.showShare && chrome.projectId ? (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => void handleShare()}>
                Share
              </button>
            ) : null}
            {chrome.showUpgrade ? (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  void startProCheckout().then((r) => {
                    if (r.checkoutUrl) window.location.href = r.checkoutUrl;
                    else setToast(r.message ?? 'Checkout unavailable');
                  })
                }
              >
                Upgrade · £20/mo
              </button>
            ) : null}
            {toast ? <span className="canvas-app-toast">{toast}</span> : null}
          </div>
        ) : null}
      </div>
      {figmaOpen && chrome.projectId ? (
        <FigmaImportDialog projectId={chrome.projectId} onClose={() => setFigmaOpen(false)} />
      ) : null}
    </>
  );
}
