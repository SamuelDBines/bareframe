import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';

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
	refresh: () => Promise<void>;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

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

async function fetchMe(): Promise<AuthUser | null> {
	const res = await fetch('/api/me', { credentials: 'include' });
	if (!res.ok) throw new Error(`me ${res.status}`);
	const data = (await res.json()) as { user: AuthUser | null };
	return data.user ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [status, setStatus] = useState<AuthStatus>('loading');
	const [user, setUser] = useState<AuthUser | null>(null);

	const refresh = useCallback(async () => {
		try {
			const hasApi = await probeApiAvailable();
			if (!hasApi) {
				setUser(null);
				setStatus('anonymous');
				return;
			}
			const u = await fetchMe();
			setUser(u);
			setStatus(u ? 'authenticated' : 'anonymous');
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
		() => ({ status, user, refresh, signOut }),
		[status, user, refresh, signOut],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth requires AuthProvider');
	return ctx;
}

export function githubSignInUrl(returnTo: string): string {
	const q = new URLSearchParams({ returnTo });
	return `/api/auth/github?${q}`;
}
