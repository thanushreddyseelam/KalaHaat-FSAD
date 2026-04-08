package com.kalahaat.controller;

import com.kalahaat.entity.AppUser;
import com.kalahaat.entity.Review;
import com.kalahaat.repository.AppUserRepository;
import com.kalahaat.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private AppUserRepository userRepository;

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        AppUser user = userRepository.findByEmail(email).orElseThrow();
        review.setUser(user);
        return ResponseEntity.status(201).body(reviewRepository.save(review));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Integer productId) {
        return ResponseEntity.ok(reviewRepository.findByProductId(productId));
    }
}
