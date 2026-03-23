FROM php:8.2-apache

# Extensiones necesarias para MySQL (PDO) + módulos comunes de Apache.
RUN docker-php-ext-install pdo pdo_mysql \
  && a2enmod rewrite headers

WORKDIR /var/www/html

# Copiamos el proyecto dentro de la imagen (en desarrollo se sobreescribe con volume).
COPY . /var/www/html

