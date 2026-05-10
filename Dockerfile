# ---- Build Stage ----
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /app

# Install dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY package.json turbo.json ./
COPY apps/api/package.json apps/api/
COPY packages/database/package.json packages/database/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/api apps/api
COPY packages packages

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build
RUN pnpm turbo run build --filter=@srb/api

# ---- Production Stage ----
FROM node:22-alpine AS runner
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/packages/database/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 4000
CMD ["node", "dist/server.js"]
