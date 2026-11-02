# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.8.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/react/package.json packages/react/tsconfig.json packages/react/tsup.config.ts ./packages/react/
COPY packages/designer-core/package.json packages/designer-core/tsconfig.json packages/designer-core/vitest.config.ts ./packages/designer-core/
COPY packages/flow-map-engine/package.json packages/flow-map-engine/tsconfig.json packages/flow-map-engine/vitest.config.ts ./packages/flow-map-engine/
COPY packages/react/scripts ./packages/react/scripts
COPY themes ./themes
COPY prototype/package.json prototype/pnpm-lock.yaml ./prototype/

RUN pnpm install --frozen-lockfile

COPY packages/react/src ./packages/react/src
COPY packages/designer-core/src ./packages/designer-core/src
COPY packages/designer-core/tests ./packages/designer-core/tests
COPY prototype ./prototype

RUN pnpm run build:react
RUN pnpm --filter @bareframe/designer-core build

WORKDIR /app/prototype
RUN pnpm install --frozen-lockfile \
    && VITE_BAREFRAME_APP=designer \
    VITE_DOCS_SITE_URL=https://bareframe.org \
    VITE_DESIGNER_SITE_URL=https://designer.bareframe.org \
    BAREFRAME_DESIGNER_BUILD=1 \
    pnpm run build \
    && cp ../public/designer/designer.html ../public/designer/index.html

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY docker/nginx/designer.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/public/designer /usr/share/nginx/html

EXPOSE 8080
