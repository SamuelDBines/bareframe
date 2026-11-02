// @ts-nocheck
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020');
const addFormats = require('ajv-formats');
const here = path.dirname(fileURLToPath(import.meta.url));
function loadSchema(name) {
    const schemaPath = path.join(here, '..', 'schemas', name);
    return JSON.parse(readFileSync(schemaPath, 'utf8'));
}
function createAjv() {
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    addFormats(ajv);
    return ajv;
}
let packageValidator = null;
let defineValidator = null;
let designValidator = null;
function getPackageValidator() {
    if (!packageValidator) {
        packageValidator = createAjv().compile(loadSchema('bareframe.package.v1.0.schema.json'));
    }
    return packageValidator;
}
function getDefineValidator() {
    if (!defineValidator) {
        defineValidator = createAjv().compile(loadSchema('define.requirements.v1.0.schema.json'));
    }
    return defineValidator;
}
function getDesignValidator() {
    if (!designValidator) {
        designValidator = createAjv().compile(loadSchema('design.spec.v1.0.schema.json'));
    }
    return designValidator;
}
function formatErrors(validate, data) {
    validate(data);
    return (validate.errors ?? []).map((e) => `${e.instancePath || '/'} ${e.message ?? 'invalid'}`);
}
export function validateDefineRequirements(data) {
    const v = getDefineValidator();
    if (v(data))
        return { ok: true };
    return { ok: false, errors: formatErrors(v, data) };
}
export function validateDesignSpec(data) {
    const v = getDesignValidator();
    if (v(data))
        return { ok: true };
    return { ok: false, errors: formatErrors(v, data) };
}
export function validateBareframePackage(data) {
    const v = getPackageValidator();
    if (!v(data)) {
        return { ok: false, errors: formatErrors(v, data) };
    }
    const defineResult = validateDefineRequirements(data.delivery_flow?.define);
    if (!defineResult.ok) {
        return { ok: false, errors: defineResult.errors.map((e) => `delivery_flow.define: ${e}`) };
    }
    const designResult = validateDesignSpec(data.delivery_flow?.design);
    if (!designResult.ok) {
        return { ok: false, errors: designResult.errors.map((e) => `delivery_flow.design: ${e}`) };
    }
    return { ok: true };
}
export function getContractSchema(contract) {
    switch (contract) {
        case 'bareframe.package':
            return loadSchema('bareframe.package.v1.0.schema.json');
        case 'define.requirements':
            return loadSchema('define.requirements.v1.0.schema.json');
        case 'design.spec':
            return loadSchema('design.spec.v1.0.schema.json');
    }
}
