import { Link } from 'react-router-dom';
import { githubSignInUrl, useAuth } from '../../auth/AuthContext';

export function SignInPage() {
	const { status, user } = useAuth();
	const returnTo = '/#/designer';

	if (user) {
		return (
			<div style={{ maxWidth: 440, margin: '0 auto', textAlign: 'center' }}>
				<p className="lead">Signed in as <strong>{user.login}</strong>.</p>
				<Link to="/designer" className="btn btn-primary">Open Designer</Link>
			</div>
		);
	}

	return (
		<div style={{ maxWidth: 440, margin: '0 auto' }}>
			<div className="page-hero" style={{ textAlign: 'center' }}>
				<h1>Welcome back</h1>
				<p>Sign in with your GitHub account to open your Designer workspace.</p>
			</div>
			<div className="card form-stack" style={{ alignItems: 'stretch' }}>
				{status === 'unavailable' ? (
					<p className="auth-muted" role="status">
						Sign-in API is not reachable (local dev without the API). Start the API or use the
						production site.
					</p>
				) : (
					<a className="btn btn-primary" href={githubSignInUrl(returnTo)}>
						Sign in with GitHub
					</a>
				)}
				<p style={{ margin: 0, fontSize: '0.875rem' }}>
					New here? <Link to="/sign-up">Create an account</Link>
				</p>
			</div>
		</div>
	);
}
