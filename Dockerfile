# --- Стейдж 1: Базовая подготовка и полная сборка монорепозитория ---
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN npm install -g pnpm@10.27.0
ENV NODE_OPTIONS="--max-old-space-size=3072"
WORKDIR /app

COPY . .

# Шаг 1: Ставим зависимости
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set registry https://registry.npmmirror.com && \
    pnpm install --force --child-concurrency 1 --aggregate-output
    
# Шаг 2: Генерируем Prisma глобально в корень (или во все пакеты сразу)
# Флаг --recursive заставит prisma сгенерировать типы везде, где она импортируется
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy pnpm --filter car-api prisma:generate

# ИСПРАВЛЕНИЕ ХАКА: Чтобы типы гарантированно были доступны в libs/types, 
# выполним генерацию прямо из корня (если в schema.prisma не изменен output)
# Либо, если это не помогло, явно генерируем клиент прямо в корневой node_modules:
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npx prisma generate --schema=apps/car-api/prisma/schema.prisma

# УДАЛЕНО: Шаг 3 (с find и cp) больше не нужен, так как npx prisma generate из корня 
# положит типы в глобальный node_modules, откуда их увидят и libs/types, и apps/car-crm.

# Шаг 3: Собираем локальные библиотеки воркспейса
RUN pnpm --filter @car/types build && pnpm --filter @car/common build

# Шаг 4: Запускаем финальную сборку всех приложений
RUN pnpm run build

# --- Стейдж 2: Финальный образ для car-api ---
FROM node:22-alpine AS production-api
WORKDIR /app
ENV PATH="/pnpm:$PATH"
RUN npm install -g pnpm@10.27.0
COPY --from=base /app /app
EXPOSE 3000
CMD ["sh", "-c", "pnpm --filter car-api prisma:push && pnpm --filter car-api start"]

# --- Стейдж 3: Финальный образ для car-web ---
FROM nginx:alpine AS production-web
COPY --from=base /app/apps/car-web/dist /usr/share/nginx/html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80

# --- Стейдж 4: Финальный образ для car-crm ---
FROM nginx:alpine AS production-crm
COPY --from=base /app/apps/car-crm/dist /usr/share/nginx/html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80