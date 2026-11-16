import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import { githubSignInUrl as buildGithubSignInUrl } from './signIn';

export type AuthUser = {
	id: number;
	login: string;
	name: string | null;
	avatarUrl: string | null;
	email: string | null;
};

type AuthStatus = 'loading' | 'authenticated' | 'anonymous' | 'unavailable';

type AuthContextValue = {
	status: AuthStatus;
	user: AuthUser | null;
	/** False when this workspace runs without AI; AI-only features are hidden rather than failing. */
	aiAvailable: boolean;
	refresh: () => Promise<void>;
	signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

let apiAvailability: 'unknown' | 'available' | 'missing' = 'unknown';

async function probeApiAvailable(): Promise<boolean> {
	if (apiAvailability === 'available') return true;
	if (apiAvailability === 'missing') return false;
	try {
		const res = await fetch('/api/healthz', { credentials: 'same-origin' });
		if (!res.ok) {
			apiAvailability = 'missing';
			return false;
		}
		apiAvailability = 'available';
		return true;
	} catch {
		apiAvailability = 'missing';
		return false;
	}
}

async function fetchMe(): Promise<{ user: AuthUser | null; aiAvailable: boolean }> {
	const res = await fetch('/api/me', { credentials: 'include' });
	if (!res.ok) throw new Error(`me ${res.status}`);
	const data = (await res.json()) as { user: AuthUser | null; features?: { ai?: boolean } };
	return { user: data.user ?? null, aiAvailable: data.features?.ai !== false };
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [status, setStatus] = useState<AuthStatus>('loading');
	const [user, setUser] = useState<AuthUser | null>(null);
	const [aiAvailable, setAiAvailable] = useState(true);

	const refresh = useCallback(async () => {
		try {
			const hasApi = await probeApiAvailable();
			if (!hasApi) {
				setUser(null);
				setStatus('anonymous');
				return;
			}
			const me = await fetchMe();
			setUser(me.user);
			setAiAvailable(me.aiAvailable);
			setStatus(me.user ? 'authenticated' : 'anonymous');
		} catch {
			setUser(null);
			setStatus('unavailable');
		}
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const signOut = useCallback(async () => {
		try {
			if (await probeApiAvailable()) {
				await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
			}
			setUser(null);
			setStatus('anonymous');
		} catch {
			setUser(null);
			setStatus('unavailable');
		}
	}, []);

	const value = useMemo(
		() => ({ status, user, aiAvailable, refresh, signOut }),
		[status, user, aiAvailable, refresh, signOut],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth requires AuthProvider');
	return ctx;
}

export function githubSignInUrl(returnTo?: string): string {
	return buildGithubSignInUrl(returnTo);
}
