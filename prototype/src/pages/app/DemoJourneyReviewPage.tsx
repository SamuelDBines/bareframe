import { DesignerWorkspace } from '../../designer/DesignerWorkspace';
import { demoReviewProjectId } from '../../designer/demoReviewProject';
import { ExampleShell } from '../designer/DemoFlowMapExamplePage';
import { AppReviewPanel } from './AppReviewPanel';

/** Example project with sample review findings, linked from the homepage and Examples. */
export function DemoJourneyReviewPage() {
  return (
    <ExampleShell
      kicker="Example flow map + AI review"
      title="Social queue sign-in"
      lead="Three screens from landing to queue, with AI findings pinned to the map. Try “Apply fix”, then open the prototype."
    >
      <DesignerWorkspace
        projectId={demoReviewProjectId}
        demoReview
        embedded
        review={{ demo: true }}
        aside={<AppReviewPanel />}
      />
    </ExampleShell>
  );
}

export function DemoShareCanvasPage() {
  return (
    <ExampleShell
      kicker="Example share link"
      title="Shared prototype link"
      lead="What a stakeholder sees when you send a share link: the read-only map and the click-through prototype."
    >
      <div className="app-share-layout">
        <DesignerWorkspace demoReview readOnly embedded review={{ demo: true }} />
        <footer className="app-share-footer">
          Made with <a href="#/">Bareframe</a>
        </footer>
      </div>
    </ExampleShell>
  );
}
