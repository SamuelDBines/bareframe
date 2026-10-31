import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
/* Docs site: component rules only. Button variant tokens ship in published @bareframe/react/styles.css. */
import '../../packages/react/src/styles/bareframe-ui.css';
import './index.css';

function initTelemetry() {
	if (import.meta.env.VITE_TELEMETRY !== '1') return;
	const script = document.createElement('script');
	script.src = 'https://t.bishop-co-tech.co.uk/s.js';
	script.dataset.key = 'pk_ea8a8a62b17932876a91d82c';
	script.defer = true;
	document.head.appendChild(script);
}

initTelemetry();

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
