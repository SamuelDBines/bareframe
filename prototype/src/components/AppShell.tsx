import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BrandMark } from './BrandMark';
import { SiteFooter } from './SiteFooter';
import { ThemeSwitcher } from './ThemeSwitcher';
import { UserMenu } from './UserMenu';

const MARKETING_NAV = [
	{ to: '/', label: 'Product', end: true },
	{ to: '/examples', label: 'Examples' },
	{ to: '/pricing', label: 'Pricing' },
	{ to: '/components', label: 'Components' },
];

function routeKind(pathname: string) {
	if (pathname.startsWith('/components')) return 'docs' as const;
	if (pathname.startsWith('/app') || pathname.startsWith('/share') || pathname.startsWith('/demo/')) {
		return 'app' as const;
	}
	return 'site' as const;
}

export function AppShell() {
	const { pathname } = useLocation();
	const kind = routeKind(pathname);
	const [scrolled, setScrolled] = useState(false);

	const fullBleed =
		(pathname.startsWith('/app/project') && !pathname.includes('/website-setup')) ||
		pathname.startsWith('/share') ||
		pathname.startsWith('/demo/journey-review') ||
		pathname.startsWith('/demo/share-canvas');

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	useEffect(() => {
		if (!fullBleed) window.scrollTo(0, 0);
	}, [pathname, fullBleed]);

	return (
		<div className={`app-shell app-shell--${kind}`}>
			<a
				href="#main"
				className="bx-skip-link"
				onClick={(e) => {
					e.preventDefault();
					document.getElementById('main')?.focus();
				}}
			>
				Skip to content
			</a>
			<header
				className={`app-header${kind !== 'site' ? ' app-header--app' : ''}${scrolled ? ' is-scrolled' : ''}`}
			>
				<Link to="/" className="brand" aria-label="Bareframe home">
					<BrandMark />
					Bareframe
				</Link>
				{kind === 'app' ? (
					<nav className="bx-nav" aria-label="App">
						<NavLink to="/app" end>
							Projects
						</NavLink>
						<NavLink to="/examples">Examples</NavLink>
						<NavLink to="/pricing">Pricing</NavLink>
					</nav>
				) : (
					<nav className="bx-nav" aria-label="Main">
						{MARKETING_NAV.map((item) => (
							<NavLink key={item.to} to={item.to} end={item.end}>
								{item.label}
							</NavLink>
						))}
					</nav>
				)}
				<div className="header-spacer" />
				<div className="bx-header-actions">
					{kind === 'docs' ? <ThemeSwitcher /> : null}
					<UserMenu inApp={kind === 'app'} />
				</div>
			</header>
			<main
				id="main"
				tabIndex={-1}
				className={`app-main app-main--${kind}${fullBleed ? ' wide app-full-bleed' : ''}${
					kind === 'docs' ? ' docs-main' : ''
				}`}
			>
				<Outlet />
			</main>
			{kind === 'site' ? <SiteFooter /> : null}
		</div>
	);
}
