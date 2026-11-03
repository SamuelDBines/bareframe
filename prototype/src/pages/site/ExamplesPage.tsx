import { Link } from 'react-router-dom';
import { Button, Card } from '@bareframe/react';
import { AppPage, AppPageHeader } from '../../app/AppUi';

const EXAMPLES = [
  {
    title: 'Flow map demo',
    body: 'Cards, connectors, minimap, and sample AI callouts — no sign-in required.',
    to: '/demo/flow-map',
  },
  {
    title: 'Journey + review panel',
    body: 'Full canvas with the AI review sidebar pinned beside the map.',
    to: '/demo/journey-review',
  },
  {
    title: 'Shared review canvas',
    body: 'Read-only share link with callouts and a “Reviewed with Bareframe” footer.',
    to: '/demo/share-canvas',
  },
];

export function ExamplesPage() {
  return (
    <AppPage>
      <AppPageHeader
        title="Examples"
        lead="Explore journey maps and AI review callouts before you connect your own product."
      />
      <div className="app-example-grid">
        {EXAMPLES.map((ex) => (
          <Card key={ex.to} variant="outlined" title={ex.title} className="app-start-card">
            <p>{ex.body}</p>
            <Link to={ex.to} className="app-hero-cta">
              <Button variant="secondary">Open example</Button>
            </Link>
          </Card>
        ))}
      </div>
    </AppPage>
  );
}
