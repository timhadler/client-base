#!/usr/bin/env bash
set -e

# ---- config ----
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="clientbase"
DB_USER="root"
DB_PASS="password"

MIGRATIONS_DIR="./"

# ---- run ----
echo "Running migrations from $MIGRATIONS_DIR"

for file in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
  echo "Applying migration: $(basename "$file")"
  mysql \
    -h "$DB_HOST" \
    -P "$DB_PORT" \
    -u "$DB_USER" \
    -p"$DB_PASS" \
    "$DB_NAME" < "$file"
done

echo "✅ All migrations applied"
