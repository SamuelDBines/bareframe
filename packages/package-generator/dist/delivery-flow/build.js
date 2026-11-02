export function buildDeliveryFlowContracts(projectName, summary, intake, artifacts) {
    const product = artifacts.product;
    const userStories = product.core_features.flatMap((f, i) => {
        const id = f.story_ids[0] ?? `us_${i + 1}`;
        return [
            {
                id,
                as_a: product.audience[0]?.persona ?? 'user',
                i_want: f.name.toLowerCase(),
                so_that: 'I can complete my goal faster',
                acceptance_criteria: [`Given ${f.name}, when I use the app, then it works on mobile.`],
                priority: product.mvp_scope.includes(f.id) ? 'must' : 'should',
            },
        ];
    });
    const define = {
        contract: 'define.requirements',
        version: '1.0',
        project: projectName,
        summary,
        sources: [{ connector: 'bareframe.package', tool: 'generator', ref: 'intake' }],
        problem: product.problem,
        users: product.audience.map((a) => ({ persona: a.persona, need: a.need })),
        user_stories: userStories,
        constraints: intake.constraints ?? [],
        success_measures: product.success_measures ?? [],
        out_of_scope: product.non_goals,
    };
    const screens = artifacts.screens.map((s) => ({
        id: s.id,
        name: s.name,
        purpose: s.intent,
        components: s.components,
        story_ids: s.story_ids,
    }));
    const design = {
        contract: 'design.spec',
        version: '1.0',
        project: projectName,
        summary: `Screen map for ${projectName}`,
        sources: [{ connector: 'bareframe.package', tool: 'generator', ref: 'prototype' }],
        screens,
        components: [...new Set(artifacts.screens.flatMap((s) => s.components))],
        architecture: 'React SPA with REST API and PostgreSQL.',
        design_tokens: artifacts.handoff.design_tokens,
        data_entities: artifacts.handoff.data_entities ?? [],
        api_contracts: artifacts.handoff.api_contracts ?? [],
    };
    return { define, design };
}
export function buildReviewChecklist() {
    const sections = [
        ['Product', ['Problem and audience match your brief', 'MVP scope is realistic', 'Non-goals are clear']],
        ['Naming & brand', ['Naming options fit the market', 'Tone of voice feels right', 'Logo direction is actionable']],
        ['Design', ['Pick a design direction', 'Palette meets contrast needs', 'IA covers key routes']],
        ['Prototype', ['Journeys match your flows', 'Screens use real components', 'Copy reads naturally']],
        ['Handoff', ['Stack and APIs look feasible', 'TSX scaffolds are a useful start']],
    ];
    const items = [];
    let n = 1;
    for (const [section, lines] of sections) {
        for (const item of lines) {
            items.push({ id: `chk_${n++}`, section, item, status: 'pending' });
        }
    }
    return items;
}
