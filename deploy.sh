#!/bin/bash

LOGFILE=/root/deploy.log

echo "==== DEPLOY START $(date) ====" >> $LOGFILE

cd ~/projects/frontend-engineering-lab || exit

echo "Pulling latest code..." >> $LOGFILE
git pull origin main >> $LOGFILE 2>&1

echo "Rebuilding container..." >> $LOGFILE
docker compose down >> $LOGFILE 2>&1
docker compose up -d --build >> $LOGFILE 2>&1

echo "==== DEPLOY END $(date) ====" >> $LOGFILE
