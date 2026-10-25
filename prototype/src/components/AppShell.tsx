import { Link, Outlet, useLocation } from 'react-router-dom';
import { ProductSwitcher } from './ProductSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

export function AppShell() {
	const location = useLocation();
	const wide =
		location.pathname.startsWith('/designer/editor') ||
		location.pathname.startsWith('/designer/theme') ||
		location.pathname.startsWith('/designer/tokens');

	return (
		<div className="app-shell">
			<header className="app-header">
				<Link to="/" className="brand">
					<span className="brand-mark" aria-hidden />
					Bareframe
				</Link>
				<ProductSwitcher />
				<div className="header-spacer" />
				<ThemeSwitcher />
			</header>
			<main className={`app-main${wide ? ' wide' : ''}`}>
				<Outlet />
			</main>
		</div>
	);
}
