# --- Стейдж 1: Базовая подготовка и полная сборка монорепозитория ---
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Копируем абсолютно все файлы проекта ( node_modules игнорируется через .dockerignore )
COPY . .

# Устанавливаем все зависимости монорепозитория
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile

# ВАЖНО: Запускаем твой родной скрипт генерации приflow, типов и общего кода
RUN pnpm run build:all

# Собираем основные приложения (car-api, car-web, car-crm)
RUN pnpm run build

# --- Стейдж 2: Финальный образ для car-api ---
FROM node:22-alpine AS production-api
WORKDIR /app
RUN corepack enable
COPY --from=base /app /app
EXPOSE 3000
CMD ["pnpm", "--filter", "car-api", "start"]

# --- Стейдж 3: Финальный образ для car-web (Frontend) ---
FROM nginx:alpine AS production-web
COPY --from=base /app/apps/car-web/dist /usr/share/nginx/html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80

# --- Стейдж 4: Финальный образ для car-crm (Панель) ---
FROM nginx:alpine AS production-crm
COPY --from=base /app/apps/car-crm/dist /usr/share/nginx/html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80