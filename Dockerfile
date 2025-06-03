FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile

RUN pnpm build

EXPOSE 3000

# Use next start instead of node server.js
CMD ["pnpm", "start"]