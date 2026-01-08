# EDUMETRIXX

EDUMETRIXX is a Java full-stack web app built with Spring Boot, Maven, Hibernate/JPA, and MySQL.

The frontend assets are served by the Spring Boot app, so you only need the Java service running to use the site.

## Stack

- Java 21+
- Maven
- Spring Boot
- Hibernate / JPA
- MySQL

## Environment Variables

Set these before running locally or deploying:

```bash
export DB_HOST=127.0.0.1
export DB_PORT=3306
export DB_NAME=edumetrix
export DB_USERNAME=your-db-user
export DB_PASSWORD=your-db-password
export AUTH_SECRET=replace-with-a-long-random-secret
```

Create the database first if needed:

```sql
CREATE DATABASE edumetrix;
```

## Run Locally

```bash
mvn spring-boot:run
```

Open `http://localhost:8080`.

## Build

```bash
mvn clean package -DskipTests
```

The jar will be written to `target/`.

## Deploy

This repository includes [render.yaml](/Users/ritheshmekala/Desktop/EDUMETRIXX%20copy/render.yaml) for Render deployment.

Configure these environment variables in Render:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `AUTH_SECRET`

More setup notes are in [JAVA_CREDENTIALS_README.md](/Users/ritheshmekala/Desktop/EDUMETRIXX%20copy/JAVA_CREDENTIALS_README.md).
