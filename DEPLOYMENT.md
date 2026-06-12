# Deployment Guide

This guide covers deploying the CyberPhone backend to a Linux VPS using Docker Compose, Nginx, Let's Encrypt SSL, and GitHub Actions for CI/CD.

## Architecture

```
Internet
   │
   ▼
Nginx (80/443)          ← reverse proxy + SSL termination
   │
   ▼
NestJS API (:3000)      ← Docker container (ghcr.io/dothanhtien/cyberphone-be)
   │
   ▼
PostgreSQL (:5432)      ← Docker container (internal network only)
```

Deployments are triggered by pushing to the `deploy` branch. GitHub Actions builds the Docker image, pushes it to GitHub Container Registry (GHCR), then SSHs into the VPS to pull and restart the services.

## Prerequisites

- A Linux VPS (Ubuntu 22.04+ recommended) with at least 1 GB RAM
- A domain name with an **A record pointing to the VPS IP**
- Git and SSH access to the VPS

---

## One-Time VPS Setup

### 1. Create a dedicated deploy user

Log in as root (or any sudoer) and run:

```bash
useradd -m -s /bin/bash deploy
passwd deploy          # set a strong password, or use key-only auth and skip this

# Allow passwordless sudo for docker-only operations (optional but convenient)
# Alternatively, just add to the docker group — no sudo needed for compose commands
usermod -aG docker deploy

# Switch to the deploy user for all remaining steps
su - deploy
```

> All subsequent commands on the VPS should be run as the `deploy` user, not root.

### 2. Install Docker

```bash
# Run as root / sudoer, then switch back to deploy
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker deploy
# Log out and back in (or run: newgrp docker) for the group to take effect
```

### 3. Open firewall ports

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 4. Clone the repository

As the `deploy` user:

```bash
git clone https://github.com/dothanhtien/cyberphone-be
cd cyberphone-be
git checkout deploy
```

### 5. Create the environment file

```bash
cp .env.example .env
nano .env
```

Fill in all values. Key secrets to change:

| Variable             | How to generate                                   |
| -------------------- | ------------------------------------------------- |
| `POSTGRES_PASSWORD`  | Use a strong random password                      |
| `JWT_ACCESS_SECRET`  | `openssl rand -hex 32`                            |
| `JWT_REFRESH_SECRET` | `openssl rand -hex 32`                            |
| `COOKIE_DOMAIN`      | Your domain (e.g. `api.yourdomain.com`)           |
| `CORS_ORIGINS`       | Your frontend URL (e.g. `https://yourdomain.com`) |

Also update `CLOUDINARY_*`, `SMTP_*`, and payment gateway credentials with production values.

### 6. Issue SSL certificate

Run the initialization script once. It generates `nginx/_active.conf` (gitignored) from the `nginx/nginx.conf` template with your domain substituted, bootstraps a temporary self-signed cert so Nginx can start, then obtains a real Let's Encrypt certificate and validates the config before reloading:

```bash
chmod +x scripts/init-letsencrypt.sh
./scripts/init-letsencrypt.sh yourdomain.com admin@yourdomain.com
```

### 7. Start all services

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 8. Run database migrations and seed

```bash
# Run migrations (required on first deploy)
docker compose -f docker-compose.prod.yml exec api npm run migration:run:prod

# Create the super admin account
docker compose -f docker-compose.prod.yml exec api npm run seed:prod
```

### 9. Verify

```bash
curl https://yourdomain.com/api/health
# {"status":"ok","db":"up"}
```

---

## GitHub Actions CI/CD Setup

### 1. Generate a deploy SSH key

On your **local machine**:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/cyberphone_deploy
```

Copy the public key to the VPS **deploy user**:

```bash
ssh-copy-id -i ~/.ssh/cyberphone_deploy.pub deploy@YOUR_VPS_IP
```

### 2. Add secrets to GitHub

Go to **GitHub → repo → Settings → Secrets and variables → Actions** and add:

| Secret        | Value                                                          |
| ------------- | -------------------------------------------------------------- |
| `VPS_HOST`    | VPS IP address or hostname                                     |
| `VPS_USER`    | `deploy` (the dedicated non-root user created in setup step 1) |
| `VPS_SSH_KEY` | Contents of `~/.ssh/cyberphone_deploy` (private key)           |
| `VPS_PORT`    | SSH port — `22` unless customized                              |

### 3. About the `latest` tag

The workflow tags the image with both `:latest` and `:sha-<commit>`. The `:latest` tag is applied unconditionally — **not** gated on the default branch. This is intentional: since deployments go out via the `deploy` branch (not `main`), using `enable={{is_default_branch}}` would silently skip tagging and the VPS pull would either fail or use a stale image.

### 4. Deploy

Push to the `deploy` branch to trigger a deployment:

```bash
git push origin deploy
```

The workflow will:

1. Build the Docker image targeting the `runner` stage
2. Push `ghcr.io/dothanhtien/cyberphone-be:latest` (and `:sha-<commit>`) to GHCR
3. SSH into the VPS and pull the new image
4. Restart services with `docker compose up -d --no-build`
5. Run any pending database migrations

Monitor progress in the **Actions** tab on GitHub.

---

## Routine Operations

### View logs

```bash
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Restart a service

```bash
docker compose -f docker-compose.prod.yml restart api
```

### Run a migration manually

```bash
docker compose -f docker-compose.prod.yml exec api npm run migration:run:prod
```

### Renew SSL certificate manually

Certbot renews automatically every 12 hours. To force renewal:

```bash
docker compose -f docker-compose.prod.yml run --rm certbot renew
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### Stop all services

```bash
docker compose -f docker-compose.prod.yml down
```

### Update environment variables

1. Edit `.env` on the VPS
2. Restart the API: `docker compose -f docker-compose.prod.yml restart api`

---

## Rollback

Each deploy is also tagged by commit SHA (`ghcr.io/dothanhtien/cyberphone-be:sha-<commit>`). To roll back:

```bash
# On the VPS
docker compose -f docker-compose.prod.yml stop api
docker tag ghcr.io/dothanhtien/cyberphone-be:sha-<previous-sha> ghcr.io/dothanhtien/cyberphone-be:latest
docker compose -f docker-compose.prod.yml up -d api
```
