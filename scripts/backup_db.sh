#!/usr/bin/env bash

# ====================================================================
# SI-PATIR: Automated Database Backup Tool (Linux / macOS)
# Penanggung Jawab: Fatir (@Patirparkerr) - Database Engineer
# ====================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$ROOT_DIR/backups"

echo "======================================================"
echo "   SI-PATIR AUTOMATED DATABASE BACKUP TOOL (Linux/macOS)"
echo "   Penanggung Jawab: Fatir (@Patirparkerr)"
echo "======================================================"
echo ""

mkdir -p "$BACKUP_DIR"

if command -v node >/dev/null 2>&1; then
    node "$SCRIPT_DIR/backup_helper.js"
else
    echo "[!] Node.js tidak terdeteksi. Mencoba mysqldump native..."
    ENV_FILE="$ROOT_DIR/backend/.env"
    
    DB_HOST="localhost"
    DB_USER="root"
    DB_NAME="sipatir_db"
    DB_PORT="3306"
    DB_PASSWORD=""

    if [ -f "$ENV_FILE" ]; then
        export $(grep -v '^#' "$ENV_FILE" | xargs)
    fi

    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    DUMP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"

    if [ -n "$DB_PASSWORD" ]; then
        mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$DUMP_FILE"
    else
        mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" > "$DUMP_FILE"
    fi

    echo "[OK] Backup tersimpan di: $DUMP_FILE ($(du -h "$DUMP_FILE" | cut -f1))"
fi

echo ""
echo "Daftar backup terbaru:"
ls -lh "$BACKUP_DIR" | tail -n 6
