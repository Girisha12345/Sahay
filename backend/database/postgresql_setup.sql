CREATE DATABASE sahay_db;

CREATE USER sahay_user WITH PASSWORD 'Giri@8453';

ALTER ROLE sahay_user SET client_encoding TO 'utf8';
ALTER ROLE sahay_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE sahay_user SET timezone TO 'UTC';

GRANT ALL PRIVILEGES ON DATABASE sahay_db TO sahay_user;
