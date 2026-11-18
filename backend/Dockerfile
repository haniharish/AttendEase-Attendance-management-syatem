# ===================================================
# AttendEase Backend Production Image
# ===================================================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Ensure security with node environment
ENV NODE_ENV=production \
    PORT=6000

# Copy package dependency manifests
COPY package.json package-lock.json ./

# Install only production dependencies cleanly
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source files
COPY server.js ./
COPY config ./config
COPY controllers ./controllers
COPY middleware ./middleware
COPY models ./models
COPY modules ./modules
COPY routes ./routes
COPY utils ./utils

# Set permissions for the built-in non-root node user
RUN chown -R node:node /app

# Run as non-root user for container security
USER node

# Expose backend service port
EXPOSE 6000

# Container healthcheck targeting the AttendEase health endpoint
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:6000/api/health || exit 1

# Start the Express server
CMD ["npm", "start"]
