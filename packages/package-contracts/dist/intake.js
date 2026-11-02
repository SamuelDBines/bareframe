export const INTAKE_QUESTIONS = [
    {
        id: 'q1_problem',
        label: 'What problem should this product solve?',
        defaultAnswer: 'People waste time on repetitive tasks that software could handle in one place.',
        placeholder: 'Describe the pain in one or two sentences.',
    },
    {
        id: 'q2_audience',
        label: 'Who is it for?',
        defaultAnswer: 'Busy professionals and small teams who need a simple, trustworthy tool.',
        placeholder: 'Primary audience and context.',
    },
    {
        id: 'q3_first_action',
        label: 'What should a new user do first?',
        defaultAnswer: 'Sign up with email, complete a short onboarding, and reach the main dashboard.',
        placeholder: 'The first meaningful action after landing.',
    },
    {
        id: 'q4_money',
        label: 'How will it make money (if at all)?',
        defaultAnswer: 'Freemium with a paid tier for advanced features and higher limits.',
        placeholder: 'Pricing model, if any.',
    },
    {
        id: 'q5_feel',
        label: 'How should it feel to use?',
        defaultAnswer: 'Calm, confident, and modern — never cluttered or salesy.',
        placeholder: 'Personality and emotional tone.',
    },
    {
        id: 'q6_must_haves',
        label: 'Must-have features for v1',
        defaultAnswer: 'Account sign-in, core workflow, settings, and basic notifications.',
        placeholder: 'Non-negotiables for launch.',
    },
    {
        id: 'q7_avoid',
        label: 'What should we avoid?',
        defaultAnswer: 'Dark patterns, complex setup, and features that need a dedicated admin.',
        placeholder: 'Anti-goals and constraints.',
    },
    {
        id: 'q8_existing_assets',
        label: 'Existing brand or assets?',
        defaultAnswer: 'Starting fresh — no logo or domain locked in yet.',
        placeholder: 'Logos, domains, design systems, or none.',
    },
];
export function normalizeIntake(input) {
    const assumptions = [];
    const answers = [];
    for (const q of INTAKE_QUESTIONS) {
        const raw = input.answers?.[q.id];
        const trimmed = typeof raw === 'string' ? raw.trim() : '';
        if (!trimmed) {
            answers.push({ question_id: q.id, answer: q.defaultAnswer, used_default: true });
            assumptions.push({
                question_id: q.id,
                assumed_answer: q.defaultAnswer,
                reason: 'Customer skipped this question; default applied.',
            });
        }
        else {
            answers.push({ question_id: q.id, answer: trimmed, used_default: false });
        }
    }
    const refs = (input.references ?? []).filter((r) => r.url?.trim()).slice(0, 5);
    return {
        idea: input.idea.trim(),
        audience: input.audience.trim(),
        constraints: input.constraints?.map((c) => c.trim()).filter(Boolean),
        references: refs,
        answers,
        assumptions: assumptions.length ? assumptions : undefined,
    };
}
