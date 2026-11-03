import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ProjectDocument } from '@bareframe/designer-core';
import { fetchPublicShare } from '../../app/reviewApi';
import { DesignerWorkspace } from '../../designer/DesignerWorkspace';

export function ShareCanvasPage() {
  const { token } = useParams<{ token: string }>();
  const [document, setDocument] = useState<ProjectDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchPublicShare(token)
      .then((data) => setDocument(data.document as ProjectDocument))
      .catch((e) => setError(e instanceof Error ? e.message : 'Not found'));
  }, [token]);

  if (error) {
    return (
      <div className="app-shell-inner app-card">
        <p>{error}</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="app-shell-inner app-card">
        <p>Loading shared canvas…</p>
      </div>
    );
  }

  return (
    <div className="app-share-layout">
      <DesignerWorkspace readOnly initialDocument={document} />
      <footer className="app-share-footer">Reviewed with Bareframe</footer>
    </div>
  );
}
