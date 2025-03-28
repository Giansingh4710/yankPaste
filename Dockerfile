# ---- Base Stage: Install dependencies ----
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./

# ---- Dependencies Stage ----
FROM base AS deps
RUN npm ci --production

# ---- Build Stage: Compile assets ----
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# ---- Final Stage: Run the app ----
FROM base AS final
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY . .

# Set environment variables
ENV PORT=3000
EXPOSE 3000

# CMD [ "ls" ]
CMD [ "npm", "start" ]
