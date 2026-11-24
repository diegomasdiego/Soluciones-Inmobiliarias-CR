# Builds the site in prototipo/ (Next.js) and runs it as a small Node server.
# Railway detects this Dockerfile automatically and injects $PORT.
#
# Database (Convex, project soluciones-inmobiliarias-cr):
# - The site always connects to the production deployment in NEXT_PUBLIC_CONVEX_URL (a public URL).
# - If CONVEX_DEPLOY_KEY (a Production deploy key) is set as a Railway variable, the build also
#   deploys the Convex functions. If that step fails, the build logs a warning and still ships
#   the site against the functions already in production (deploy them with `npx convex deploy`).
# - NEXT_PUBLIC_SITE_URL is the public address used in canonical links, link previews and the
#   sitemap. Change it here or as a Railway variable when the site moves to its own domain.

FROM node:22-slim AS build
WORKDIR /app
COPY prototipo/package.json prototipo/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY prototipo/ ./
ARG CONVEX_DEPLOY_KEY
ARG NEXT_PUBLIC_CONVEX_URL=https://modest-dogfish-981.convex.cloud
ARG NEXT_PUBLIC_SITE_URL=https://soluciones-inmobiliarias-cr-production.up.railway.app
ENV NEXT_PUBLIC_CONVEX_URL=$NEXT_PUBLIC_CONVEX_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN if [ -n "$CONVEX_DEPLOY_KEY" ] && npx convex deploy --cmd "npm run build" --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL; then \
      echo "Convex functions deployed and site built."; \
    else \
      echo "WARNING: Convex deploy skipped or failed (see above). Building the site against $NEXT_PUBLIC_CONVEX_URL." && npm run build; \
    fi

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0
# The standalone server plus the files it serves as they are: build assets, photos, icons.
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 8080
CMD ["node", "server.js"]
