import { Link } from 'react-router-dom';
import { BrandMark } from './BrandMark';

export function SiteFooter() {
	return (
		<footer className="bx-footer">
			<div className="bx-container bx-footer__inner">
				<Link to="/" className="brand" aria-label="Bareframe home">
					<BrandMark />
					Bareframe
				</Link>
				<nav aria-label="Footer">
					<Link to="/app">Open app</Link>
					<Link to="/examples">Examples</Link>
					<Link to="/pricing">Pricing</Link>
					<Link to="/components">Components</Link>
					<Link to="/components/mcp">MCP for agents</Link>
				</nav>
				<small>© {new Date().getFullYear()} Bareframe</small>
			</div>
		</footer>
	);
}
