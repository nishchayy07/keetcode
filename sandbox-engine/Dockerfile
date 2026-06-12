# Use lightweight base image
FROM node:20-slim

# Set non-interactive Debian frontend configuration
ENV DEBIAN_FRONTEND=noninteractive

# Install g++, python3, and essential build tools, then clean apt cache to minimize image size
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential g++ python3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency definition and lockfile
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy rest of application files
COPY . .

# Create tmp scratchpad directory and modify permissions to 777
RUN mkdir -p /app/tmp && chmod 777 /app/tmp

# Create a dedicated non-root user (UID 1000), change ownership of /app, and switch to user
RUN userdel -r node && \
    useradd -u 1000 -m sandboxuser && \
    chown -R sandboxuser:sandboxuser /app

USER 1000

# Expose server port
EXPOSE 7860

# Start Node application
CMD ["node", "server.js"]
