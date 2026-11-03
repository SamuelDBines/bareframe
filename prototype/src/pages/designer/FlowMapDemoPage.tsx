import { Link } from 'react-router-dom';
import { DesignerWorkspace } from '../../designer/DesignerWorkspace';
import { AppReviewPanel } from '../app/AppReviewPanel';
import { demoReviewProjectId } from '../../designer/demoReviewProject';
import { Button } from '@bareframe/react';

/** Public demo: real flow-map canvas (cards, connectors, minimap) + sample review callouts. */
export function FlowMapDemoPage() {
  return (
    <div className="app-project-layout app-project-layout--demo">
      <div className="app-demo-banner">
        <p>
          <strong>Live demo</strong> — Hookoh-style journey with connectors and AI review callouts. No sign-in required.
        </p>
        <Link to="/app">
          <Button variant="secondary" size="sm">
            Open app hub
          </Button>
        </Link>
      </div>
      <div className="app-project-layout__body">
        <div className="app-project-canvas">
          <DesignerWorkspace projectId={demoReviewProjectId} demoReview />
        </div>
        <AppReviewPanel projectId={demoReviewProjectId} demoIssues />
      </div>
    </div>
  );
}
