import { createServer } from 'node:http';
import { getBrowserReadyState } from './playwright-health.js';

export function startRenderWorkerHealthServer(port: number): void {
	const server = createServer((req, res) => {
		if (req.url === '/healthz/ready') {
			const { state, error } = getBrowserReadyState();
			if (state === 'ready') {
				res.writeHead(200, { 'content-type': 'application/json' });
				res.end(JSON.stringify({ ok: true, browser: 'ready' }));
				return;
			}
			res.writeHead(503, { 'content-type': 'application/json' });
			res.end(
				JSON.stringify({
					ok: false,
					browser: state,
					error: error ?? 'Playwright browser not ready',
				}),
			);
			return;
		}
		if (req.url === '/healthz/live') {
			res.writeHead(200, { 'content-type': 'application/json' });
			res.end(JSON.stringify({ ok: true }));
			return;
		}
		res.writeHead(404);
		res.end();
	});
	server.listen(port, '0.0.0.0', () => {
		console.log(`Render worker health listening on :${port}`);
	});
}