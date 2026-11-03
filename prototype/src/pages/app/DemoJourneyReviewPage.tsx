import { DesignerWorkspace } from '../../designer/DesignerWorkspace';
import { AppReviewPanel } from './AppReviewPanel';
import { demoReviewProjectId } from '../../designer/demoReviewProject';

/** Static demo canvas with review callouts for marketing screenshots. */
export function DemoJourneyReviewPage() {
  return (
    <div className="app-project-layout">
      <div className="app-project-canvas">
        <DesignerWorkspace projectId={demoReviewProjectId} demoReview />
      </div>
      <AppReviewPanel projectId={demoReviewProjectId} demoIssues />
    </div>
  );
}

export function DemoShareCanvasPage() {
  return (
    <div className="app-share-layout">
      <DesignerWorkspace demoReview readOnly />
      <footer className="app-share-footer">Reviewed with Bareframe</footer>
    </div>
  );
}
