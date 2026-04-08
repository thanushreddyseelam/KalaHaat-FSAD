package com.kalahaat.controller;

import com.kalahaat.entity.AppUser;
import com.kalahaat.entity.Order;
import com.kalahaat.repository.AppUserRepository;
import com.kalahaat.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private AppUserRepository userRepository;

    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody Map<String, Object> orderData) {
        return ResponseEntity.status(201).body(orderService.placeOrder(getCurrentUser(), orderData));
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Order>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders(getCurrentUser()));
    }

    private AppUser getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Logged in user not found"));
    }
}
