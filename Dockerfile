# Builds the prototype in prototipo/ and serves it with nginx.
# Railway detects this Dockerfile automatically and injects $PORT.
#
# Database (Convex): set CONVEX_DEPLOY_KEY (a Production deploy key from the Convex dashboard)
# as a Railway variable. The build then deploys the Convex functions and compiles the site
# with the production VITE_CONVEX_URL. Without the key, the site builds with sample listings.

FROM node:22-slim AS build
WORKDIR /app
COPY prototipo/package.json prototipo/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY prototipo/ ./
ARG CONVEX_DEPLOY_KEY
RUN if [ -n "$CONVEX_DEPLOY_KEY" ]; then \
      npx convex deploy --cmd "npm run build" --cmd-url-env-var-name VITE_CONVEX_URL; \
    else \
      echo "CONVEX_DEPLOY_KEY not set: building with sample listings" && npm run build; \
    fi

FROM nginx:1.27-alpine
# The official image runs envsubst on /etc/nginx/templates/*.template at startup.
COPY prototipo/deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV PORT=8080
EXPOSE 8080
