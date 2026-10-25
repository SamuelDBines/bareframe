import { NavLink, useLocation } from 'react-router-dom';

export function ProductSwitcher() {
	const { pathname } = useLocation();

	const siteActive =
		pathname === '/' ||
		pathname.startsWith('/pricing') ||
		pathname.startsWith('/sign-in') ||
		pathname.startsWith('/sign-up');

	return (
		<nav className="product-switcher" aria-label="Bareframe products">
			<NavLink to="/" className={siteActive ? 'active' : ''}>
				Site
			</NavLink>
			<NavLink
				to="/components"
				className={pathname.startsWith('/components') ? 'active' : ''}
			>
				Components
			</NavLink>
			<NavLink
				to="/designer"
				className={pathname.startsWith('/designer') ? 'active' : ''}
			>
				Designer
			</NavLink>
		</nav>
	);
}
