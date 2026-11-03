# Delivery Flow and Bareframe package contracts

Version **1.0** JSON Schemas live in [`packages/package-contracts/schemas/`](../packages/package-contracts/schemas/).

| Contract | Schema file |
|----------|-------------|
| `bareframe.package` | `bareframe.package.v1.0.schema.json` |
| `define.requirements` | `define.requirements.v1.0.schema.json` |
| `design.spec` | `design.spec.v1.0.schema.json` |

Validate in Node:

```js
import { validateBareframePackage } from '@bareframe/package-contracts';
```

HTTP: `GET /api/contracts` and `GET /api/contracts/:contractId` on the Bareframe API.
