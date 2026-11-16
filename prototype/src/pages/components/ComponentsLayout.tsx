import { DocsShell } from './docs/DocsShell';
import { I18nProvider } from '@react-aria/i18n';
import buttonCss from '../../../../packages/react/src/styles/button.css?raw';
import './docs/docs.css';

/**
 * Component styles that ship in @bareframe/react/styles.css but would restyle the docs chrome if
 * loaded globally: applied only inside component previews (playground, examples, gallery cards).
 */
const PREVIEW_COMPONENT_CSS = `@scope (.bf-docs-preview, .doc-example-preview) {\n${buttonCss}\n}`;

export function ComponentsLayout() {
	return (
		<I18nProvider locale="en-US">
			<style data-bf-preview-styles>{PREVIEW_COMPONENT_CSS}</style>
			<DocsShell />
		</I18nProvider>
	);
}
