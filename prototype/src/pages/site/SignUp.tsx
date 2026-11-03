import { Link } from 'react-router-dom';
import { githubSignInUrl, useAuth } from '../../auth/AuthContext';
import { designerSiteUrl, githubAuthReturnTo } from '../../sites/urls';
import { AppPageHeader, Button, Card } from '../../app/AppUi';
import { Alert } from '@bareframe/react';

export function SignUpPage() {
	const { status, user } = useAuth();

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
			<AppPageHeader title="Create your account" lead="Get started with GitHub — no separate password." />
			<Card variant="elevated" className="app-auth-card">
				{status === 'unavailable' ? (
					<Alert variant="warning" title="Sign-in unavailable">
						The auth API is not reachable. Run the API locally or use{' '}
						<a href="https://bareframe.org/sign-in">bareframe.org</a>.
					</Alert>
				) : (
					<a className="app-hero-cta" href={githubSignInUrl(githubAuthReturnTo('/'))}>
						<Button variant="primary">Continue with GitHub</Button>
					</a>
				)}
				<p className="app-muted-inline">
					Already have an account? <Link to="/sign-in">Sign in</Link>
				</p>
			</Card>
		</div>
	);
}
