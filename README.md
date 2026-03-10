# Retailer Sales Representative — Backend API

A scalable backend API built with **NestJS**, **PostgreSQL** (via Prisma), and **Redis** for managing Sales Representatives, Retailers, and geographical data across Bangladesh.

---

## Tech Stack

| Layer        | Technology              |
|-------------|-------------------------|
| Runtime     | Node.js 20              |
| Framework   | NestJS 11               |
| Database    | PostgreSQL 16           |
| ORM         | Prisma 7                |
| Cache       | Redis 7 (via ioredis)   |
| Auth        | JWT (Passport)          |
| Docs        | Swagger / OpenAPI       |
| Tests       | Jest                    |
| Container   | Docker + docker-compose |

---

## Quick Start

### Prerequisites

- Node.js ≥ 20, pnpm
- PostgreSQL 16
- Redis 7

### Local Setup

```bash
# 1. Clone & install
git clone https://github.com/protickr/manush-assignment.git
cd manush-assignment
pnpm install

# 2. Configure environment
cp .env.example .env   # or edit .env directly
# DATABASE_URL, REDIS_HOST, JWT_SECRET, etc.

# 3. Run migrations & seed
npx prisma db push
npx prisma db seed

# 4. Start dev server
pnpm run dev
# → http://localhost:8000
# → Swagger: http://localhost:8000/api-docs
```

### Docker Setup

```bash
docker-compose up --build
# → App: http://localhost:8000
# → Swagger: http://localhost:8000/api-docs

# Run migrations & seed inside the container
docker-compose exec app npx prisma db push
docker-compose exec app npx prisma db seed
```

---

## Seed Data Credentials

| Role  | Phone         | Password  |
|-------|---------------|-----------|
| Admin | 01700000000   | admin123  |
| SR 1  | 01711111111   | sr123456  |
| SR 2  | 01722222222   | sr123456  |

---

## API Endpoints

### Auth
| Method | Endpoint       | Auth | Description            |
|--------|---------------|------|------------------------|
| POST   | `/auth/login` | —    | Login & receive JWT    |

### Users (Admin)
| Method | Endpoint      | Auth  | Description       |
|--------|--------------|-------|-------------------|
| POST   | `/users`     | Admin | Create user       |
| GET    | `/users`     | Admin | List all users    |
| GET    | `/users/:id` | Admin, SR | Get user by ID |
| PATCH  | `/users/:id` | Admin | Update user       |
| DELETE | `/users/:id` | Admin | Soft-delete user  |

### Regions (Admin)
| Method | Endpoint        | Auth  | Description        |
|--------|----------------|-------|--------------------|
| POST   | `/regions`     | Admin | Create region      |
| GET    | `/regions`     | Admin | List all regions   |
| GET    | `/regions/:id` | Admin | Get region by ID   |
| PATCH  | `/regions/:id` | Admin | Update region      |
| DELETE | `/regions/:id` | Admin | Delete region      |

### Areas (Admin)
| Method | Endpoint      | Auth  | Description      |
|--------|--------------|-------|------------------|
| POST   | `/areas`     | Admin | Create area      |
| GET    | `/areas`     | Admin | List all areas   |
| GET    | `/areas/:id` | Admin | Get area by ID   |
| PATCH  | `/areas/:id` | Admin | Update area      |
| DELETE | `/areas/:id` | Admin | Delete area      |

### Territories (Admin)
| Method | Endpoint            | Auth  | Description          |
|--------|---------------------|-------|----------------------|
| POST   | `/territories`     | Admin | Create territory     |
| GET    | `/territories`     | Admin | List all territories |
| GET    | `/territories/:id` | Admin | Get territory by ID  |
| PATCH  | `/territories/:id` | Admin | Update territory     |
| DELETE | `/territories/:id` | Admin | Delete territory     |

### Distributors (Admin)
| Method | Endpoint             | Auth  | Description           |
|--------|---------------------|-------|-----------------------|
| POST   | `/distributors`     | Admin | Create distributor    |
| GET    | `/distributors`     | Admin | List all distributors |
| GET    | `/distributors/:id` | Admin | Get distributor by ID |
| PATCH  | `/distributors/:id` | Admin | Update distributor    |
| DELETE | `/distributors/:id` | Admin | Delete distributor    |

### Retailers
| Method | Endpoint                   | Auth     | Description                              |
|--------|---------------------------|----------|------------------------------------------|
| POST   | `/retailers`              | Admin    | Create retailer                          |
| GET    | `/retailers`              | Admin, SR | List retailers (paginated, filterable)  |
| GET    | `/retailers/my`           | SR       | List only assigned retailers             |
| GET    | `/retailers/:id`          | Admin, SR | Get retailer details                    |
| PATCH  | `/retailers/:id`          | Admin    | Update retailer (all fields)             |
| PATCH  | `/retailers/:id/sr-update`| SR       | Update Points, Routes, Notes only        |
| DELETE | `/retailers/:id`          | Admin    | Delete retailer                          |
| POST   | `/retailers/bulk-assign`  | Admin    | Bulk assign retailers to SR              |
| POST   | `/retailers/bulk-unassign`| Admin    | Bulk unassign retailers                  |
| POST   | `/retailers/import-csv`   | Admin    | Bulk import retailers from CSV           |

**Query Parameters** for `GET /retailers` and `GET /retailers/my`:
- `page`, `limit` — pagination
- `search` — search by name, UID, or phone
- `regionId`, `areaId`, `territoryId`, `distributorId` — filters

---

## Running Tests

```bash
pnpm run test          # run all tests
pnpm run test:cov      # with coverage
```

15 unit tests across 3 suites: AuthService, LocationsService, RetailersService.

---

## Project Structure

```
src/
├── cache/                    # Redis service (global)
├── common/                   # Global exception filter
├── config/                   # Config loaders (redis, server, jwt)
├── database/                 # Prisma service & module
├── modules/
│   ├── auth/                 # JWT auth, guards, roles
│   ├── users/                # User CRUD
│   ├── locations/            # Region → Area → Territory CRUD
│   │   ├── controllers/      # Separate controller per entity
│   │   └── dto/              # DTOs with class-validator
│   ├── distributors/         # Distributor CRUD
│   └── retailers/            # Retailer CRUD, SR endpoints, CSV import
├── app.module.ts
└── main.ts                   # Bootstrap + Swagger setup
```

---

## Scaling Approach

This backend is designed to handle ~1 million retailers with fast queries for SRs who only need ~70 records each:

1. **Denormalized Geography**: The `retailers` table stores `region_id`, `area_id`, and `territory_id` directly (resolved from the hierarchy on write). This allows flat, indexed queries like `WHERE assigned_sr_id = ? AND region_id = ?` without expensive SQL JOINs at read time.

2. **Composite Indexes**: The database has composite indexes on `(assigned_sr_id, region_id)`, `(assigned_sr_id, area_id)`, etc. — specifically optimized for the SR filter+list workload.

3. **Redis Caching**: Individual retailer details are cached in Redis with automatic invalidation on mutation. For the SR list view (~70 records), the DB query is already very fast due to indexes, but cache can be layered for hot paths.

4. **Batch CSV Import**: Large retailer imports use Node.js streams (no full-file buffering) and Prisma `createMany` in batches of 1,000, keeping memory flat even for 100k+ row files. Geography resolution is done from an in-memory cache built before the import begins.

5. **Horizontal Scaling**: The app is stateless (JWT + Redis for session-less auth and caching). Multiple app instances can be deployed behind a load balancer. PostgreSQL read replicas can handle read-heavy SR workloads. For very large imports, the CSV processing can be offloaded to a BullMQ background queue.

---

## License

MIT
