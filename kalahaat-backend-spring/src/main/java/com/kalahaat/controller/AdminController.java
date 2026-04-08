package com.kalahaat.controller;

import com.kalahaat.entity.AppUser;
import com.kalahaat.entity.Order;
import com.kalahaat.entity.Product;
import com.kalahaat.repository.OrderRepository;
import com.kalahaat.repository.ProductRepository;
import com.kalahaat.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/users")
    public ResponseEntity<List<AppUser>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getUsers(role, status));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<AppUser> updateUserStatus(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.updateUserStatus(id, body.get("status")));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")));
    }
}
