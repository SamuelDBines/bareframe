import { describe, it, expect } from 'vitest';
import { buildDemoCommerceBookingProject } from '../demoCommerceBookingProject';
import { buildDemoSaasOnboardingProject } from '../demoSaasOnboardingProject';
import { routeConnectors } from './flowMapLayout';

describe('public flow map examples', () => {
	it('SaaS onboarding has branching connectors and 7 screens', () => {
		const project = buildDemoSaasOnboardingProject();
		expect(project.frames).toHaveLength(7);
		expect(project.connectors.length).toBeGreaterThanOrEqual(8);
		const routed = routeConnectors(project.frames, project.connectors);
		expect(routed.some((r) => r.kind === 'back')).toBe(true);
		expect(project.annotations.length).toBeGreaterThanOrEqual(3);
	});

	it('commerce booking has guest/account split and a retry loop', () => {
		const project = buildDemoCommerceBookingProject();
		expect(project.frames.length).toBeGreaterThanOrEqual(8);
		const labels = project.connectors.map((c) => c.label);
		expect(labels).toContain('Continue as guest');
		expect(labels).toContain('Sign in');
		expect(labels).toContain('Pick another time');
		expect(labels).toContain('Book another');
	});
});
