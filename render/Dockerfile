FROM mcr.microsoft.com/playwright:v1.52.0-jammy

WORKDIR /app

RUN groupadd --gid 10001 bareframe && useradd --uid 10001 --gid bareframe --create-home bareframe

COPY api/package.json api/package-lock.json ./api/
COPY packages/designer-core/package.json ./packages/designer-core/
COPY packages/flow-map-engine/package.json ./packages/flow-map-engine/

RUN cd packages/designer-core && npm install && npm run build \
  && cd ../flow-map-engine && npm install && npm run build \
  && cd ../../api && npm install --omit=dev

COPY packages/designer-core ./packages/designer-core
COPY packages/flow-map-engine ./packages/flow-map-engine
COPY api ./api

RUN cd api && npm run build

USER 10001
ENV NODE_ENV=production
CMD ["node", "api/dist/render/worker.js"]
