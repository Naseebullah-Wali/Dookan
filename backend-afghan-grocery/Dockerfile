# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev for TypeScript compilation)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Set dummy build-time environment variables for TypeScript compilation only
# These are only used during build, not at runtime
ENV NODE_ENV=production \
    JWT_SECRET=build-time-secret-not-used \
    JWT_REFRESH_SECRET=build-time-secret-not-used \
    SUPABASE_URL=https://dummy.supabase.co \
    SUPABASE_ANON_KEY=dummy \
    SUPABASE_SERVICE_KEY=dummy

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create required directories
RUN mkdir -p db uploads

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port (Render will assign PORT env var)
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["/sbin/dumb-init", "--"]

# Start application
CMD ["node", "dist/main.js"]