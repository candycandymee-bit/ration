#!/bin/sh

echo "Running migrations..."

npm run db:setup

echo "Starting server..."

npm start