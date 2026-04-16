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

Before deploying, make sure you have:

- This repo pushed to GitHub
- A MySQL database you can connect to from Render
- The database name created, for example `edumetrix`

### Render Deployment Steps

1. Push your latest code to GitHub.
2. Sign in to Render and create a new service from this repository.
3. Use the `render.yaml` file if Render offers the Blueprint flow.
4. If you are creating the service manually, use:
   - Build command: `mvn clean package -DskipTests`
   - Start command: `java -jar target/edumetrix-0.0.1-SNAPSHOT.jar`
5. Set the environment variables below in Render.
6. Deploy the service.
7. Once the deploy finishes, open the Render URL for your app.

### Render Environment Variables

Configure these environment variables in Render:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `AUTH_SECRET`

### Example Values

```text
DB_HOST=your-mysql-host
DB_PORT=3306
DB_NAME=edumetrix
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
AUTH_SECRET=any-long-random-secret
```

### Notes

- `AUTH_SECRET` should be a long random string in production.
- `server.port` is already wired to Render with `${PORT:8080}` in the app config.
- If the deploy fails, double-check the MySQL host, port, username, password, and database name first.

More setup notes are in [JAVA_CREDENTIALS_README.md](/Users/ritheshmekala/Desktop/EDUMETRIXX%20copy/JAVA_CREDENTIALS_README.md).
