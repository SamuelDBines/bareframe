import type pg from 'pg';
import { hostname } from 'node:os';
import { createPoolFromDatabaseUrl } from '../db/pool.js';
import { loadConfig } from '../config.js';
import { claimNextRenderJob } from '../db/render-jobs.js';
import {
	processFlowMapJob,
	processRenderFrameJob,
	processScreenshotUrlJob,
	type FlowMapPayload,
} from './process-jobs.js';
import { closePlaywrightBrowser } from './playwright-capture.js';

const workerId = `${hostname()}-${process.pid}`;
const pollMs = Number(process.env.RENDER_WORKER_POLL_MS ?? 1500);

async function processOne(pool: pg.Pool): Promise<boolean> {
	const job = await claimNextRenderJob(pool, workerId);
	if (!job) return false;

	const payload = job.payload as Record<string, unknown>;
	try {
		if (job.kind === 'flow_map') {
			await processFlowMapJob(pool, job.id, payload as FlowMapPayload);
		} else if (job.kind === 'screenshot_url') {
			await processScreenshotUrlJob(pool, job.id, payload as {
				url: string;
				viewport?: 'mobile' | 'desktop';
				projectId?: string;
			});
		} else if (job.kind === 'render_frame') {
			await processRenderFrameJob(pool, job.id, payload as {
				projectId: string;
				frameId: string;
				withAnnotations?: boolean;
			});
		}
	} catch (err) {
		console.error(`Job ${job.id} (${job.kind}) failed`, err);
	}
	return true;
}

async function main() {
	const config = loadConfig();
	const pool = createPoolFromDatabaseUrl(config.databaseUrl);
	console.log(`Render worker ${workerId} started`);

	const shutdown = async () => {
		await closePlaywrightBrowser();
		await pool.end();
		process.exit(0);
	};
	process.on('SIGINT', shutdown);
	process.on('SIGTERM', shutdown);

	for (;;) {
		const didWork = await processOne(pool);
		if (!didWork) await new Promise((r) => setTimeout(r, pollMs));
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
