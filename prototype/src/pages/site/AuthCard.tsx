import { Link } from 'react-router-dom';
import { githubSignInUrl, useAuth } from '../../auth/AuthContext';
import { BrandMark } from '../../components/BrandMark';
import { githubAuthReturnTo } from '../../sites/urls';

function GitHubMark() {
	return (
		<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden fill="currentColor">
			<path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.22 1.88.87 2.34.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
		</svg>
	);
}

export function AuthCard({ mode }: { mode: 'sign-in' | 'sign-up' }) {
	const { status, user } = useAuth();
	const signUp = mode === 'sign-up';

	return (
		<div className="bx-page auth-page">
			<section className="auth-card bx-reveal">
				<BrandMark />
				{user ? (
					<>
						<h1>You’re signed in</h1>
						<p>
							Signed in as <strong>{user.login}</strong>.
						</p>
						<Link to="/app" className="btn btn-primary btn-lg auth-card__cta">
							Open your projects
						</Link>
					</>
				) : (
					<>
						<h1>{signUp ? 'Create your account' : 'Welcome back'}</h1>
						<p>
							{signUp
								? 'Start mapping and reviewing flows for free. No separate password — use GitHub.'
								: 'Sign in to open your projects.'}
						</p>
						{status === 'unavailable' ? (
							<>
								<button type="button" className="btn btn-dark btn-lg auth-card__cta" disabled>
									<GitHubMark /> Continue with GitHub
								</button>
								<p className="bx-hint" role="status">
									Sign-in is unavailable right now. Please try again in a few minutes.
								</p>
							</>
						) : (
							<a className="btn btn-dark btn-lg auth-card__cta" href={githubSignInUrl(githubAuthReturnTo('/app'))}>
								<GitHubMark /> Continue with GitHub
							</a>
						)}
						<p className="auth-card__switch">
							{signUp ? (
								<>
									Already have an account? <Link to="/sign-in">Sign in</Link>
								</>
							) : (
								<>
									New to Bareframe? <Link to="/sign-up">Create an account</Link>
								</>
							)}
						</p>
					</>
				)}
			</section>
			<p className="auth-page__aside">
				Just looking? <Link to="/demo/journey-review">Explore the example project</Link> without an account.
			</p>
		</div>
	);
}
