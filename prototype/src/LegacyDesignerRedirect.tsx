import { useEffect } from 'react';
import { designerSiteUrl } from './sites/urls';

/** Sends bareframe.org/#/designer/* traffic to designer.bareframe.org with the same deep link. */
export function LegacyDesignerRedirect() {
	useEffect(() => {
		const redirect = () => {
			const hash = window.location.hash;
			if (!hash.startsWith('#/designer')) return;
			if (!/(^|\.)bareframe\.org$/i.test(window.location.hostname)) return;
			const suffix = hash.slice('#/designer'.length);
			const path = suffix ? (suffix.startsWith('/') ? suffix : `/${suffix}`) : '/';
			window.location.replace(designerSiteUrl(path));
		};
		redirect();
		window.addEventListener('hashchange', redirect);
		return () => window.removeEventListener('hashchange', redirect);
	}, []);
	return null;
}
