FROM node:20-alpine AS deps
WORKDIR /app

# Installer les dépendances (dev incluses pour la target dev)
COPY package*.json ./
RUN npm ci

# ------------ Target développement ------------
FROM node:20-alpine AS dev
WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -S app && adduser -S app -G app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN chown -R app:app /app
USER app

ENV NODE_ENV=development
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ------------ Target production ------------
FROM node:20-alpine AS prod
WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -S app && adduser -S app -G app

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY . .

RUN chown -R app:app /app
USER app

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]

