# --- Стейдж 1: Базовая подготовка и полная сборка монорепозитория ---
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Устанавливаем ровно ту версию pnpm, которая стоит у тебя локально на Fedora
RUN npm install -g pnpm@10.27.0

# Выделяем память под сборку
ENV NODE_OPTIONS="--max-old-space-size=3072"

WORKDIR /app

# Копируем исходный код
COPY . .

# Шаг 1: Установка зависимостей. v10 сама автоматически применит onlyBuiltDependencies из package.json!
# Шаг 1: Ставим зависимости и принудительно мигрируем локфайл под pnpm v10
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm config set registry https://registry.npmmirror.com && \
    pnpm install --force --child-concurrency 1 --aggregate-output
    
    # Шаг 2: Генерируем типы Prisma с фейковой строкой подключения для прохождения валидации
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy pnpm --filter car-api prisma:generate

# Шаг 3: Синхронизируем сгенерированный клиент Prisma по всему воркспейсу, чтобы vue-tsc на фронтенде видел енамы
RUN find node_modules -type d -name ".prisma" -exec cp -R apps/car-api/node_modules/.prisma/client {}/ \; 2>/dev/null || true

# Шаг 4: Собираем локальные библиотеки воркспейса
RUN pnpm --filter @car/types build && pnpm --filter @car/common build

# Шаг 5: Запускаем финальную сборку всех приложений
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