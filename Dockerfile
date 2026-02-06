# Build stage
FROM node:24-alpine AS builder

WORKDIR /app

# 빌드 시점에 환경변수 주입받기
ARG API_BASE_URL=http://localhost:8080/api
ENV API_BASE_URL=${API_BASE_URL}

# Copy package files
COPY package.json .

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# 환경변수 확인 (빌드 로그에서 확인 가능)
RUN echo "Building with API_BASE_URL: ${API_BASE_URL}"

# Build the Expo web app (이 시점에 환경변수가 코드에 번들링됨)
RUN npx expo export --platform web

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
