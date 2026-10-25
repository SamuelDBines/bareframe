import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import { DEFAULT_THEME, type ThemeId } from './themes';

const STORAGE_KEY = 'bareframe-prototype-theme';

type ThemeContextValue = {
	theme: ThemeId;
	setTheme: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): ThemeId {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) return raw as ThemeId;
	} catch {
		/* ignore */
	}
	return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<ThemeId>(readStoredTheme);

	const setTheme = useCallback((id: ThemeId) => {
		setThemeState(id);
		try {
			localStorage.setItem(STORAGE_KEY, id);
		} catch {
			/* ignore */
		}
	}, []);

	useEffect(() => {
		document.documentElement.setAttribute('data-bf-theme', theme);
		if (theme === 'system') {
			document.documentElement.removeAttribute('data-bf-theme');
		}
	}, [theme]);

	useEffect(() => {
		const base = import.meta.env.BASE_URL;
		const href = `${base}themes/${theme}.css`;
		let link = document.querySelector<HTMLLinkElement>('link[data-bf-theme-stylesheet]');
		if (!link) {
			link = document.createElement('link');
			link.rel = 'stylesheet';
			link.setAttribute('data-bf-theme-stylesheet', '');
			document.head.appendChild(link);
		}
		link.href = href;
	}, [theme]);

	const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
	return ctx;
}
