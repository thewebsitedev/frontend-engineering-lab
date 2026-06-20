# 1️⃣ Build stage
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# 2️⃣ Production stage
FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# Bind to all interfaces so the published Docker port is reachable.
ENV HOSTNAME=0.0.0.0

# Standalone output bundles a minimal server + only the deps it traces as needed.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
