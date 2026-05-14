FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# Copy everything
COPY . .

# Install all dependencies (no --production flag - we need devDeps for build)
RUN pnpm install --no-frozen-lockfile

# Generate Prisma client
RUN cd packages/database && npx prisma generate

# Build the API
RUN pnpm --filter @srb/api build

EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]
