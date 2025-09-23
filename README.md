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
docker compose --env-file docker.env up -d

# down
docker compose --env-file docker.env down

# down & clean up
docker compose --env-file docker.env down --volumes --rmi all --remove-orphans
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
