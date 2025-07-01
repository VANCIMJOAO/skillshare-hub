FROM node:18-slim

# Install Python, build tools and pnpm
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g pnpm@8

WORKDIR /app

# Copy root package files and workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY .npmrc ./

# Copy app package files
COPY apps/api/package.json ./apps/api/

# Install dependencies with network error handling
RUN pnpm install --frozen-lockfile --prefer-offline || \
    (sleep 5 && pnpm install --frozen-lockfile --prefer-offline) || \
    (sleep 10 && pnpm install --frozen-lockfile)

# Copy source code
COPY apps/api/ ./apps/api/

# Build the application
WORKDIR /app/apps/api
RUN pnpm run build

# List dist directory for debugging
RUN ls -la dist/ || echo "No dist directory found"

# Remove dev dependencies
RUN pnpm prune --prod

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["pnpm", "run", "start:prod"]
