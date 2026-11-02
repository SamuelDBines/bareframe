import { NavLink, Outlet } from 'react-router-dom';
import { designerPath } from '../../sites/urls';

export function DesignerLayout() {
	return (
		<div className="designer-route-shell">
			<nav className="subnav designer-subnav" aria-label="Designer section">
				<NavLink to={designerPath('/')} end>Projects</NavLink>
				<NavLink to={designerPath('/product/new')}>New product</NavLink>
				<NavLink to={designerPath('/editor')}>Canvas</NavLink>
				<NavLink to={designerPath('/themes')}>Themes</NavLink>
				<NavLink to={designerPath('/export')}>Export</NavLink>
				<NavLink to={designerPath('/settings/agent')}>Agent MCP</NavLink>
			</nav>
			<Outlet />
		</div>
	);
}
