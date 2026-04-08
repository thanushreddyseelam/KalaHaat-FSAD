package com.kalahaat.service;

import com.kalahaat.entity.AppUser;
import com.kalahaat.entity.Order;
import com.kalahaat.entity.Product;
import com.kalahaat.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class AdminService {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    public List<AppUser> getUsers(String role, String status) {
        // Simple list with sorting for now; full JSR/Specification can be added for deeper search
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public AppUser updateUserStatus(Integer id, String status) {
        AppUser user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        return userRepository.save(user);
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        Map<String, Object> users = new HashMap<>();
        users.put("totalUsers", userRepository.count());
        // For efficiency, specific counts should ideally use custom repository methods if DB grows large
        users.put("artisanCount", userRepository.findAll().stream().filter(u -> "artisan".equals(u.getRole())).count());
        users.put("customerCount", userRepository.findAll().stream().filter(u -> "customer".equals(u.getRole())).count());
        
        Map<String, Object> productStats = new HashMap<>();
        productStats.put("totalProducts", productRepository.count());
        productStats.put("approvedProducts", productRepository.findAll().stream().filter(p -> "approved".equals(p.getVerificationStatus())).count());
        
        Map<String, Object> orderStats = new HashMap<>();
        orderStats.put("totalOrders", orderRepository.count());
        orderStats.put("deliveredOrders", orderRepository.countByStatus("Delivered"));

        stats.put("users", users);
        stats.put("products", productStats);
        stats.put("orders", orderStats);
        
        BigDecimal revenue = orderRepository.sumTotalByStatusDelivered();
        stats.put("totalRevenue", revenue != null ? revenue : BigDecimal.ZERO);

        return stats;
    }
}
