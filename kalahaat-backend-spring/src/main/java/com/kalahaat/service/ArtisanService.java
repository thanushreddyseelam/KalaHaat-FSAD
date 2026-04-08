package com.kalahaat.service;

import com.kalahaat.entity.*;
import com.kalahaat.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
public class ArtisanService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Product> getMyProducts(Integer artisanId) {
        // Since my Product repo doesn't have it yet, I'll use a custom query or stream for now
        // Normally: productRepository.findByArtisanUserId(artisanId)
        return productRepository.findAll().stream()
                .filter(p -> p.getArtisanUser() != null && p.getArtisanUser().getId().equals(artisanId))
                .toList();
    }

    public Product createProduct(Product product, AppUser artisan) {
        product.setArtisanUser(artisan);
        product.setArtisan(artisan.getName());
        product.setVerificationStatus("pending");
        return productRepository.save(product);
    }

    public Map<String, Object> getStats(Integer artisanId) {
        Map<String, Object> stats = new HashMap<>();
        
        long productCount = productRepository.findAll().stream()
                .filter(p -> p.getArtisanUser() != null && p.getArtisanUser().getId().equals(artisanId))
                .count();
        
        stats.put("productCount", productCount);
        
        // Payout and transactions
        BigDecimal pendingPayout = transactionRepository.sumPendingAmountByUserId(artisanId);
        stats.put("pendingPayout", pendingPayout != null ? pendingPayout : BigDecimal.ZERO);
        
        // Recent transactions
        List<Transaction> recent = transactionRepository.findByUserId(artisanId);
        stats.put("recentTransactions", recent.size() > 5 ? recent.subList(0, 5) : recent);
        
        // Average rating
        List<Review> reviews = reviewRepository.findByArtisanId(artisanId);
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        stats.put("avgRating", String.format("%.1f", avg));

        return stats;
    }
}
