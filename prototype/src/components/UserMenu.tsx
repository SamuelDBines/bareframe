import { Link } from 'react-router-dom';
import { githubSignInUrl, useAuth } from '../auth/AuthContext';
import { githubAuthReturnTo } from '../sites/urls';

type Props = {
	designerApp?: boolean;
};

export function UserMenu({ designerApp = false }: Props) {
	const { status, user, signOut } = useAuth();

	if (status === 'loading') {
		return <span className="auth-muted" aria-live="polite">…</span>;
	}

	if (user) {
		return (
			<div className="user-menu">
				<img
					className="user-avatar"
					src={user.avatarUrl ?? ''}
					alt=""
					width={32}
					height={32}
				/>
				<span className="user-login">{user.login}</span>
				<button type="button" className="btn btn-ghost btn-sm" onClick={() => void signOut()}>
					Sign out
				</button>
			</div>
		);
	}

	return (
		<div className="user-menu">
			{designerApp ? null : (
				<Link to="/sign-in" className="btn btn-ghost btn-sm">Sign in</Link>
			)}
			{status !== 'unavailable' ? (
				<a
					className="btn btn-primary btn-sm"
					href={githubSignInUrl(
						designerApp
							? githubAuthReturnTo(window.location.hash.replace(/^#/, '') || '/')
							: undefined,
					)}
				>
					Sign in with GitHub
				</a>
			) : null}
		</div>
	);
}
