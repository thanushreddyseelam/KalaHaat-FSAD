package com.kalahaat.controller;

import com.kalahaat.entity.AppUser;
import com.kalahaat.entity.Product;
import com.kalahaat.repository.AppUserRepository;
import com.kalahaat.service.ArtisanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/artisan")
@PreAuthorize("hasRole('ARTISAN')")
public class ArtisanController {

    @Autowired
    private ArtisanService artisanService;

    @Autowired
    private AppUserRepository userRepository;

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getMyProducts() {
        return ResponseEntity.ok(artisanService.getMyProducts(getCurrentUserId()));
    }

    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        AppUser currentUser = userRepository.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElse(null);
        return ResponseEntity.status(201).body(artisanService.createProduct(product, currentUser));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(artisanService.getStats(getCurrentUserId()));
    }

    private Integer getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).map(AppUser::getId).orElse(null);
    }
}
