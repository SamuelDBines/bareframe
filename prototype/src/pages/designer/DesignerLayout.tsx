import { NavLink, Outlet } from 'react-router-dom';

export function DesignerLayout() {
	return (
		<>
			<nav className="subnav" aria-label="Designer section">
				<NavLink to="/designer" end>Projects</NavLink>
				<NavLink to="/designer/editor">Editor</NavLink>
				<NavLink to="/designer/theme">Theme editor</NavLink>
				<NavLink to="/designer/tokens">Token editor</NavLink>
				<NavLink to="/designer/export">Export</NavLink>
				<NavLink to="/designer/settings/agent">Agent MCP</NavLink>
			</nav>
			<Outlet />
		</>
	);
}
