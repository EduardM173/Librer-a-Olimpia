FROM php:8.2-apache

ARG MANTIS_VERSION=2.28.3

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip libpng-dev libjpeg62-turbo-dev libfreetype6-dev libzip-dev libicu-dev libonig-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" mysqli pdo_mysql gd intl zip mbstring \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp

RUN git clone --depth 1 --branch "${MANTIS_VERSION}" https://github.com/mantisbt/mantisbt.git mantisbt \
    && rm -rf /var/www/html/* \
    && cp -R mantisbt/. /var/www/html/ \
    && mkdir -p /var/www/html/config /var/www/html/files /var/www/html/logs \
    && chown -R www-data:www-data /var/www/html

COPY docker/mantisbt/entrypoint.sh /usr/local/bin/mantisbt-entrypoint.sh
RUN chmod +x /usr/local/bin/mantisbt-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/mantisbt-entrypoint.sh"]
CMD ["apache2-foreground"]