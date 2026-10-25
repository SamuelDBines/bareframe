import { describe, expect, it } from 'vitest';
import { poolConfigFromDatabaseUrl } from '../src/db/pool.js';

describe('poolConfigFromDatabaseUrl', () => {
	it('disables SSL when sslmode=disable', () => {
		const cfg = poolConfigFromDatabaseUrl(
			'postgresql://bareframe:secret@postgres.database.svc.cluster.local:5432/bareframe?sslmode=disable',
		);
		expect(cfg.ssl).toBe(false);
	});

	it('enables SSL for sslmode=require', () => {
		const cfg = poolConfigFromDatabaseUrl(
			'postgres://u:p@host:5432/db?sslmode=require',
		);
		expect(cfg.ssl).toEqual({ rejectUnauthorized: false });
	});
});
