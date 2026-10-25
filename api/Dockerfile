# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
RUN groupadd -g 10001 bareframe && useradd -u 10001 -g 10001 -d /app bareframe

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY src/db/migrations ./dist/db/migrations

USER 10001:10001
EXPOSE 8080

CMD ["node", "dist/index.js"]
