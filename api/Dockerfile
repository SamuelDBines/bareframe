# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS designer-core-build
WORKDIR /repo/packages/designer-core
COPY packages/designer-core/package.json packages/designer-core/tsconfig.json ./
COPY packages/designer-core/src ./src
RUN npm install && npm run build

FROM node:20-bookworm-slim AS flow-map-build
WORKDIR /repo/packages/flow-map-engine
COPY packages/flow-map-engine/package.json packages/flow-map-engine/tsconfig.json ./
COPY packages/flow-map-engine/src ./src
RUN npm install && npm run build

FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY --from=designer-core-build /repo/packages/designer-core /packages/designer-core
COPY --from=flow-map-build /repo/packages/flow-map-engine /packages/flow-map-engine

COPY api/package.json api/package-lock.json ./
RUN npm ci

COPY api/tsconfig.json ./
COPY api/src ./src
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
RUN groupadd -g 10001 bareframe && useradd -u 10001 -g 10001 -d /app bareframe

COPY --from=designer-core-build /repo/packages/designer-core /packages/designer-core
COPY --from=flow-map-build /repo/packages/flow-map-engine /packages/flow-map-engine

COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY api/src/db/migrations ./dist/db/migrations

USER 10001:10001
EXPOSE 8080

CMD ["node", "dist/index.js"]
