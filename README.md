# 🚀 Cyberphone

---

## Description

T.B.D

## Project setup

```bash
npm install
```

## Compile and run the project

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Docker

```bash
# up
make up

# down
make down

# down & clean up
make clean
```

## TypeORM CLI

```bash
# generate
npm run migration:generate src/database/migrations/CreateUsersTable

# run
npm run migration:run

# revert
npm run migration:revert

## inside container
docker compose exec api npm run migration:run
```

## Run tests

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```
