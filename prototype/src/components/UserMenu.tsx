import { Link } from 'react-router-dom';
import { githubSignInUrl, useAuth } from '../auth/AuthContext';
import { githubAuthReturnTo } from '../sites/urls';
import { AccountMenu } from './AccountMenu';

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
				<AccountMenu user={user} onSignOut={signOut} />
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
