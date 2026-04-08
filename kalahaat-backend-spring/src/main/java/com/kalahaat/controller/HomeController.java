package com.kalahaat.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> status = new HashMap<>();
        status.put("message", "🎨 KalaHaat API is running on Spring Boot (MySQL)!");
        status.put("version", "3.2.0 (Spring Migration)");
        status.put("db", "MySQL");
        
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("auth", "/api/auth");
        endpoints.put("products", "/api/products");
        status.put("endpoints", endpoints);
        
        return status;
    }
}
