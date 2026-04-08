# ── Stage 1: install dependencies ──────────────────────────────────
FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: build ────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js telemetry opt-out
ENV NEXT_TELEMETRY_DISABLED=1

# Build-time env vars (NEXT_PUBLIC_* are baked into the JS bundle)
ARG NEXT_PUBLIC_API_ROOT="/"
ARG NEXT_PUBLIC_STRIPE_PK=""
ENV NEXT_PUBLIC_API_ROOT=$NEXT_PUBLIC_API_ROOT
ENV NEXT_PUBLIC_STRIPE_PK=$NEXT_PUBLIC_STRIPE_PK

RUN npm run build

# ── Stage 3: production image ─────────────────────────────────────
FROM node:22-alpine AS runner

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only what's needed to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]
