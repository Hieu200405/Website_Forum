# Stage 1: Build React App with Vite
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
# Optionally, if you have .env.production you could copy it here for VITE variables
RUN npm run build

# Stage 2: Serve React App with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Replace standard nginx default config with SPA config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
