// Project note: This file is the Spring Boot entry point for the Java full-stack EduMetrix application.
// It starts the web server, Hibernate, and the API/static UI layers for local and Render deployments.
package com.edumetrix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EdumetrixApplication {

    public static void main(String[] args) {
        SpringApplication.run(EdumetrixApplication.class, args);
    }
}
