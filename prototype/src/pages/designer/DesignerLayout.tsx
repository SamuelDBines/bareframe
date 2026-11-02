import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { designerPath } from '../../sites/urls';

const LINKS = [
  { to: designerPath('/'), end: true, label: 'Home' },
  { to: designerPath('/product/new'), label: 'New product' },
  { to: designerPath('/editor'), label: 'Canvas' },
  { to: designerPath('/themes'), label: 'Themes' },
  { to: designerPath('/settings/agent'), label: 'MCP' },
] as const;

export function DesignerLayout() {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/editor');
  const isReview =
    location.pathname.startsWith('/product/') || location.pathname.startsWith('/demo/');

  if (isEditor || isReview) return <Outlet />;

  return (
    <div className="designer-route-shell">
      <nav className="designer-subnav" aria-label="Designer">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={'end' in link ? link.end : false}>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
