import { githubAuthReturnTo } from '../sites/urls';

export function githubSignInUrl(returnTo?: string): string {
	const target =
		returnTo ??
		githubAuthReturnTo(
			typeof window !== 'undefined'
				? window.location.hash.replace(/^#/, '') || '/'
				: '/',
		);
	const q = new URLSearchParams({ returnTo: target });
	return `/api/auth/github?${q}`;
}
