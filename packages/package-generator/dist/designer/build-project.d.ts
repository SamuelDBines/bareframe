import { type ProjectDocument } from '@bareframe/designer-core';
import type { JourneyPlan, ScreenPlan } from '../types.js';
export type BuildDesignerOptions = {
    projectId: string;
    projectName: string;
    themeId: string;
    screens: ScreenPlan[];
    journeys: JourneyPlan[];
    copyByScreen: Map<string, {
        key: string;
        text: string;
    }[]>;
    isValidComponentSlug: (slug: string) => boolean;
};
export declare function buildDesignerProjectDocument(opts: BuildDesignerOptions): ProjectDocument;
