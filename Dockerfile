# FROM node:20-alpine

# WORKDIR /app

# COPY package.json .

# RUN npm install

# COPY . .

# RUN npm run build

# EXPOSE 3000

# CMD ["npm", "run", "start"]

# # https://pnpm.io/docker
# FROM node:20-slim AS base
# ENV PNPM_HOME="/pnpm"
# ENV PATH="$PNPM_HOME:$PATH"
# RUN corepack enable
# COPY . /app
# WORKDIR /app

# FROM base AS prod-deps
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# FROM base AS build
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# RUN pnpm run build

# FROM base
# COPY --from=prod-deps /app/node_modules /app/node_modules
# # COPY --from=build /app/dist /app/dist
# EXPOSE 8000
# CMD [ "pnpm", "start" ]
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Copy necessary files and directories
COPY --from=builder /app/. .

# Set the correct permission for the .next directory
# RUN chown -R nextjs:nodejs .next

# USER nextjs

EXPOSE 3000

# Use next start instead of node server.js
CMD ["pnpm", "start"]