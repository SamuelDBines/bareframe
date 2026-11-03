import type { ThemeId } from '../theme/themes';

async function fetchText(base: URL, rel: string): Promise<string> {
	try {
		const res = await fetch(new URL(rel, base));
		if (!res.ok) return '';
		return await res.text();
	} catch {
		return '';
	}
}

/** Inline theme + component CSS for iframe srcdoc (no broken @import in srcdoc). */
export async function loadFramePreviewStyles(assetBase: string, themeId: ThemeId): Promise<string> {
	const base = new URL(assetBase);
	const [layout, themeRaw, ui, buttons] = await Promise.all([
		fetchText(base, 'themes/layout.css'),
		fetchText(base, `themes/${themeId}.css`),
		fetchText(base, 'assets/frame-preview/bareframe-ui.css'),
		fetchText(base, 'assets/frame-preview/button.css'),
	]);
	const theme = themeRaw.replace(/@import\s+['"]\.\/layout\.css['"]\s*;?\s*/g, '');
	return [layout, theme, ui, buttons].filter(Boolean).join('\n');
}
