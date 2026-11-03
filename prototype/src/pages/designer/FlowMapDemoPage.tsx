import { Link } from 'react-router-dom';
import { DsCard, DsHero, DsPage } from '../../designer/DesignerUiPrimitives';
import { designerPath } from '../../sites/urls';

const NODES = [
  { id: 'home', label: 'Landing', url: '/', status: 'ok' as const },
  { id: 'signup', label: 'Sign up', url: '/signup', status: 'ok' as const },
  { id: 'book', label: 'Book appointment', url: '/book', status: 'warn' as const },
  { id: 'confirm', label: 'Confirmation', url: '/confirm', status: 'ok' as const },
];

const EDGES = [
  ['home', 'signup'],
  ['signup', 'book'],
  ['book', 'confirm'],
] as const;

export function FlowMapDemoPage() {
  return (
    <DsPage>
      <DsHero
        eyebrow="Flow map"
        title="Recorded journey map"
        lead="Screens and links captured from a live site or extension upload — audit findings surface on each node."
        actions={
          <Link to={designerPath('/editor')} className="btn btn-secondary">
            Back to canvas
          </Link>
        }
      />

      <div className="ds-split">
        <DsCard className="ds-flow-map-canvas">
          <div className="ds-flow-map-graph" aria-label="Flow map preview">
            {NODES.map((node, index) => (
              <div
                key={node.id}
                className={`ds-flow-node ds-flow-node--${node.status}`}
                style={{ gridColumn: index + 1, gridRow: 1 }}
              >
                <span className="ds-flow-node__title">{node.label}</span>
                <span className="ds-flow-node__url">{node.url}</span>
              </div>
            ))}
            {EDGES.map(([from, to]) => {
              const fromIdx = NODES.findIndex((n) => n.id === from);
              const toIdx = NODES.findIndex((n) => n.id === to);
              return (
                <span
                  key={`${from}-${to}`}
                  className="ds-flow-edge"
                  style={{ gridColumn: `${fromIdx + 1} / ${toIdx + 2}`, gridRow: 1 }}
                  aria-hidden
                />
              );
            })}
          </div>
        </DsCard>

        <DsCard>
          <h3>Audit findings</h3>
          <ul className="ds-flow-findings">
            <li>
              <span className="ds-badge ds-badge--warn">warning</span>
              <span>Missing focus ring on primary CTA at <code>/book</code></span>
            </li>
            <li>
              <span className="ds-badge ds-badge--ok">pass</span>
              <span>All screens reachable within 3 hops from landing</span>
            </li>
          </ul>
          <p className="ds-meta" style={{ marginTop: '1rem' }}>
            Install the Chrome extension and upload a recording to replace this demo with live data.
          </p>
        </DsCard>
      </div>
    </DsPage>
  );
}
