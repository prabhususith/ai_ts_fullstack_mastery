# Volume 01: Docker Local Quickstart Guide (Dev & Prod)

**Target Audience:** DevSecOps Engineers, AI Full-Stack Developers, Cloud Architects  
**Stack Components:** Node.js 20+ Express (TypeScript), React 18+ (Vite), `ankane/pgvector:latest`, `redis:7-alpine`

---

## 1. Quickstart Commands Overview

| Environment | Compose File | Primary Ports | Hot-Reloading |
| :--- | :--- | :--- | :--- |
| **Development** | `docker-compose.dev.yml` | Frontend: `5173`, Backend: `4000`, Postgres: `5432`, Redis: `6379` | **Enabled** (`tsx watch` + Vite HMR) |
| **Production** | `docker-compose.yml` | Frontend: `80`/`8080`, Backend: `4000`, Postgres: `5432`, Redis: `6379` | **Disabled** (Nginx SPA + compiled JS) |

---

## 2. Running the Development Stack with Live Hot-Reloading

The development configuration mounts local source trees into containers using bind-mounts. Changes to backend TypeScript files trigger instant `tsx watch` incremental reloads, while changes to React JSX/TSX trigger instant Vite Hot Module Replacement (HMR).

### Step 1: Launch Development Stack
```bash
# Build dev images and start all 4 services in the foreground
docker compose -f docker-compose.dev.yml up --build

# Or run in detached background mode:
docker compose -f docker-compose.dev.yml up -d --build
```

### Step 2: Validate Service Health
```bash
# Verify container states and healthchecks
docker compose -f docker-compose.dev.yml ps

# Inspect live streaming logs
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f frontend
```

### Step 3: Access Development Endpoints
- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Backend API Health:** [http://localhost:4000/api/health](http://localhost:4000/api/health)
- **PostgreSQL pgvector:** `localhost:5432` (`postgres` / `postgrespassword`)
- **Redis CLI:** `docker exec -it ai_redis_cache_dev redis-cli ping`

### Step 4: Tear Down Dev Environment
```bash
# Stop containers and preserve volumes
docker compose -f docker-compose.dev.yml down

# Stop containers and purge volumes:
docker compose -f docker-compose.dev.yml down -v
```

---

## 3. Running the Production-Hardened Stack

The production stack uses multi-stage builds (`Dockerfile.backend` and `Dockerfile.frontend`) with non-root security contexts (`USER node`, `USER nginx`), minimal runtime footprints (Alpine Linux), and Nginx reverse proxying.

### Step 1: Build & Launch Production Stack
```bash
# Build multi-stage production images and launch
docker compose up -d --build
```

### Step 2: Verify Production Healthchecks
```bash
docker compose ps
```
Expected output:
```
NAME                IMAGE                    COMMAND                  SERVICE      STATUS
ai_backend_prod     ai-ts-fullstack-backend  "node dist/server.js"    backend      Up (healthy)
ai_frontend_prod    ai-ts-fullstack-frontend "/docker-entrypoint.…"   frontend     Up (healthy)
ai_pgvector_db      ankane/pgvector:latest   "docker-entrypoint.s…"   postgres     Up (healthy)
ai_redis_cache      redis:7-alpine           "docker-entrypoint.s…"   redis        Up (healthy)
```

### Step 3: Test Production Ingress & API
```bash
# Query Nginx health endpoint
curl -i http://localhost/healthz

# Query Backend through Nginx reverse proxy
curl -i http://localhost/api/health

# Trigger Semantic Vector Cache Health Check
curl -i http://localhost/api/admin/health
```

### Step 4: Inspect Container Resource Consumption
```bash
docker stats --no-stream
```
