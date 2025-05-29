FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package.json pnpm-lock.yaml* postinstall.js ./
RUN pnpm install --frozen-lockfile
RUN node postinstall.js

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

# Copy necessary files and directories
COPY --from=builder /app/. .

# Set the correct permission for the .next directory
# RUN chown -R nextjs:nodejs .next

# USER nextjs

EXPOSE 3000

# Use next start instead of node server.js
CMD ["pnpm", "start"]