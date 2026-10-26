import { registryToComponentDocs } from '../components/library/codegen';
import { COMPONENT_REGISTRY } from '../components/library/registry';

export type ComponentDoc = {
	slug: string;
	name: string;
	description: string;
	category: string;
	status: 'stable' | 'beta' | 'coming';
	variants: string[];
	props: { name: string; type: string; default?: string; description: string }[];
};

export const COMPONENT_LIBRARY: ComponentDoc[] = registryToComponentDocs(COMPONENT_REGISTRY);

export function getComponent(slug: string): ComponentDoc | undefined {
	return COMPONENT_LIBRARY.find((c) => c.slug === slug);
}
