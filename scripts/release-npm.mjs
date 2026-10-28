#!/usr/bin/env node
import { execSync } from 'node:child_process';

if (!process.env.NPM_TOKEN) {
	console.error(
		'::error::NPM_TOKEN is not configured. Add a granular npm automation token with publish access for the @bareframe scope (see RELEASING.md).',
	);
	process.exit(1);
}

execSync('pnpm --filter @bareframe/react build', { stdio: 'inherit' });
execSync('changeset publish', {
	stdio: 'inherit',
	env: {
		...process.env,
		NPM_CONFIG_PROVENANCE: 'true',
	},
});
