# ===================================================
# Stage 1: Build React Vite Application
# ===================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package dependency manifests
COPY package.json package-lock.json ./

# Clean install all dependencies (including build devDependencies)
RUN npm ci

# Copy frontend source code and configuration
COPY . .

# Set default production API base URL (routes via Nginx reverse proxy)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build optimized production bundle
RUN npm run build

# ===================================================
# Stage 2: Serve Production Assets with Nginx
# ===================================================
FROM nginx:1.27-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration with reverse proxy support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check to ensure Nginx is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
