package com.kalahaat.repository;

import com.kalahaat.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByProductId(Integer productId);
    
    @org.springframework.data.jpa.repository.Query("SELECT r FROM Review r JOIN r.product p WHERE p.artisanUser.id = :artisanId")
    List<Review> findByArtisanId(Integer artisanId);
}
