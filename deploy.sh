#!/bin/bash

LOGFILE=/root/deploy.log
APP_DIR=~/projects/frontend-engineering-lab

echo "==== DEPLOY START $(date) ====" >> $LOGFILE

cd $APP_DIR || exit

# Detect active container
ACTIVE=$(grep reverse_proxy /etc/caddy/Caddyfile | grep -o 'app-[a-z]*')

if [ "$ACTIVE" = "app-blue" ]; then
  NEW="green"
  NEW_NAME="app-green"
  OLD_NAME="app-blue"
else
  NEW="blue"
  NEW_NAME="app-blue"
  OLD_NAME="app-green"
fi

echo "Active: $OLD_NAME → Deploying: $NEW_NAME" >> $LOGFILE

# Build and start new container
echo "Starting $NEW_NAME..." >> $LOGFILE
docker compose up -d --build $NEW_NAME >> $LOGFILE 2>&1

# Wait a few seconds (basic health check)
sleep 5

# Switch Caddy
echo "Switching traffic to $NEW_NAME..." >> $LOGFILE
sed -i "s/app-[a-z]*/$NEW_NAME/" /etc/caddy/Caddyfile
docker exec caddy caddy reload --config /etc/caddy/Caddyfile

# Stop old container
echo "Stopping old container $OLD_NAME..." >> $LOGFILE
docker stop $OLD_NAME >> $LOGFILE 2>&1 || true
docker rm $OLD_NAME >> $LOGFILE 2>&1 || true

echo "==== DEPLOY END $(date) ====" >> $LOGFILE
