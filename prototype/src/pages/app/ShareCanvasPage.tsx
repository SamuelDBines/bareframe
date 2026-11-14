import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { ProjectDocument } from '@bareframe/designer-core';
import { fetchPublicShare } from '../../app/reviewApi';
import { friendlyError } from '../../app/apiError';
import { DesignerWorkspace } from '../../designer/DesignerWorkspace';

export function ShareCanvasPage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const play = searchParams.get('play') === '1';
  const startFrameId = searchParams.get('start') ?? undefined;
  const [document, setDocument] = useState<ProjectDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchPublicShare(token)
      .then((data) => setDocument(data.document as ProjectDocument))
      .catch((e) => setError(friendlyError(e, 'This share link isn’t available.')));
  }, [token]);

  if (error) {
    return (
      <div className="bx-page bx-page--narrow">
        <section className="app-empty" data-testid="share-unavailable">
          <div className="empty-art" aria-hidden>
            <i className="empty-art__card" />
            <span className="empty-art__line" />
            <i className="empty-art__card empty-art__card--ghost" />
          </div>
          <h1>This link isn’t available</h1>
          <p>It may have expired or been turned off by its owner. Ask them for a fresh link.</p>
          <div className="app-empty__actions">
            <Link to="/" className="btn btn-primary">
              What is Bareframe?
            </Link>
            <Link to="/demo/journey-review" className="btn btn-secondary">
              See an example
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="share-loading" role="status" aria-live="polite">
        <span className="review-running__bar" />
        Opening shared flow…
      </div>
    );
  }

  return (
    <div className="app-share-layout" data-testid={play ? 'share-play-layout' : 'share-map-layout'}>
      <DesignerWorkspace
        readOnly
        compactChrome
        initialDocument={document}
        openPrototypeOnMount={play}
        prototypeStartFrameId={startFrameId}
      />
      {!play ? (
        <footer className="app-share-footer">
          Made with <Link to="/">Bareframe</Link>
        </footer>
      ) : null}
    </div>
  );
}
