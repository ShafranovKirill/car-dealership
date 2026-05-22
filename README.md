# Car

Car is a modern car dealership management system with a CRM system built on the pnpm monorepo. The product is currently in development.

> **Work in progress.** Most of the system is not production-ready yet.

## Tech Stack

### Backend

NestJS, Prisma, PostgreSQL, JWT, Argon2, MinIO, Full test setup with Jest and Testcontainers

### Frontend

Vue 3, Pinia, Vue Router, Vite, TypeScript, Tailwind CSS

### Monorepo

Pnpm workspace

### Applications:

- apps/car-api
- apps/car-web

## Development

```bash
# Install dependencies:
npm install

# Start application:
pnpm build
```

## Testing

```bash
# Unit tests:
pnpm test


# Static checks:
pnpm audit
pnpm run lint
```

## CI

GitHub Actions run audit, linting, typechecking, unit tests, and build checks.
Triggered on pull requests and pushes to main and develop branches.
