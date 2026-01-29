COMPOSE=docker compose
DEV_FILES=-f docker-compose.yml
PROD_FILES=-f docker-compose.yml -f docker-compose.prod.yml

.PHONY: help up down build logs restart ps shell clean prod prod-down

help:
	@echo ""
	@echo "Available commands:"
	@echo "  make up          Start DEV environment"
	@echo "  make down        Stop DEV environment"
	@echo "  make build       Build DEV images"
	@echo "  make logs        Tail API logs"
	@echo "  make ps          Show running containers"
	@echo "  make shell       Shell into API container"
	@echo "  make clean       Stop + remove volumes"
	@echo ""
	@echo "  make prod        Start PROD environment"
	@echo "  make prod-down   Stop PROD environment"
	@echo ""

up:
	$(COMPOSE) $(DEV_FILES) up -d --build

down:
	$(COMPOSE) $(DEV_FILES) down

build:
	$(COMPOSE) $(DEV_FILES) build

logs:
	$(COMPOSE) $(DEV_FILES) logs -f api

ps:
	$(COMPOSE) $(DEV_FILES) ps

shell:
	$(COMPOSE) $(DEV_FILES) exec api sh

clean:
	$(COMPOSE) $(DEV_FILES) down -v

prod:
	$(COMPOSE) $(PROD_FILES) up -d --build

prod-down:
	$(COMPOSE) $(PROD_FILES) down
