import { Link, Outlet, useLocation } from 'react-router-dom';
import { ProductSwitcher } from './ProductSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { UserMenu } from './UserMenu';

export function AppShell() {
	const location = useLocation();
	const wide =
		location.pathname.startsWith('/editor') ||
		location.pathname.startsWith('/themes') ||
		location.pathname.startsWith('/theme') ||
		location.pathname.startsWith('/tokens') ||
		location.pathname.startsWith('/app/project') ||
		location.pathname.startsWith('/share') ||
		location.pathname.startsWith('/demo/journey-review') ||
		location.pathname.startsWith('/demo/share-canvas');

	const fullBleed =
		location.pathname.startsWith('/app/project') ||
		location.pathname.startsWith('/share') ||
		location.pathname.startsWith('/demo/journey-review') ||
		location.pathname.startsWith('/demo/share-canvas');

	const docs = location.pathname.startsWith('/components');

	return (
		<div className="app-shell">
			<header className="app-header">
				<Link to="/" className="brand">
					<span className="brand-mark" aria-hidden />
					Bareframe
				</Link>
				<ProductSwitcher />
				<div className="header-spacer" />
				<UserMenu />
				<ThemeSwitcher />
			</header>
			<main
				className={`app-main${wide ? ' wide' : ''}${fullBleed ? ' app-full-bleed' : ''}${docs ? ' docs-main' : ''}`}
			>
				<Outlet />
			</main>
		</div>
	);
}
