import { useEffect } from 'react';

/** Sends legacy Designer host and hash paths to the unified /app product. */
export function LegacyDesignerRedirect() {
	useEffect(() => {
		const redirect = () => {
			const host = window.location.hostname;
			const hash = window.location.hash;

			if (/(^|\.)designer\.bareframe\.org$/i.test(host)) {
				const suffix = hash.startsWith('#/') ? hash.slice(2) : '';
				const mapped = suffix.startsWith('app') ? suffix : suffix ? `app/${suffix}` : 'app';
				window.location.replace(`https://bareframe.org/#/${mapped.replace(/^\/+/, '')}`);
				return;
			}

			if (!/(^|\.)bareframe\.org$/i.test(host)) return;

			if (hash.startsWith('#/designer')) {
				const rest = hash.slice('#/designer'.length);
				const target = rest && rest !== '/' ? `/app${rest.startsWith('/') ? rest : `/${rest}`}` : '/app';
				window.location.replace(`${window.location.origin}/#${target}`);
			}
		};
		redirect();
		window.addEventListener('hashchange', redirect);
		return () => window.removeEventListener('hashchange', redirect);
	}, []);
	return null;
}
