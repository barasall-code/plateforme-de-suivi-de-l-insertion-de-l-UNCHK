# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# URL de l'API passée en argument de build
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---- Production stage (Nginx) ----
FROM nginx:alpine AS production

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Config Nginx pour React Router (SPA - toutes routes vers index.html)
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n  gzip on;\n  gzip_types text/plain text/css application/json application/javascript;\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
