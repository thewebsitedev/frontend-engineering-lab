#!/bin/bash

LOGFILE=/root/deploy.log

echo "==== DEPLOY START $(date) ====" >> $LOGFILE

cd ~/projects/frontend-engineering-lab || exit

echo "Pulling latest code..." >> $LOGFILE
git pull origin main >> $LOGFILE 2>&1

echo "Building and updating container..." >> $LOGFILE
docker compose up -d --build >> $LOGFILE 2>&1

echo "Cleaning old images..." >> $LOGFILE
docker image prune -f >> $LOGFILE 2>&1

echo "==== DEPLOY END $(date) ====" >> $LOGFILE