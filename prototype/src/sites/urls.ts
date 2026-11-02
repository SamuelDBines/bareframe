/** Docs site origin (design system, @bareframe/react, /api, /mcp). */
export const DOCS_SITE_URL =
	(import.meta.env.VITE_DOCS_SITE_URL as string | undefined)?.replace(/\/$/, '') ??
	'https://bareframe.org';

/** Designer product home (canvas, projects, themes). */
export const DESIGNER_SITE_URL =
	(import.meta.env.VITE_DESIGNER_SITE_URL as string | undefined)?.replace(/\/$/, '') ??
	'https://designer.bareframe.org';

/** Set at build time for the designer.bareframe.org bundle. */
export const IS_DESIGNER_APP = import.meta.env.VITE_BAREFRAME_APP === 'designer';

/** Hash-router path under Designer (no leading `#`). */
export function designerPath(subpath = ''): string {
	if (IS_DESIGNER_APP) {
		if (!subpath || subpath === '/') return '/';
		return subpath.startsWith('/') ? subpath : `/${subpath}`;
	}
	const base = '/designer';
	if (!subpath || subpath === '/') return base;
	const tail = subpath.startsWith('/') ? subpath : `/${subpath}`;
	return `${base}${tail}`;
}

/** Absolute URL for deep links to Designer (used from the docs site). */
export function designerSiteUrl(subpath = ''): string {
	let hashPath: string;
	if (IS_DESIGNER_APP) {
		hashPath = designerPath(subpath);
	} else {
		if (!subpath || subpath === '/') {
			hashPath = '/';
		} else {
			hashPath = subpath.startsWith('/') ? subpath : `/${subpath}`;
		}
	}
	return `${DESIGNER_SITE_URL}/#${hashPath}`;
}

/** OAuth returnTo target after GitHub sign-in. */
export function githubAuthReturnTo(hashPath = '/'): string {
	const normalized = hashPath.startsWith('/') ? hashPath : `/${hashPath}`;
	if (IS_DESIGNER_APP) {
		return `${DESIGNER_SITE_URL}/#${normalized}`;
	}
	if (normalized.startsWith('/designer')) {
		return `/#${normalized}`;
	}
	return `/#/designer${normalized === '/' ? '' : normalized}`;
}
