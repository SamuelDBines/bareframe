import { Link } from 'react-router-dom';
import '../../marketing/marketing.css';

const EXAMPLES = [
  {
    title: 'Social queue sign-in',
    body: 'Three screens from landing to queue, with AI findings pinned to the map. Try “Apply fix” and the prototype.',
    to: '/demo/journey-review',
    cta: 'Open project',
    tag: 'Flow map + AI review',
  },
  {
    title: 'Interactive sign-up flow',
    body: 'A six-screen sign-up and upgrade journey. Click a flag to see the finding, then add the missing screen.',
    to: '/demo/flow-map',
    cta: 'Open demo',
    tag: 'Live demo',
  },
  {
    title: 'Shared prototype link',
    body: 'What a stakeholder sees when you send a share link: the read-only map and click-through prototype.',
    to: '/demo/share-canvas',
    cta: 'Open share view',
    tag: 'Share link',
  },
];

export function ExamplesPage() {
  return (
    <div className="bx-page">
      <header className="bx-page-head">
        <span className="bx-kicker">Examples</span>
        <h1>See Bareframe on a real flow</h1>
        <p className="bx-lead">Sample projects you can click through without an account.</p>
      </header>
      <ul className="examples">
        {EXAMPLES.map((ex) => (
          <li key={ex.to}>
            <Link to={ex.to} className="example-card">
              <span className="example-card__art" aria-hidden>
                <i />
                <span />
                <i className="is-flag" />
                <span />
                <i />
              </span>
              <span className="bx-chip">{ex.tag}</span>
              <h2>{ex.title}</h2>
              <p>{ex.body}</p>
              <span className="example-card__cta">{ex.cta} →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
