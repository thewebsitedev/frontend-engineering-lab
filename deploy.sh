#!/bin/bash

LOGFILE=/root/deploy.log
APP_DIR=~/projects/frontend-engineering-lab

echo "==== DEPLOY START $(date) ====" >> $LOGFILE

cd $APP_DIR || exit

# Detect active container
ACTIVE=$(grep reverse_proxy /etc/caddy/Caddyfile | grep -o '300[12]')

if [ "$ACTIVE" = "3001" ]; then
  NEW="green"
  NEW_PORT="3002"
  OLD="blue"
else
  NEW="blue"
  NEW_PORT="3001"
  OLD="green"
fi

echo "Active: $OLD → Deploying: $NEW" >> $LOGFILE

# Build and start new container
echo "Starting $NEW..." >> $LOGFILE
docker compose up -d --build app-$NEW >> $LOGFILE 2>&1

# Wait a few seconds (basic health check)
sleep 5

# Switch Caddy
echo "Switching traffic to $NEW..." >> $LOGFILE
sed -i "s/300[12]/$NEW_PORT/" /etc/caddy/Caddyfile
systemctl reload caddy

# Stop old container
echo "Stopping old container $OLD..." >> $LOGFILE
docker stop app-$OLD >> $LOGFILE 2>&1

echo "==== DEPLOY END $(date) ====" >> $LOGFILE