import { useEffect, useState } from 'react';
import {
  fetchFigmaTokenStatus,
  importFigmaDesign,
  saveFigmaToken,
} from '../../app/reviewApi';
import { fetchProject, fromProjectDocument } from '../projectApi';
import { useDesigner } from '../store';
import { friendlyError } from '../../app/apiError';

type Props = {
  projectId: string;
  onClose: () => void;
};

export function FigmaImportDialog({ projectId, onClose }: Props) {
  const { dispatch } = useDesigner();
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [saveToken, setSaveTokenFlag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenHint, setTokenHint] = useState<string | null>(null);

  useEffect(() => {
    fetchFigmaTokenStatus()
      .then((s) => {
        if (s.configured) setTokenHint(s.source === 'user' ? 'Using your saved token' : 'Using server token');
      })
      .catch(() => undefined);
  }, []);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      if (saveToken && token.trim()) {
        await saveFigmaToken(token.trim());
      }
      const remote = await fetchProject(projectId);
      const result = await importFigmaDesign(projectId, url.trim(), remote.version, token.trim() || undefined);
      const updated = await fetchProject(projectId);
      dispatch({ type: 'hydrateProject', project: fromProjectDocument(updated.document) });
      setTokenHint(`Imported ${result.framesImported} screens · ${result.fileName}`);
      window.setTimeout(onClose, 600);
    } catch (e) {
      setError(friendlyError(e, 'Import failed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bx-dialog-backdrop">
      <div className="bx-dialog flow-map-dialog" role="dialog" aria-modal="true" aria-labelledby="figma-import-title">
        <h2 id="figma-import-title">Import from Figma</h2>
        <p className="bx-hint">
          Paste a Figma design or frame URL. Frames become screens; prototype links become connectors.
        </p>
        <label className="field">
          <span>Figma URL</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.figma.com/design/…"
            data-testid="figma-import-url"
          />
        </label>
        <label className="field">
          <span>Personal access token (optional if saved)</span>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="figd_…"
            autoComplete="off"
          />
        </label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={saveToken} onChange={(e) => setSaveTokenFlag(e.target.checked)} />
          <span>Save token to my account</span>
        </label>
        {tokenHint ? <p className="bx-hint">{tokenHint}</p> : null}
        {error ? (
          <div className="bx-notice bx-notice--warn" role="alert">
            <span className="bx-notice__icon" aria-hidden>!</span>
            <p>{error}</p>
          </div>
        ) : null}
        <div className="bx-dialog__actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void submit()} disabled={busy || !/figma\.com\//.test(url)}>
            {busy ? 'Importing…' : 'Import frames'}
          </button>
        </div>
      </div>
    </div>
  );
}
