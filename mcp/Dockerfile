# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /repo

COPY dist/manifest.json dist/tokens.json ./dist/
COPY themes ./themes
COPY prototype/src/components/library/generated-props.json ./prototype/src/components/library/generated-props.json
COPY package.json ./package.json

COPY mcp/package.json mcp/package-lock.json ./mcp/
WORKDIR /repo/mcp
RUN npm ci

COPY mcp/tsconfig.json mcp/vitest.config.ts ./ 
COPY mcp/scripts ./scripts
COPY mcp/src ./src
RUN node ./scripts/bundle-catalog.mjs && npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
RUN groupadd -g 10001 bareframe && useradd -u 10001 -g 10001 -d /app bareframe

COPY mcp/package.json mcp/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /repo/mcp/dist ./dist
COPY --from=build /repo/mcp/data ./data

USER 10001:10001
EXPOSE 8080

ENV PORT=8080
ENV BAREFRAME_MCP_BASE_PATH=/v1
ENV BAREFRAME_MCP_ALLOWED_HOSTS=mcp.bareframe.dev,localhost,127.0.0.1

CMD ["node", "dist/index.js"]
