import type { Config } from '@stencil/core';

export const config: Config = {
	namespace: 'bareframe',
	taskQueue: 'async',
	sourceMap: false,
	srcDir: 'src',
	outputTargets: [
		{
			type: 'dist-custom-elements',
			dir: '../dist/_stencil',
			empty: true,
			minify: false,
			externalRuntime: false,
			customElementsExportBehavior: 'single-export-module',
			generateTypeDeclarations: false,
		},
	],
};
