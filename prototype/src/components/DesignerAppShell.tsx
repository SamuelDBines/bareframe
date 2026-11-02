import { Link, Outlet, useLocation } from 'react-router-dom';
import { DOCS_SITE_URL, designerPath } from '../sites/urls';
import { ThemeSwitcher } from './ThemeSwitcher';
import { UserMenu } from './UserMenu';

function breadcrumb(pathname: string): string | null {
  if (pathname === '/' || pathname === '') return 'Projects';
  if (pathname.startsWith('/product/new')) return 'New product';
  if (pathname.startsWith('/product/')) return 'Package review';
  if (pathname.startsWith('/editor')) return 'Prototype canvas';
  if (pathname.startsWith('/themes')) return 'Themes';
  if (pathname.startsWith('/settings/agent')) return 'Agent MCP';
  return null;
}

export function DesignerAppShell() {
  const location = useLocation();
  const wide =
    location.pathname.startsWith('/editor') ||
    location.pathname.startsWith('/themes') ||
    location.pathname.startsWith('/theme') ||
    location.pathname.startsWith('/tokens');
  const crumb = breadcrumb(location.pathname);

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to={designerPath('/')} className="brand">
          <span className="brand-mark" aria-hidden />
          <span>
            bareframe <span style={{ fontWeight: 500, color: 'var(--ds-text-muted, #64748b)' }}>Designer</span>
          </span>
        </Link>
        {crumb && !wide ? (
          <span className="ds-header-crumb" aria-current="page">
            / {crumb}
          </span>
        ) : null}
        <nav className="product-switcher" aria-label="Bareframe products">
          <a href={`${DOCS_SITE_URL}/`}>Docs</a>
          <a href={`${DOCS_SITE_URL}/#/components`}>Components</a>
          <Link to={designerPath('/')} className="active">
            Designer
          </Link>
        </nav>
        <div className="header-spacer" />
        <UserMenu designerApp />
        {!wide && <ThemeSwitcher />}
      </header>
      <main className={`app-main${wide ? ' wide' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
