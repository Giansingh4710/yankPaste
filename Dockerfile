# ---- Base Stage: shared workdir + package manifests ----
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- Dependencies Stage: production-only node_modules ----
FROM base AS deps
RUN npm ci --omit=dev

# ---- Build Stage: compile the client assets ----
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# ---- Final Stage: run the app ----
FROM base AS final
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY . .

# uploads/ is a mounted volume in production; create it so it exists otherwise.
RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD [ "npm", "start" ]
