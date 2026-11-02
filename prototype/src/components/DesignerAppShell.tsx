import { Link, Outlet, useLocation } from 'react-router-dom';
import { DOCS_SITE_URL } from '../sites/urls';
import { ThemeSwitcher } from './ThemeSwitcher';
import { UserMenu } from './UserMenu';

export function DesignerAppShell() {
	const location = useLocation();
	const wide =
		location.pathname.startsWith('/editor') ||
		location.pathname.startsWith('/themes') ||
		location.pathname.startsWith('/theme') ||
		location.pathname.startsWith('/tokens');

	return (
		<div className="app-shell">
			<header className="app-header">
				<Link to="/" className="brand">
					<span className="brand-mark" aria-hidden />
					Bareframe Designer
				</Link>
				<nav className="product-switcher" aria-label="Bareframe products">
					<a href={`${DOCS_SITE_URL}/`}>Design system</a>
					<a href={`${DOCS_SITE_URL}/#/components`}>Components</a>
					<Link to="/" className="active">
						Designer
					</Link>
				</nav>
				<div className="header-spacer" />
				<UserMenu designerApp />
				<ThemeSwitcher />
			</header>
			<main className={`app-main${wide ? ' wide' : ''}`}>
				<Outlet />
			</main>
		</div>
	);
}
