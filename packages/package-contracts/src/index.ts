export * from './intake.js';
export * from './validate.js';

export type BareframePackage = Record<string, unknown> & {
  contract: 'bareframe.package';
  version: '1.0';
};
