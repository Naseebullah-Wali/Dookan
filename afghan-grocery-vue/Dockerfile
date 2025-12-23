# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Accept build arguments for Vite
ARG VITE_API_BASE_URL=http://localhost:3000
ARG VITE_SUPABASE_URL=
ARG VITE_SUPABASE_ANON_KEY=
ARG VITE_SUPPORT_EMAIL=info@dookan.af
ARG VITE_SUPPORT_PHONE=4915217735657
ARG VITE_WHATSAPP_NUMBER=4915217735657

# Set environment variables for build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
ENV VITE_SUPPORT_EMAIL=${VITE_SUPPORT_EMAIL}
ENV VITE_SUPPORT_PHONE=${VITE_SUPPORT_PHONE}
ENV VITE_WHATSAPP_NUMBER=${VITE_WHATSAPP_NUMBER}

# Build application
RUN npm run build

# Production stage - nginx
FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 --start-period=10s \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]