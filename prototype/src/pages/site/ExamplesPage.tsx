import { Link } from 'react-router-dom';
import '../../marketing/marketing.css';

const EXAMPLES = [
  {
    title: 'Social queue sign-in',
    body: 'Three screens from landing to queue, with AI findings pinned to the map. Try “Apply fix” and the prototype.',
    to: '/demo/journey-review',
    cta: 'Open example',
    tag: 'Flow map + AI review',
  },
  {
    title: 'LatticeDesk workspace & approvals',
    body:
      'Admin SSO, teammate invites, purchase requests, manager approve or deny with appeal, and IT provisioning — multi-role paths with validation and recovery (sample Acme Robotics data).',
    to: '/demo/b2b-workspace',
    cta: 'Open example',
    tag: 'B2B workflow',
  },
  {
    title: 'Arbor Market purchase to return',
    body:
      'Cart through payment decline and shop credit, seller pack and ship, delivery issues, return label, refund, and seller closure — buyer and seller branches on one map.',
    to: '/demo/marketplace-fulfilment',
    cta: 'Open example',
    tag: 'Marketplace',
  },
  {
    title: 'MedSchedule appointments',
    body:
      'In-person vs video booking, insurance verification and manual recovery, slot conflicts, reschedule and cancellation policy, waitlist offers, and clinic check-in.',
    to: '/demo/med-schedule',
    cta: 'Open example',
    tag: 'Healthcare scheduling',
  },
  {
    title: 'Northstar SaaS onboarding',
    body: 'Welcome through dashboard with forgot-password and sign-up error branches laid out on the map.',
    to: '/demo/saas-onboarding',
    cta: 'Open example',
    tag: 'SaaS onboarding',
  },
  {
    title: 'ReserveKit studio booking',
    body: 'Guest vs account checkout, payment hold, confirmation, and a loop when a time slot is taken.',
    to: '/demo/commerce-booking',
    cta: 'Open example',
    tag: 'Booking flow',
  },
  {
    title: 'Interactive sign-up flow',
    body: 'A six-screen sign-up and upgrade journey. Click a flag to see the finding, then add the missing screen.',
    to: '/demo/flow-map',
    cta: 'Open example',
    tag: 'Live demo',
  },
  {
    title: 'Shared prototype link',
    body: 'What a stakeholder sees when you send a share link: the read-only map and click-through prototype.',
    to: '/demo/share-canvas',
    cta: 'Open example',
    tag: 'Share link',
  },
] as const;

export function ExamplesPage() {
  return (
    <div className="bx-page">
      <header className="bx-page-head">
        <span className="bx-kicker">Examples</span>
        <h1>See Bareframe on a real flow</h1>
        <p className="bx-lead">
          Sample projects you can open without an account — from quick reviews to multi-branch journeys with
          click-through prototypes. Fictional data only.
        </p>
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
