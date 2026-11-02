import { buildReviewChecklist, buildDeliveryFlowContracts } from '../delivery-flow/build.js';
const STAGES = [
    { stage: 'definition', label: 'Product definition' },
    { stage: 'naming_branding', label: 'Naming & branding' },
    { stage: 'design_directions', label: 'Design directions' },
    { stage: 'ia', label: 'Information architecture' },
    { stage: 'journeys', label: 'User journeys' },
    { stage: 'screens_copy', label: 'Screens & copy' },
    { stage: 'handoff', label: 'Technical handoff' },
];
export async function runPipelineStages(llm, ctx) {
    const artifacts = {};
    const total = STAGES.length;
    for (let i = 0; i < STAGES.length; i++) {
        const { stage, label } = STAGES[i];
        ctx.onProgress?.({ stage, label, index: i + 1, total });
        const baseUser = JSON.stringify({ intake: ctx.intake, projectName: ctx.projectName, prior: artifacts }, null, 2);
        switch (stage) {
            case 'definition': {
                const out = await llm.completeJson({
                    stage,
                    system: 'You are Bareframe product strategist. Output JSON with a product object.',
                    user: baseUser,
                    schemaHint: '{ "product": { problem, audience[], value_proposition, core_features[], mvp_scope[], non_goals[], success_measures[] } }',
                });
                artifacts.product = out.product;
                break;
            }
            case 'naming_branding': {
                const out = await llm.completeJson({
                    stage,
                    system: 'You are a naming and brand strategist for digital products.',
                    user: baseUser,
                    schemaHint: '{ "naming": { options[5-7], recommended }, "branding": { personality, tone_of_voice, taglines, logo_direction } }',
                });
                artifacts.naming = out.naming;
                artifacts.branding = out.branding;
                break;
            }
            case 'design_directions': {
                const out = await llm.completeJson({
                    stage,
                    system: 'You produce 2-3 design directions mapped to Bareframe themes (aurora, simple, noir, oceanic, etc).',
                    user: baseUser,
                    schemaHint: '{ "design_options": [ DesignDirection ] } with hex palette and contrast_checks',
                });
                artifacts.design_options = out.design_options;
                break;
            }
            case 'ia': {
                const out = await llm.completeJson({
                    stage,
                    system: 'You design sitemaps for MVPs.',
                    user: baseUser,
                    schemaHint: '{ "ia": { sitemap[], navigation } }',
                });
                artifacts.ia = out.ia;
                break;
            }
            case 'journeys': {
                const out = await llm.completeJson({
                    stage,
                    system: 'You define 3-5 user journeys as step lists referencing screen ids from IA.',
                    user: baseUser,
                    schemaHint: '{ "journeys": [ { id, name, persona, goal, story_ids, steps[] } ] }',
                });
                artifacts.journeys = out.journeys;
                break;
            }
            case 'screens_copy': {
                const out = await llm.completeJson({
                    stage,
                    system: 'You plan 6-12 prototype screens using @bareframe/react component slugs.',
                    user: baseUser,
                    schemaHint: '{ "screens": [...], "copy": [ { screen_id, blocks[] } ] }',
                });
                artifacts.screens = out.screens;
                artifacts.copy = out.copy;
                break;
            }
            case 'handoff': {
                const out = await llm.completeJson({
                    stage,
                    system: 'You produce technical handoff: components, tokens, scaffolded_screens paths, entities, APIs, stack.',
                    user: baseUser,
                    schemaHint: '{ "handoff": { components, design_tokens, scaffolded_screens, data_entities, api_contracts, stack } }',
                });
                artifacts.handoff = out.handoff;
                break;
            }
        }
    }
    return artifacts;
}
export function assembleBareframePackage(input) {
    const summary = input.artifacts.product?.value_proposition ??
        input.intake.idea.slice(0, 160);
    const delivery = buildDeliveryFlowContracts(input.projectName, summary, input.intake, input.artifacts);
    const pkg = {
        contract: 'bareframe.package',
        version: '1.0',
        project: input.projectName,
        summary,
        status: 'in_review',
        revision: 0,
        intake: {
            idea: input.intake.idea,
            audience: input.intake.audience,
            constraints: input.intake.constraints,
            references: input.intake.references,
            answers: input.intake.answers,
            assumptions: input.intake.assumptions,
        },
        product: input.artifacts.product,
        naming: input.artifacts.naming,
        branding: input.artifacts.branding,
        design_options: input.artifacts.design_options,
        selected_direction: input.selectedDirection ?? input.artifacts.design_options[0]?.id ?? null,
        ia: input.artifacts.ia,
        journeys: input.artifacts.journeys.map((j) => ({
            ...j,
            flow_map_ref: `designer://${input.designerProjectId}/journey/${j.id}`,
        })),
        prototype: {
            designer_project_id: input.designerProjectId,
            share_url: input.shareUrl,
            library: '@bareframe/react',
            library_version: input.libraryVersion,
            screens: input.artifacts.screens.map((s) => ({
                id: s.id,
                name: s.name,
                route: s.route,
                components: s.components,
                story_ids: s.story_ids,
            })),
        },
        copy: input.artifacts.copy,
        handoff: input.artifacts.handoff,
        review: {
            checklist: buildReviewChecklist(),
            rounds_included: 2,
            rounds_used: 0,
            approved_by: null,
            approved_at: null,
        },
        delivery_flow: delivery,
    };
    return pkg;
}
