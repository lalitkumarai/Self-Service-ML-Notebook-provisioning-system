FROM node:18-alpine

# Add non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy package files first to leverage Docker layer caching
COPY package*.json ./

# Install python (required for some node-gyp packages) and production dependencies
RUN apk add --no-cache python3 make g++ && \
    npm ci --only=production && \
    apk del make g++

COPY . .

# Pre-create the notebook_data directory so appuser can write to it at runtime
# (Without this, Node.js can't create files here when running as non-root)
RUN mkdir -p /app/notebook_data && \
    chown -R appuser:appgroup /app

USER appuser


EXPOSE 5000

CMD ["npm", "start"]
