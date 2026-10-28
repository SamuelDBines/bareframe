# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /app

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.8.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/react/package.json packages/react/tsconfig.json packages/react/tsup.config.ts ./packages/react/
COPY packages/react/scripts ./packages/react/scripts
COPY scripts ./scripts
COPY src ./src
COPY stencil ./stencil
COPY themes ./themes
COPY examples ./examples
COPY public ./public
COPY all-components.md ./
COPY tsconfig.json ./
COPY showcase/package.json showcase/pnpm-lock.yaml ./showcase/
COPY prototype/package.json prototype/pnpm-lock.yaml ./prototype/

RUN pnpm install --frozen-lockfile

COPY packages/react/src ./packages/react/src
COPY showcase ./showcase
COPY prototype ./prototype

RUN pnpm run build:react

RUN pnpm run build \
    && node ./scripts/generate-examples.mjs \
    && node ./scripts/generate-versions.mjs \
    && pnpm run prep-pages

WORKDIR /app/showcase
RUN pnpm install --frozen-lockfile && pnpm exec vite build

WORKDIR /app/prototype
RUN pnpm install --frozen-lockfile && BAREFRAME_PAGES_ROOT=1 pnpm run build

WORKDIR /app
RUN node ./scripts/finalize-pages.mjs \
    && pnpm run smoke:pages \
    && rm -f public/CNAME public/.nojekyll

FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/public /usr/share/nginx/html

EXPOSE 8080
