# ==============================================================================
# Node.js 22 LTS Multi-Stage Build for Enterprise AI Backend
# 100% Strict TypeScript
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json tsconfig.json ./
RUN npm install

COPY src/ ./src/
RUN npm run build

# Production Runner
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5000

USER node

CMD ["node", "dist/server.js"]
