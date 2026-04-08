package com.kalahaat.controller;

import com.kalahaat.entity.*;
import com.kalahaat.repository.AppUserRepository;
import com.kalahaat.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private AppUserRepository userRepository;

    @GetMapping
    public ResponseEntity<Cart> getCart() {
        return ResponseEntity.ok(cartService.getOrCreateCart(getCurrentUser()));
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(@RequestBody Map<String, Object> body) {
        Integer productId = (Integer) body.get("productId");
        Integer qty = (Integer) body.getOrDefault("qty", 1);
        return ResponseEntity.ok(cartService.addToCart(getCurrentUser(), productId, qty));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Cart> removeFromCart(@PathVariable Integer productId) {
        cartService.removeFromCart(getCurrentUser(), productId);
        return ResponseEntity.ok(cartService.getOrCreateCart(getCurrentUser()));
    }

    private AppUser getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Logged in user not found"));
    }
}
