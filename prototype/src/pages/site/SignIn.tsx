import { Link } from 'react-router-dom';
import { githubSignInUrl, useAuth } from '../../auth/AuthContext';
import { designerSiteUrl, githubAuthReturnTo } from '../../sites/urls';
import { AppPageHeader, Button, Card } from '../../app/AppUi';
import { Alert } from '@bareframe/react';

export function SignInPage() {
	const { status, user } = useAuth();
	const returnTo = githubAuthReturnTo('/');

	if (user) {
		return (
			<div className="app-auth-page">
				<AppPageHeader title="You are signed in" lead={`Signed in as ${user.login}.`} />
				<a href={designerSiteUrl('/')} className="app-hero-cta">
					<Button variant="primary">Open app</Button>
				</a>
			</div>
		);
	}

	return (
		<div className="app-auth-page">
			<AppPageHeader
				title="Welcome back"
				lead="Sign in with GitHub to save journey projects and run AI review passes."
			/>
			<Card variant="elevated" className="app-auth-card">
				{status === 'unavailable' ? (
					<Alert variant="warning" title="Sign-in unavailable">
						The auth API is not reachable in this environment. Use production at bareframe.org or start the API
						locally.
					</Alert>
				) : (
					<a className="app-hero-cta" href={githubSignInUrl(returnTo)}>
						<Button variant="primary">Sign in with GitHub</Button>
					</a>
				)}
				<p className="app-muted-inline">
					New here? <Link to="/sign-up">Create an account</Link>
				</p>
			</Card>
		</div>
	);
}
