import { Link } from 'react-router-dom';
import { githubSignInUrl, useAuth } from '../../auth/AuthContext';

export function SignUpPage() {
	const { status, user } = useAuth();

	if (user) {
		return (
			<div style={{ maxWidth: 440, margin: '0 auto', textAlign: 'center' }}>
				<p className="lead">You are signed in as <strong>{user.login}</strong>.</p>
				<Link to="/designer" className="btn btn-primary">Open Designer</Link>
			</div>
		);
	}

	return (
		<div style={{ maxWidth: 440, margin: '0 auto' }}>
			<div className="page-hero" style={{ textAlign: 'center' }}>
				<h1>Create your account</h1>
				<p>Get started with GitHub — no separate password.</p>
			</div>
			<div className="card form-stack" style={{ alignItems: 'stretch' }}>
				{status === 'unavailable' ? (
					<p className="auth-muted" role="status">
						Sign-in API is not reachable. Run the API locally or use{' '}
						<a href="https://bareframe.org/sign-in">bareframe.org</a>.
					</p>
				) : (
					<a className="btn btn-primary" href={githubSignInUrl('/#/designer')}>
						Continue with GitHub
					</a>
				)}
				<p style={{ margin: 0, fontSize: '0.875rem' }}>
					Already have an account? <Link to="/sign-in">Sign in</Link>
				</p>
			</div>
		</div>
	);
}
