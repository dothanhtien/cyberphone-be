.PHONY: up up-rebuild down down-clean prod-up ensure-env

ensure-env:
	@test -f .docker.env || { echo "Missing .docker.env. Copy .docker.env.example and set values."; exit 1; }

up: ensure-env
	docker compose --env-file .docker.env up -d

up-rebuild: ensure-env
	docker compose --env-file .docker.env up -d --build

down: ensure-env
	docker compose --env-file .docker.env down

down-clean: ensure-env
	docker compose --env-file .docker.env down --volumes --rmi all --remove-orphans
prod-up: ensure-env
	TARGET=prod NODE_ENV=production docker compose --env-file .docker.env up --build -d
