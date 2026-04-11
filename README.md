<!-- Project note: This file gives a simple beginner-friendly guide for setting up and running the Java version of EduMetrix. -->
<!-- It focuses on the main steps only so the project is easy to understand and start quickly. -->
# EduMetrix

EduMetrix is a Java full-stack web app built with Spring Boot, Maven, Hibernate/JPA, and MySQL.

The UI is already included inside the Java project, so you only need to start the backend app to run the full website.

## What This Project Uses

- Java 21+
- Maven
- Spring Boot
- Hibernate / JPA
- MySQL

## What It Does

- Supports student and parent accounts
- Saves daily study/activity logs
- Updates the same date's log instead of creating duplicates
- Shows dashboard, goals, subjects, and profile data

## MySQL Setup

Use these MySQL credentials:

- Username: `root`
- Password: `ritheshmac`

Create a database in MySQL:

```sql
CREATE DATABASE edumetrix;
```

## Environment Variables

Set these before starting the app:

```bash
export DB_HOST=127.0.0.1
export DB_PORT=3306
export DB_NAME=edumetrix
export DB_USERNAME=root
export DB_PASSWORD=ritheshmac
export AUTH_SECRET=replace-with-your-secret
```

## Run Locally

Start the app with:

```bash
mvn spring-boot:run
```

Open:

```text
http://localhost:8080
```

## Build the Project

```bash
mvn package -DskipTests
```

The jar file will be created in `target/`.

## Deploy on Render

This project is ready for Render using [render.yaml](/Users/ritheshmekala/Desktop/EDUMETRIXX%20copy/render.yaml).

Add the same environment variables on Render:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `AUTH_SECRET`

## Extra Note

If you want to change credentials later, you can also check [JAVA_CREDENTIALS_README.md](/Users/ritheshmekala/Desktop/EDUMETRIXX%20copy/JAVA_CREDENTIALS_README.md).
