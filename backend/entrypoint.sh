#!/bin/bash
set -e

# Remove a potentially pre-existing server.pid for Rails.
rm -f /app/tmp/pids/server.pid

# Wait for database to be ready
echo "Waiting for database to be ready..."
until mysqladmin ping -h"$DB_HOST" --silent; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database is ready!"

# Check if database exists
if bundle exec rails db:version 2>&1 | grep -q "does not exist"; then
  echo "Creating database..."
  bundle exec rails db:create
fi

# Run migrations
echo "Running migrations..."
bundle exec rails db:migrate

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"

