# Builds the prototype in prototipo/ and serves it with nginx.
# Railway detects this Dockerfile automatically and injects $PORT.
#
# Database (Convex, project soluciones-inmobiliarias-cr):
# - The site always connects to the production deployment in VITE_CONVEX_URL (a public URL).
# - If CONVEX_DEPLOY_KEY (a Production deploy key) is set as a Railway variable, the build also
#   deploys the Convex functions. If that step fails, the build logs a warning and still ships
#   the site against the functions already in production (deploy them with `npx convex deploy`).

FROM node:22-slim AS build
WORKDIR /app
COPY prototipo/package.json prototipo/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY prototipo/ ./
ARG CONVEX_DEPLOY_KEY
ARG VITE_CONVEX_URL=https://modest-dogfish-981.convex.cloud
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL
RUN if [ -n "$CONVEX_DEPLOY_KEY" ] && npx convex deploy --cmd "npm run build" --cmd-url-env-var-name VITE_CONVEX_URL; then \
      echo "Convex functions deployed and site built."; \
    else \
      echo "WARNING: Convex deploy skipped or failed (see above). Building the site against $VITE_CONVEX_URL." && npm run build; \
    fi

FROM nginx:1.27-alpine
# The official image runs envsubst on /etc/nginx/templates/*.template at startup.
COPY prototipo/deploy/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV PORT=8080
EXPOSE 8080
