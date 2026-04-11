// Project note: This file forwards browser routes back to the static app shell.
// It lets Spring Boot serve the single-page UI correctly for direct visits to app URLs like `/dashboard`.
package com.edumetrix.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
        "/",
        "/auth",
        "/dashboard",
        "/log-activity",
        "/subjects",
        "/goals",
        "/insights",
        "/profile",
        "/parent-dashboard",
        "/parent-student"
    })
    public String index() {
        return "forward:/index.html";
    }
}
