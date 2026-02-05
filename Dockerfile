# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json .

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the Expo web app
RUN npx expo export --platform web

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
