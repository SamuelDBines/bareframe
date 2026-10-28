import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
/* Docs site: component rules only. Button variant tokens ship in published @bareframe/react/styles.css. */
import '../../packages/react/src/styles/bareframe-ui.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
