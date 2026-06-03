#!/bin/sh
set -eu

mkdir -p /var/www/html/config /var/www/html/files /var/www/html/logs
chown -R www-data:www-data /var/www/html/config /var/www/html/files /var/www/html/logs || true

exec "$@"