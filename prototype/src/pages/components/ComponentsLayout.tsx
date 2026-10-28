import { DocsShell } from './docs/DocsShell';
import { I18nProvider } from '@react-aria/i18n';
import './docs/docs.css';

export function ComponentsLayout() {
	return (
		<I18nProvider locale="en-US">
			<DocsShell />
		</I18nProvider>
	);
}
