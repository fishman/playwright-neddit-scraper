FROM node:22-alpine@sha256:5539840ce9d013fa13e3b9814c9353024be7ac75aca5db6d039504a56c04ea59 as builder
WORKDIR /app

RUN apk add --no-cache git python3 make g++ && \
  corepack enable && \
  corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build && pnpm prune --prod

FROM node:22-alpine@sha256:5539840ce9d013fa13e3b9814c9353024be7ac75aca5db6d039504a56c04ea59
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('bullmq').createClient({ connection: { host: process.env.REDIS_HOST } }).ping().then(() => process.exit(0)).catch(() => process.exit(1))"

USER node
CMD ["node", "--enable-source-maps", "dist/workers/redditWorker.js"]
