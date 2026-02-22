FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies exactly as in package-lock.json
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose backend port
EXPOSE 3000

# Start server component 
CMD ["node", "src/index.js"]
