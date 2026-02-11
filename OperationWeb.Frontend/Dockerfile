# Stage 1: Build the React Application
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
# Install dependencies (ci is faster and cleaner for production)
RUN npm ci

# Copy source code
COPY . .

# Build Argument: API URL is required at build time for Vite
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the application (outputs to /dist)
RUN npm run build

# Stage 2: Serve the Static Files
FROM node:18-alpine
WORKDIR /app

# Install 'serve' - a static file server
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose the standard Vite port (kept as 5173 for consistency)
EXPOSE 5173

# Start command: Serve the 'dist' folder on port 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
