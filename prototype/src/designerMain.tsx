import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import DesignerApp from './DesignerApp';
import '../../packages/react/src/styles/bareframe-ui.css';
import './index.css';
import './designer/designer-ui.css';

document.documentElement.classList.add('designer-app');
document.documentElement.setAttribute('data-bf-theme', 'simple');

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
		<DesignerApp />
	</StrictMode>,
);
