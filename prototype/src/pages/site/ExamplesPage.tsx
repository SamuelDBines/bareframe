import { Link } from 'react-router-dom';

const EXAMPLES = [
  {
    title: 'Barber booking journey',
    body: 'Package-generated flows with sign-in, queue, and booking screens — ready for an AI review pass.',
    to: '/demo/journey-review',
  },
  {
    title: 'Flow map from URLs',
    body: 'See how screens and connectors compose a multi-step journey on the canvas.',
    to: '/demo/flow-map',
  },
  {
    title: 'Shared review canvas',
    body: 'Read-only share link with callouts and a “Reviewed with Bareframe” footer.',
    to: '/demo/share-canvas',
  },
];

export function ExamplesPage() {
  return (
    <>
      <div className="page-hero">
        <h1>Examples</h1>
        <p className="lead">
          Explore journey maps and AI review callouts without connecting your own product yet.
        </p>
      </div>
      <div className="grid-3">
        {EXAMPLES.map((ex) => (
          <article key={ex.to} className="card app-start-card">
            <h3>{ex.title}</h3>
            <p>{ex.body}</p>
            <Link to={ex.to} className="btn btn-secondary">
              Open example
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
