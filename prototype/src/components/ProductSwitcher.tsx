import { NavLink, useLocation } from 'react-router-dom';

export function ProductSwitcher() {
	const { pathname } = useLocation();

	const siteActive =
		pathname === '/' ||
		pathname.startsWith('/pricing') ||
		pathname.startsWith('/examples') ||
		pathname.startsWith('/sign-in') ||
		pathname.startsWith('/sign-up');

	return (
		<nav className="product-switcher" aria-label="Bareframe products">
			<NavLink to="/" className={siteActive ? 'active' : ''}>
				Product
			</NavLink>
			<NavLink to="/app" className={pathname.startsWith('/app') ? 'active' : ''}>
				App
			</NavLink>
			<NavLink
				to="/components"
				className={pathname.startsWith('/components') ? 'active' : ''}
			>
				Components
			</NavLink>
		</nav>
	);
}
