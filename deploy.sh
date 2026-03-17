#!/bin/bash

LOGFILE=/root/deploy.log
APP_DIR=~/projects/frontend-engineering-lab

echo "==== DEPLOY START $(date) ====" >> $LOGFILE

cd $APP_DIR || exit

# Detect active port
ACTIVE_PORT=$(grep reverse_proxy /etc/caddy/Caddyfile | grep -o '300[12]')

if [ "$ACTIVE_PORT" = "3001" ]; then
  NEW_PORT=3002
  OLD_PORT=3001
  NEW_NAME="app-green"
  OLD_NAME="app-blue"
else
  NEW_PORT=3001
  OLD_PORT=3002
  NEW_NAME="app-blue"
  OLD_NAME="app-green"
fi

echo "Active: $OLD_NAME → Deploying: $NEW_NAME" >> $LOGFILE

# Start new container
echo "Starting $NEW_NAME..." >> $LOGFILE
docker compose up -d --build $NEW_NAME >> $LOGFILE 2>&1

# 🧪 HEALTH CHECK LOOP
echo "Running health checks..." >> $LOGFILE

HEALTHY=false

for i in {1..10}; do
  sleep 2
  if curl -f http://localhost:$NEW_PORT > /dev/null 2>&1; then
    HEALTHY=true
    echo "Health check passed on attempt $i" >> $LOGFILE
    break
  else
    echo "Health check failed attempt $i" >> $LOGFILE
  fi
done

# ❌ If failed → rollback
if [ "$HEALTHY" = false ]; then
  echo "Health check FAILED. Rolling back..." >> $LOGFILE
  docker stop $NEW_NAME >> $LOGFILE 2>&1 || true
  docker rm $NEW_NAME >> $LOGFILE 2>&1 || true
  echo "==== DEPLOY FAILED $(date) ====" >> $LOGFILE
  exit 1
fi

# ✅ Switch traffic
echo "Switching traffic to $NEW_NAME..." >> $LOGFILE
sed -i "s/300[12]/$NEW_PORT/" /etc/caddy/Caddyfile
systemctl reload caddy

# Stop old container
echo "Stopping old container $OLD_NAME..." >> $LOGFILE
docker stop $OLD_NAME >> $LOGFILE 2>&1 || true
docker rm $OLD_NAME >> $LOGFILE 2>&1 || true

echo "==== DEPLOY SUCCESS $(date) ====" >> $LOGFILE