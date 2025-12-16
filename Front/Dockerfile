FROM node:20-alpine AS dev
WORKDIR /app

# Dépendances pour le serveur de dev
COPY package*.json ./
RUN npm ci

COPY frontend ./frontend

# Créer un utilisateur non-root
RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 5000
ENV NODE_ENV=development
# Lance le serveur statique de dev
CMD ["npm", "run", "dev"]

# ------------ Target production (build + nginx) ------------
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY frontend ./frontend

FROM nginx:1.27-alpine AS prod
# Config Nginx (proxy /api vers backend, fallback SPA)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend /usr/share/nginx/html
EXPOSE 80

