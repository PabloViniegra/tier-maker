#!/usr/bin/env bash
# Applies every drizzle migration, in order, to the compose.e2e.yaml database.
set -euo pipefail
for file in drizzle/migrations/*.sql; do
  docker compose -f compose.e2e.yaml exec -T postgres \
    psql -U postgres -d tier_maker_e2e -v ON_ERROR_STOP=1 -q <"$file"
done
