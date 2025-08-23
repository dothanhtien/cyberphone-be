# 🚀 Cyberphone

---

## 🐳 Makefile Commands

| Command           | Description                             |
| ----------------- | --------------------------------------- |
| `make ensure-env` | Check `.docker.env` exists              |
| `make up`         | Start Docker Compose                    |
| `make up-rebuild` | Start Docker Compose & rebuild          |
| `make down`       | Stop Docker Compose                     |
| `make down-clean` | Stop + remove volumes/images/containers |
| `make prod-up`    | Start Docker Compose in production mode |

---

## 📦 NPM Scripts

| Script                                    | Description            |
| ----------------------------------------- | ---------------------- |
| `npm run build`                           | Build NestJS project   |
| `npm run start:dev`                       | Start with hot reload  |
| `npm run start:prod`                      | Run production server  |
| `npm run lint`                            | ESLint fix             |
| `npm run format`                          | Prettier format        |
| `npm run test`                            | Run unit tests         |
| `npm run typeorm`                         | TypeORM CLI            |
| `npm run migration:generate /path/<Name>` | Generate new migration |
| `npm run migration:run`                   | Run migrations         |
| `npm run migration:revert`                | Revert last migration  |

> Example:

```bash
npm run migration:generate src/database/migrations/CreateUsersTable
npm run migration:run
npm run migration:revert
```

---

## ⚡ Quick Start

**Dev:**

```bash
make up
```

**Prod:**

```bash
make prod-up
```

**Cleanup:**

```bash
make down-clean
```

---
