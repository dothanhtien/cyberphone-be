up:
	docker compose --env-file .docker.env up -d

up-rebuild:
	docker compose --env-file .docker.env up -d --build

down:
	docker compose --env-file .docker.env down

down-clean:
	docker compose --env-file .docker.env down --volumes --rmi all --remove-orphans

prod-up:
	TARGET=prod NODE_ENV=production docker compose --env-file .docker.env up --build -d
