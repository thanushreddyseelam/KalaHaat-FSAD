package com.kalahaat.controller;

import com.kalahaat.entity.AppUser;
import com.kalahaat.entity.Product;
import com.kalahaat.repository.AppUserRepository;
import com.kalahaat.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/consultant")
@PreAuthorize("hasRole('CONSULTANT')")
public class ConsultantController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AppUserRepository userRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<Product>> getPending() {
        // Simple manual filter for now
        return ResponseEntity.ok(productRepository.findAll().stream()
                .filter(p -> "pending".equals(p.getVerificationStatus()))
                .toList());
    }

    @PutMapping("/verify/{id}")
    public ResponseEntity<Product> verifyProduct(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        Product product = productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
        product.setVerificationStatus(body.get("status"));
        product.setVerificationNotes(body.get("notes"));
        product.setVerifier(getCurrentUser());
        return ResponseEntity.ok(productRepository.save(product));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        AppUser consultant = getCurrentUser();
        
        stats.put("pendingCount", productRepository.findAll().stream().filter(p -> "pending".equals(p.getVerificationStatus())).count());
        stats.put("approvedCount", productRepository.findAll().stream().filter(p -> "approved".equals(p.getVerificationStatus()) && consultant.equals(p.getVerifier())).count());
        stats.put("rejectedCount", productRepository.findAll().stream().filter(p -> "rejected".equals(p.getVerificationStatus()) && consultant.equals(p.getVerifier())).count());
        
        return ResponseEntity.ok(stats);
    }

    private AppUser getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Logged in user not found"));
    }
}
