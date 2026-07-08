#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
node dist/scripts/seed.js

echo "Starting application..."
exec "$@"