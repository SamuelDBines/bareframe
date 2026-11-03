import { describe, expect, it } from 'vitest';
import { validateBareframePackage } from '@bareframe/package-contracts';
import {
  assembleBareframePackage,
  barberBookingArtifacts,
  createFixtureLlmAdapter,
  runPipelineStages,
} from '../src/index.js';
import { normalizeIntake } from '@bareframe/package-contracts';

describe('barber booking package', () => {
  it('assembles a valid bareframe.package from fixture pipeline', async () => {
    const intake = normalizeIntake({
      idea: 'A barber booking site for walk-in shops',
      audience: 'Barbers and clients',
      answers: {},
    });
    const llm = createFixtureLlmAdapter(intake, 'TrimSlot');
    const artifacts = await runPipelineStages(llm, { intake, projectName: 'TrimSlot' });
    const pkg = assembleBareframePackage({
      intake,
      projectName: 'TrimSlot',
      designerProjectId: '00000000-0000-0000-0000-000000000001',
      shareUrl: 'https://designer.bareframe.org/#/product/x',
      libraryVersion: '0.0.0',
      artifacts,
    });
    const result = validateBareframePackage(pkg);
    if (!result.ok) console.error(result.errors);
    expect(result.ok).toBe(true);
    expect(barberBookingArtifacts(intake, 'TrimSlot').screens.length).toBeGreaterThanOrEqual(6);
  });
});
