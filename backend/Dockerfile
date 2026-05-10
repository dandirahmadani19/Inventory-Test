# ── Stage 1: Install dependencies ──────────────────────────────────────────
FROM node:20-alpine AS deps
# Install openssl — required by Prisma engine on Alpine (musl libc)
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && cp -r node_modules /tmp/prod_modules
RUN npm ci

# ── Stage 2: Development (hot reload) ──────────────────────────────────────
FROM node:20-alpine AS development
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "dev"]

# ── Stage 3: Build TypeScript ───────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ── Stage 4: Production (minimal image) ────────────────────────────────────
FROM node:20-alpine AS production
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /tmp/prod_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Create log directory
RUN mkdir -p log && chown -R node:node /app
USER node

EXPOSE 3001
CMD ["node", "dist/server.js"]
