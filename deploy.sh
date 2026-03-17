#!/bin/bash

cd ~/projects/frontend-engineering-lab

echo "Pulling latest code..."
git pull origin main

echo "Rebuilding container..."
docker compose down
docker compose up -d --build

echo "Deploy complete!"
