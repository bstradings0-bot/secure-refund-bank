FROM node:18-alpine
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --production
COPY . .
RUN pnpm run build
EXPOSE 4000
CMD ["node", "dist/server.js"]
