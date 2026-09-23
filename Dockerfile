# Builds the prototype in prototipo/ and serves it with nginx.
# Railway detects this Dockerfile automatically and injects $PORT.

FROM node:22-slim AS build
WORKDIR /app
COPY prototipo/package.json prototipo/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY prototipo/ ./
RUN npm run build

FROM nginx:1.27-alpine
# The official image runs envsubst on /etc/nginx/templates/*.template at startup.
COPY prototipo/deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV PORT=8080
EXPOSE 8080
