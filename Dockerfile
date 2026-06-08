# --- Стейдж 1: Базовая подготовка и установка зависимостей ---
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Копируем файлы конфигурации монорепозитория
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Копируем исходный код всех приложений и пакетов для сборки типов
COPY apps ./apps
COPY packages ./packages

# Сборка зависимостей
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Собираем все проекты (генерация типов, prisma client, dist и т.д.)
RUN pnpm build

# --- Стейдж 2: Финальный образ для car-api ---
FROM node:20-alpine AS production-api
WORKDIR /app
RUN corepack enable
COPY --from=base /app /app
EXPOSE 3000
CMD ["pnpm", "--filter", "car-api", "start"]

# --- Стейдж 3: Финальный образ для car-web (фронтенд) ---
FROM nginx:alpine AS production-web
# Копируем собранную статику фронта в nginx-контейнер
COPY --from=base /app/apps/car-web/dist /usr/share/nginx/html
# Дефолтный конфиг для SPA, чтобы работал роутинг Vue/Vite
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80

# --- Стейдж 4: Финальный образ для car-crm ---
FROM nginx:alpine AS production-crm
COPY --from=base /app/apps/car-crm/dist /usr/share/nginx/html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80