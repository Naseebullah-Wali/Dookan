#!/bin/bash

# ============================================
# Dookan Backup Script
# ============================================
# Creates backups of your application and database
# Add to crontab: 0 2 * * * bash /root/dookan/hostinger-deployment/backup.sh

set -e

BACKUP_DIR="/root/backups/dookan"
APP_DIR="/root/dookan"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "🔄 Starting Dookan Backup - $(date)"
echo "=================================="

# ============================================
# 1. Backup Database
# ============================================
echo "Backing up database..."
DB_FILE="$BACKUP_DIR/database_$TIMESTAMP.sql"
DB_PATH="$APP_DIR/backend-afghan-grocery/db/database.sqlite"

if [ -f "$DB_PATH" ]; then
    # For SQLite
    sqlite3 "$DB_PATH" ".dump" > "$DB_FILE"
    gzip "$DB_FILE"
    echo "✓ Database backed up: $DB_FILE.gz"
fi

# ============================================
# 2. Backup Application Code
# ============================================
echo "Backing up application files..."
CODE_BACKUP="$BACKUP_DIR/app-code_$TIMESTAMP.tar.gz"
tar -czf "$CODE_BACKUP" \
    --exclude=node_modules \
    --exclude=dist \
    --exclude=.git \
    --exclude=.env \
    -C "$APP_DIR" . 2>/dev/null
echo "✓ Application backed up: $CODE_BACKUP"

# ============================================
# 3. Backup Uploads
# ============================================
echo "Backing up uploads..."
UPLOADS_BACKUP="$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz"
tar -czf "$UPLOADS_BACKUP" \
    -C "$APP_DIR/backend-afghan-grocery" uploads 2>/dev/null || true
echo "✓ Uploads backed up: $UPLOADS_BACKUP"

# ============================================
# 4. Backup Configuration
# ============================================
echo "Backing up configuration..."
CONFIG_BACKUP="$BACKUP_DIR/config_$TIMESTAMP.tar.gz"
tar -czf "$CONFIG_BACKUP" \
    /etc/nginx/sites-available/zmadookan.com \
    /etc/letsencrypt/live/zmadookan.com 2>/dev/null || true
echo "✓ Configuration backed up: $CONFIG_BACKUP"

# ============================================
# 5. Clean Old Backups
# ============================================
echo "Cleaning old backups..."
find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete
echo "✓ Backups older than $RETENTION_DAYS days removed"

# ============================================
# 6. Summary
# ============================================
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo ""
echo "=================================="
echo "✓ Backup Complete!"
echo "Location: $BACKUP_DIR"
echo "Total backup size: $TOTAL_SIZE"
echo "Retention: $RETENTION_DAYS days"
echo "=================================="
echo ""

# Optional: Upload to cloud storage
# Example with AWS S3:
# aws s3 sync "$BACKUP_DIR" s3://your-bucket/dookan-backups/ --delete

# Optional: Send notification email
# echo "Backup completed at $(date)" | mail -s "Dookan Backup Success" admin@zmadookan.com
