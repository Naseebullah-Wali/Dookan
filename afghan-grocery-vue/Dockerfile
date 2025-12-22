# Multi-stage build for frontend
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Accept build arguments for environment variables
ARG VITE_API_BASE_URL=http://localhost:3000
ARG VITE_SUPPORT_EMAIL=info@dookan.af
ARG VITE_SUPPORT_PHONE=4915217735657
ARG VITE_WHATSAPP_NUMBER=4915217735657

# Set environment variables for build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SUPPORT_EMAIL=$VITE_SUPPORT_EMAIL
ENV VITE_SUPPORT_PHONE=$VITE_SUPPORT_PHONE
ENV VITE_WHATSAPP_NUMBER=$VITE_WHATSAPP_NUMBER

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
