export type IntakeQuestionId = 'q1_problem' | 'q2_audience' | 'q3_first_action' | 'q4_money' | 'q5_feel' | 'q6_must_haves' | 'q7_avoid' | 'q8_existing_assets';
export type IntakeQuestion = {
    id: IntakeQuestionId;
    label: string;
    defaultAnswer: string;
    placeholder: string;
};
export declare const INTAKE_QUESTIONS: IntakeQuestion[];
export type IntakePayload = {
    idea: string;
    audience: string;
    constraints?: string[];
    references?: {
        url: string;
        note?: string;
    }[];
    answers: {
        question_id: IntakeQuestionId;
        answer: string;
        used_default?: boolean;
    }[];
    assumptions?: {
        question_id: string;
        assumed_answer: string;
        reason: string;
    }[];
};
export declare function normalizeIntake(input: {
    idea: string;
    audience: string;
    constraints?: string[];
    references?: {
        url: string;
        note?: string;
    }[];
    answers?: Partial<Record<IntakeQuestionId, string | null | undefined>>;
}): IntakePayload;
