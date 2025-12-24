#!/bin/bash

# ============================================
# SSL Certificate Auto-Renewal via Cron
# ============================================
# This script automatically renews Let's Encrypt certificates
# Add to crontab: 0 0 * * * bash /root/dookan/hostinger-deployment/ssl-renewal-cronjob.sh

set -e

LOG_FILE="/var/log/dookan-ssl-renewal.log"

{
    echo "============================================"
    echo "SSL Renewal Check - $(date)"
    echo "============================================"
    
    # Renew certificates
    echo "Attempting to renew SSL certificates..."
    certbot renew --quiet --agree-tos
    
    # Reload Nginx if certificate was renewed
    if [ $? -eq 0 ]; then
        echo "Certificate renewed successfully. Reloading Nginx..."
        nginx -s reload
        echo "Nginx reloaded."
    else
        echo "No certificates needed renewal."
    fi
    
    echo "SSL Renewal Check Complete"
    echo ""
} >> "$LOG_FILE"
