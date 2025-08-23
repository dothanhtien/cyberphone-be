up:
  docker compose up -d

up-rebuild:
  docker compose up -d --build

down:
  docker compose down

down-clean:
  docker compose down --volumes --rmi all --remove-orphans

prod-up:
  TARGET=prod NODE_ENV=production docker compose up --build -d
