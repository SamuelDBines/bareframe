import { NavLink, Outlet } from 'react-router-dom';

export function DesignerLayout() {
	return (
		<div className="designer-route-shell">
			<nav className="subnav designer-subnav" aria-label="Designer section">
				<NavLink to="/designer" end>Projects</NavLink>
				<NavLink to="/designer/editor">Canvas</NavLink>
				<NavLink to="/designer/themes">Themes</NavLink>
				<NavLink to="/designer/export">Export</NavLink>
				<NavLink to="/designer/settings/agent">Agent MCP</NavLink>
			</nav>
			<Outlet />
		</div>
	);
}
