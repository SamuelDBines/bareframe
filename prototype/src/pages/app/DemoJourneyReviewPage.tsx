import { DesignerWorkspace } from '../../designer/DesignerWorkspace';
import { demoReviewProjectId } from '../../designer/demoReviewProject';
import { AppReviewPanel } from './AppReviewPanel';

/** Example project with sample review findings — linked from the homepage and Examples. */
export function DemoJourneyReviewPage() {
  return (
    <DesignerWorkspace
      projectId={demoReviewProjectId}
      demoReview
      review={{ demo: true }}
      aside={<AppReviewPanel />}
    />
  );
}

export function DemoShareCanvasPage() {
  return (
    <div className="app-share-layout">
      <DesignerWorkspace demoReview readOnly review={{ demo: true }} />
      <footer className="app-share-footer">
        Made with <a href="#/">Bareframe</a>
      </footer>
    </div>
  );
}
