export type DesignerProject = {
	id: string;
	name: string;
	updatedAt: string;
	theme: string;
	screens: number;
};

export const MOCK_PROJECTS: DesignerProject[] = [
	{
		id: 'proj-onboarding',
		name: 'Onboarding flow',
		updatedAt: '2 hours ago',
		theme: 'aurora',
		screens: 4,
	},
	{
		id: 'proj-dashboard',
		name: 'Analytics dashboard',
		updatedAt: 'Yesterday',
		theme: 'light',
		screens: 7,
	},
	{
		id: 'proj-mobile',
		name: 'Mobile settings',
		updatedAt: 'Mar 12',
		theme: 'noir',
		screens: 3,
	},
];
