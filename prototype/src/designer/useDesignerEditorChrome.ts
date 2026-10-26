import { useEffect } from 'react';

const BODY_CLASS = 'designer-editor-active';

/** Lock the editor to the viewport: no page scroll, no horizontal document overflow. */
export function useDesignerEditorChrome() {
	useEffect(() => {
		document.body.classList.add(BODY_CLASS);
		const prevHtmlOverflow = document.documentElement.style.overflowX;
		const prevBodyOverflow = document.body.style.overflowX;
		document.documentElement.style.overflowX = 'clip';
		document.body.style.overflowX = 'clip';

		const resetScroll = () => {
			if (window.scrollX !== 0) {
				window.scrollTo({ left: 0, top: window.scrollY, behavior: 'instant' as ScrollBehavior });
			}
		};
		resetScroll();
		window.addEventListener('resize', resetScroll);

		return () => {
			document.body.classList.remove(BODY_CLASS);
			document.documentElement.style.overflowX = prevHtmlOverflow;
			document.body.style.overflowX = prevBodyOverflow;
			window.removeEventListener('resize', resetScroll);
		};
	}, []);
}
