import { Link } from 'react-router-dom';
import '../../marketing/marketing.css';

const SIMPLE_EXAMPLES = [
  {
    title: 'Social queue sign-in',
    body: 'Three screens from landing to queue, with AI findings pinned to the map. Try “Apply fix” and the prototype.',
    to: '/demo/journey-review',
    cta: 'Open project',
    tag: 'Flow map + AI review',
  },
  {
    title: 'Branching SaaS onboarding',
    body: 'Welcome → signup → verify → dashboard, with forgot-password and error/retry paths laid out on the map.',
    to: '/demo/saas-onboarding',
    cta: 'Open example',
    tag: 'Branching flow · 7 screens',
  },
  {
    title: 'Studio booking journey',
    body: 'Guest vs account checkout, payment hold, confirmation, and a loop when a time slot is taken.',
    to: '/demo/commerce-booking',
    cta: 'Open example',
    tag: 'Commerce flow · 8 screens',
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
] as const;

const COMPLEX_EXAMPLES = [
  {
    title: 'B2B workspace & approvals',
    body:
      'Multi-role LatticeDesk journey: admin SSO and invites, member profile validation, purchase request, manager approve / request changes / deny with appeal, IT provisioning. Twenty connected screens with alternate recovery paths.',
    to: '/demo/b2b-workspace',
    cta: 'Open complex example',
    tag: 'Complex · 20 screens · B2B',
    screens: 20,
  },
  {
    title: 'Marketplace purchase to return',
    body:
      'Arbor Market end-to-end: cart, address validation, payment decline and shop-credit retry, seller pack and ship, delivery issue, return label, buyer refund, and seller closure. Twenty screens with buyer and seller branches.',
    to: '/demo/marketplace-fulfilment',
    cta: 'Open complex example',
    tag: 'Complex · 21 screens · Marketplace',
    screens: 21,
  },
  {
    title: 'Book, reschedule & cancel care',
    body:
      'MedSchedule patient flow: in-person vs video, insurance verify and manual recovery, slot conflict, forms, reschedule and cancellation policy, waitlist offer, and clinic check-in. Twenty screens — demo patients only.',
    to: '/demo/med-schedule',
    cta: 'Open complex example',
    tag: 'Complex · 21 screens · Healthcare',
    screens: 21,
  },
] as const;

export function ExamplesPage() {
  return (
    <div className="bx-page">
      <header className="bx-page-head">
        <span className="bx-kicker">Examples</span>
        <h1>See Bareframe on a real flow</h1>
        <p className="bx-lead">
          Sample projects you can open without an account. Complex journeys below include branching maps and
          click-through prototypes with validation and recovery paths.
        </p>
      </header>

      <section className="examples-section" aria-labelledby="complex-examples-heading">
        <h2 id="complex-examples-heading" className="examples-section__title">
          Complex journeys
        </h2>
        <p className="examples-section__lead">
          Fifteen to twenty screens each — role switches, alternate paths, and prototype hotspots for main and recovery
          flows. All data is fictional and labeled on every screen.
        </p>
        <ul className="examples examples--complex">
          {COMPLEX_EXAMPLES.map((ex) => (
            <li key={ex.to}>
              <Link to={ex.to} className="example-card example-card--complex">
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
      </section>

      <section className="examples-section" aria-labelledby="more-examples-heading">
        <h2 id="more-examples-heading" className="examples-section__title">
          More examples
        </h2>
        <ul className="examples">
          {SIMPLE_EXAMPLES.map((ex) => (
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
      </section>
    </div>
  );
}
