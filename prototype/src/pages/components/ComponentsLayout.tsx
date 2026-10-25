import { NavLink, Outlet } from 'react-router-dom';

export function ComponentsLayout() {
	return (
		<>
			<nav className="subnav" aria-label="Components section">
				<NavLink to="/components" end>Gallery</NavLink>
				<NavLink to="/components/tokens">Tokens</NavLink>
				<NavLink to="/components/mcp">Connect agent</NavLink>
			</nav>
			<Outlet />
		</>
	);
}
