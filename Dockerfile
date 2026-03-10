# ── Stage 1: Build ──
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Allow build scripts for prisma & nestjs, then install
RUN pnpm config set enable-pre-post-scripts true && \
    pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate && \
    pnpm run build && \
    ls -la dist/

# ── Stage 2: Production ──
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 8000

CMD ["node", "dist/src/main.js"]
