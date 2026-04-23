#!/usr/bin/env bash
# db_backup.sh — Export db_manach from Docker to a SQL file
#
# Usage:
#   bash scripts/db_backup.sh
#
# The SQL file will be saved as db_manach.sql in the project root.

# ── Variables ──────────────────────────────────────────────────────────────────
# ${VAR:-default} means: use VAR if set, otherwise use the default.
# So you can override from the command line: CONTAINER=other bash db_backup.sh
CONTAINER="${CONTAINER:-manach}"
DB_NAME="${DB_NAME:-db_manach}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-1234}"

# __dir is the folder where this script lives, so the .sql saves next to it
# dirname "$0" gets the directory of the current script file
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUTPUT="$SCRIPT_DIR/../db_manach.sql"   # saves to project root

# ── Run backup ─────────────────────────────────────────────────────────────────
echo "Exporting $DB_NAME from container '$CONTAINER'..."

# docker exec runs a command inside the container
# mysqldump exports the whole database as SQL text
# > redirects that output into a file on your Mac
docker exec "$CONTAINER" \
  mysqldump -u"$DB_USER" -p"$DB_PASS" \
  --no-tablespaces \
  --set-gtid-purged=OFF \
  "$DB_NAME" > "$OUTPUT"

echo "Done! Saved to: $OUTPUT"
