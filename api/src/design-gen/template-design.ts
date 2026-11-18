import {
	templateDesignStatesForBrief,
	type DesignDevice,
	type DesignTreeNode,
	type ScreenBrief,
} from '@bareframe/designer-core';

/** Component-library layout from screen name and brief, no LLM. */
export function templateDesignStates(
	screenName: string,
	brief: ScreenBrief,
	outgoingActions: string[],
	device: DesignDevice,
): Record<string, DesignTreeNode> {
	return templateDesignStatesForBrief(screenName, brief, outgoingActions, device);
}