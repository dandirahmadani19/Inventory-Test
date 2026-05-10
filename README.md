# Real-time Inventory Control Center
### mGanik Technical Assignment — Software Engineer

Fullstack application untuk admin gudang memantau dan mengelola stok barang secara real-time, dengan proteksi race condition menggunakan pessimistic locking.

---

## Tech Stack

| Side | Stack |
|------|-------|
| **Backend** | Node.js 20 + TypeScript + Express + Prisma + PostgreSQL |
| **Frontend** | Next.js 14 (App Router) + TypeScript + TanStack Query + Zustand + Tailwind CSS |
| **Testing** | Jest + Supertest (BE) · Vitest + React Testing Library (FE) |
| **API Docs** | Swagger UI (`/api/docs`) |
| **Container** | Docker + Docker Compose |

---

## Prerequisites

- Node.js 20 LTS
- PostgreSQL 14+ (atau Docker)
- npm 10+

---

## 🚀 Cara Menjalankan (Tanpa Docker)

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd mganik-test
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env — isi DATABASE_URL dengan koneksi PostgreSQL kamu

# Generate Prisma client & jalankan migration
npm run db:generate
npm run db:migrate

# Seed data awal
npm run db:seed

# Jalankan dev server
npm run dev
```

Backend berjalan di: **http://localhost:3001**  
Swagger UI: **http://localhost:3001/api/docs**

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.local.example .env.local

# Jalankan dev server
npm run dev
```

Frontend berjalan di: **http://localhost:3000**

---

## 🐳 Cara Menjalankan (Dengan Docker)

```bash
# Di root project
cp .env.docker .env.docker  # sudah ada nilainya, bisa langsung pakai

# Jalankan semua services (DB + Backend + Frontend)
docker compose up --build

# Atau jalankan di background (detached mode)
docker compose up --build -d

# Setelah services up, jalankan migration & seed
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run db:seed
```

> **Detached mode** (`-d`): services berjalan di background, terminal tetap bebas digunakan. Gunakan perintah berikut untuk memantau log:
> ```bash
> docker compose logs -f           # semua services
> docker compose logs -f backend   # hanya backend
> docker compose logs -f frontend  # hanya frontend
> ```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Swagger UI | http://localhost:3001/api/docs |
| PostgreSQL | localhost:5432 |

**Stop:**
```bash
docker compose down          # stop services, keep DB data
docker compose down -v       # stop + hapus volume DB (reset data)
```

---

## 🧪 Menjalankan Tests

### Backend — Race Condition Test

```bash
cd backend
npm test
```

Test ini mensimulasikan 2 concurrent requests yang mencoba mengurangi stok secara bersamaan. Memverifikasi bahwa pessimistic locking mencegah overselling.

### Frontend — Component Tests

```bash
cd frontend
npm test
```

Test ini memverifikasi bahwa tombol "Reduce Stock" merender dengan benar dan memicu fungsi yang tepat saat diklik.

---

## 📖 API Documentation

Swagger UI tersedia di: **http://localhost:3001/api/docs**

### Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/inventory/report` | Ambil semua produk dengan kategori (eager load) |
| `PATCH` | `/api/inventory/:id/reduce` | Kurangi stok produk (dengan DB transaction + lock) |
| `GET` | `/health` | Health check |

---

## 📁 Struktur Folder

```
mganik-test/
├── backend/                    # Express API (Clean Architecture)
│   ├── src/
│   │   ├── domain/             # Entities + Repository interfaces
│   │   ├── application/        # Use cases + DTOs + Custom errors
│   │   ├── infrastructure/     # Prisma repos + Logger + Swagger config
│   │   └── presentation/       # HTTP handlers + Middlewares + Routes
│   ├── prisma/                 # Schema + Migrations + Seed
│   ├── log/                    # Daily rotating log files
│   └── tests/                  # Concurrent request tests
├── frontend/                   # Next.js App Router
│   ├── app/
│   │   ├── features/inventory/ # Components + Hooks + Store
│   │   ├── lib/                # Axios instance
│   │   └── shared/types/       # Shared TypeScript interfaces
│   └── tests/                  # Component tests
├── docker-compose.yml
├── docker-compose.override.yml # Dev hot reload
└── .env.docker
```

---

## 🔐 Fitur Utama

- **Concurrency-safe stock reduction** — menggunakan `SELECT FOR UPDATE` dalam Prisma transaction
- **Auto StockLog** — setiap operasi reduce otomatis tercatat di tabel `stock_logs`
- **Daily rotating logs** — file `backend/log/app-YYYY-MM-DD.log`
- **Swagger documentation** — semua endpoint terdokumentasi di `/api/docs`
- **Centralized error handling** — error codes yang konsisten (`INSUFFICIENT_STOCK`, `CONCURRENCY_ERROR`, dsb)
- **Low stock indicator** — produk dengan stok ≤ 5 di-highlight di UI
- **Real-time UI update** — React Query auto-refetch setiap 30 detik
