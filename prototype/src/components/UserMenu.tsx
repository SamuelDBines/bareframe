import { Link } from 'react-router-dom';
import { githubSignInUrl, useAuth } from '../auth/AuthContext';
import { githubAuthReturnTo } from '../sites/urls';

type Props = {
	designerApp?: boolean;
	/** Inside /app: no "Start free" upsell, just account state. */
	inApp?: boolean;
};

export function UserMenu({ designerApp = false, inApp = false }: Props) {
	const { status, user, signOut } = useAuth();

	if (status === 'loading') {
		return <span className="auth-muted" aria-live="polite" aria-label="Checking sign-in" />;
	}

	if (user) {
		return (
			<div className="user-menu">
				{inApp ? null : (
					<Link to="/app" className="btn btn-secondary btn-sm">
						Open app
					</Link>
				)}
				{user.avatarUrl ? (
					<img className="user-avatar" src={user.avatarUrl} alt="" width={32} height={32} />
				) : (
					<span className="user-avatar user-avatar--initial" aria-hidden>
						{user.login.slice(0, 1).toUpperCase()}
					</span>
				)}
				<span className="user-login">{user.login}</span>
				<button type="button" className="btn btn-ghost btn-sm" onClick={() => void signOut()}>
					Sign out
				</button>
			</div>
		);
	}

	if (designerApp) {
		return status !== 'unavailable' ? (
			<div className="user-menu">
				<a
					className="btn btn-primary btn-sm"
					href={githubSignInUrl(githubAuthReturnTo(window.location.hash.replace(/^#/, '') || '/'))}
				>
					Sign in with GitHub
				</a>
			</div>
		) : null;
	}

	return (
		<div className="user-menu">
			<Link to="/sign-in" className="btn btn-ghost btn-sm">
				Sign in
			</Link>
			{inApp ? null : (
				<Link to="/app" className="btn btn-primary btn-sm">
					Start free
				</Link>
			)}
		</div>
	);
}
