<!-- Project note: This file lists the credentials and environment fields the user needs to provide for the Java project. -->
<!-- It is the main handoff note for configuring MySQL and auth secrets locally or on Render. -->
# Java Credentials Guide

Provide these environment variables before running or deploying the project:

- `DB_HOST`: MySQL host name or IP
- `DB_PORT`: MySQL port, usually `3306`
- `DB_NAME`: Database name, for example `edumetrix`
- `DB_USERNAME`: MySQL user name
- `DB_PASSWORD`: MySQL password
- `AUTH_SECRET`: Any long random secret string used to sign login tokens
- `PORT`: Optional app port override, Render provides this automatically

## Local Example

Set environment variables in your shell before running:

```bash
export DB_HOST=127.0.0.1
export DB_PORT=3306
export DB_NAME=edumetrix
export DB_USERNAME=root
export DB_PASSWORD=your-password
export AUTH_SECRET=replace-with-a-long-random-secret
```

Then start the app:

```bash
mvn spring-boot:run
```

## Render Fields

Add the same values in your Render web service environment settings:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `AUTH_SECRET`

Render will provide `PORT` automatically for the Spring Boot server.
