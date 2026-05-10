# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Real-time Inventory Control Center — a fullstack app for warehouse admins to monitor and manage stock, with race condition protection via pessimistic locking.

## Development Commands

### Backend (`cd backend`)

```bash
npm run dev          # Start dev server with hot reload (ts-node-dev)
npm run build        # Compile TypeScript to dist/
npm run start        # Run compiled production build
npm test             # Run Jest tests (--runInBand for sequential execution)

npm run db:migrate   # Run Prisma migrations (dev)
npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:seed      # Seed initial data (ts-node prisma/seed.ts)
npm run db:studio    # Open Prisma Studio GUI
```

Backend runs on **http://localhost:3001** · Swagger UI at **http://localhost:3001/api/docs**

### Frontend (`cd frontend`)

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm run lint         # ESLint
npm test             # Vitest (single run)
npm run test:watch   # Vitest watch mode
```

Frontend runs on **http://localhost:3000**

### Docker (from project root)

```bash
docker compose up --build
# After first start:
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run db:seed

docker compose down        # Stop, keep DB data
docker compose down -v     # Stop + wipe DB volume
```

Note: Docker Compose maps PostgreSQL to host port **5433** (not 5432) to avoid local conflicts.

## Architecture

### Backend — Clean Architecture

Layers flow strictly inward: `presentation → application → domain`, with `infrastructure` implementing domain interfaces.

```
src/
├── domain/           # Entities + repository interfaces (no deps)
├── application/      # Use cases, DTOs (Zod), custom errors
├── infrastructure/   # Prisma repos, Winston logger, Swagger config
└── presentation/     # Express handlers, routes, middlewares
```

Dependency injection is **manual**: `inventory.routes.ts` wires repositories → use cases → handler. No DI container.

### Key Backend Pattern — Pessimistic Locking

`ReduceStockUseCase` runs inside `prisma.$transaction()`. It issues a raw `SELECT ... FOR UPDATE` to lock the row before decrementing, preventing overselling under concurrent requests. The `reduceStockWithLock` method on `IProductRepository` exists for interface compliance but the actual lock logic lives in the use case, not the repository.

### Frontend — Feature-Sliced Structure

```
app/
├── features/inventory/
│   ├── components/   # InventoryTable, ReduceStockModal, StockSyncIndicator
│   ├── hooks/        # useInventory (TanStack Query), useReduceStock
│   └── store/        # Zustand store for sync status (idle/loading/success/error)
├── lib/              # Axios instance (base URL from NEXT_PUBLIC_API_URL)
└── shared/types/     # Shared TypeScript interfaces (Product, ApiListResponse, etc.)
```

**State split**: server state (product list) lives in TanStack Query with 30s stale/refetch interval; UI transient state (modal open, operation status) lives in Zustand.

### API Response Shape

All endpoints return `{ success: boolean, data: ..., meta?: ... }` on success and `{ success: false, errorCode: string, message: string }` on error. Error codes are defined in `backend/src/shared/constants/error-codes.ts`: `VALIDATION_ERROR`, `NOT_FOUND`, `INSUFFICIENT_STOCK`, `CONCURRENCY_ERROR`, `INTERNAL_ERROR`.

Low-stock threshold is **5** units (constant exported from `error-codes.ts`).

### Database Schema

Three models: `Category` → `Product` (many-to-one) → `StockLog` (one-to-many). `StockLog.change` is negative for reductions. Prisma maps snake_case columns to camelCase fields.

## Environment Setup

Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL`. Frontend reads `NEXT_PUBLIC_API_URL` from `frontend/.env.local` (copy from `.env.local.example`).

## Testing Notes

- Backend test (`tests/inventory/reduce-stock.concurrent.test.ts`) fires two concurrent PATCH requests against a live DB to verify the pessimistic lock prevents overselling. Requires a running database — set `DATABASE_URL` in `.env` before running.
- Frontend tests use Vitest + jsdom + React Testing Library. Path alias `@` maps to `./app`.
