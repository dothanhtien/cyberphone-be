#!/usr/bin/env bash
# First-time SSL certificate issuance via Let's Encrypt + Certbot.
#
# Usage (run from project root on VPS):
#   chmod +x scripts/init-letsencrypt.sh
#   ./scripts/init-letsencrypt.sh yourdomain.com admin@yourdomain.com
#
# Prerequisites:
#   - DNS A record points to this server's IP
#   - Ports 80 and 443 are open in the firewall
#   - .env file is in place (copied from .env.example)
#   - Docker + Docker Compose are installed

set -euo pipefail

DOMAIN=${1:?Usage: $0 <domain> <email>}
EMAIL=${2:?Usage: $0 <domain> <email>}
CERTBOT_CONF="./certbot/conf"
CERTBOT_WWW="./certbot/www"

echo ">>> [1/7] Preparing directories..."
mkdir -p "$CERTBOT_CONF/live/$DOMAIN" "$CERTBOT_WWW"

echo ">>> [2/7] Generating nginx active config for $DOMAIN..."
sed "s/YOUR_DOMAIN/$DOMAIN/g" ./nginx/nginx.conf > ./nginx/_active.conf

echo ">>> [3/7] Downloading recommended TLS parameters..."
if [ ! -f "$CERTBOT_CONF/options-ssl-nginx.conf" ]; then
  curl -sSL https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
    -o "$CERTBOT_CONF/options-ssl-nginx.conf"
fi
if [ ! -f "$CERTBOT_CONF/ssl-dhparams.pem" ]; then
  curl -sSL https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem \
    -o "$CERTBOT_CONF/ssl-dhparams.pem"
fi

echo ">>> [4/7] Creating temporary self-signed certificate so nginx can start..."
openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
  -keyout "$CERTBOT_CONF/live/$DOMAIN/privkey.pem" \
  -out "$CERTBOT_CONF/live/$DOMAIN/fullchain.pem" \
  -subj "/CN=$DOMAIN" 2>/dev/null

echo ">>> [5/7] Starting nginx with temporary certificate..."
docker compose -f docker-compose.prod.yml up -d nginx
sleep 3

echo ">>> [6/7] Requesting real Let's Encrypt certificate..."
docker compose -f docker-compose.prod.yml run --rm --entrypoint certbot certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d "$DOMAIN"

echo ">>> [7/7] Validating nginx config and reloading..."
docker compose -f docker-compose.prod.yml exec nginx nginx -t
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

echo ""
echo ">>> Done! SSL certificate issued for https://$DOMAIN"
echo ">>> Now start all services: docker compose -f docker-compose.prod.yml up -d"
