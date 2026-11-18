#!/usr/bin/env node
/**
 * CI guard: npm Playwright version must match playwright.version and render/Dockerfile base tags.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

function readVersionFile() {
	const raw = readFileSync(path.join(ROOT, 'playwright.version'), 'utf8').trim();
	if (!/^\d+\.\d+\.\d+$/.test(raw)) {
		throw new Error(`playwright.version must be semver (got ${JSON.stringify(raw)})`);
	}
	return raw;
}

function readJson(rel) {
	return JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8'));
}

const expected = readVersionFile();
const errors = [];

const rootPkg = readJson('package.json');
for (const key of ['playwright', '@playwright/test']) {
	const v = rootPkg.devDependencies?.[key];
	if (v !== expected) {
		errors.push(`package.json devDependencies[${key}] must be exactly ${expected} (got ${v})`);
	}
}

const apiPkg = readJson('api/package.json');
if (apiPkg.dependencies?.playwright !== expected) {
	errors.push(
		`api/package.json dependencies.playwright must be exactly ${expected} (got ${apiPkg.dependencies?.playwright})`,
	);
}

const dockerfile = readFileSync(path.join(ROOT, 'render/Dockerfile'), 'utf8');
const tag = `mcr.microsoft.com/playwright:v${expected}-jammy`;
const fromLines = [...dockerfile.matchAll(/^FROM\s+(\S+)/gm)].map((m) => m[1]);
for (const from of fromLines) {
	if (from.startsWith('mcr.microsoft.com/playwright:') && from !== tag) {
		errors.push(`render/Dockerfile FROM ${from} must be ${tag}`);
	}
}

const lockPath = path.join(ROOT, 'api/package-lock.json');
const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
const resolved = lock.packages?.['']?.dependencies?.playwright;
const lockResolved = lock.packages?.['node_modules/playwright']?.version;
if (lockResolved !== expected) {
	errors.push(`api/package-lock.json playwright must resolve to ${expected} (got ${lockResolved})`);
}
if (resolved !== expected) {
	errors.push(`api/package-lock root dependency playwright must be ${expected} (got ${resolved})`);
}

if (errors.length) {
	console.error('Playwright lockstep check failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
	process.exit(1);
}

console.log(`Playwright lockstep OK (${expected})`);