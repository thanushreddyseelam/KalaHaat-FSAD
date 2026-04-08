package com.kalahaat.repository;

import com.kalahaat.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByCustomerId(Integer customerId);
    Optional<Order> findByOrderId(String orderId);
    
    long countByStatus(String status);
    
    // Custom query for revenue
    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.total) FROM Order o WHERE o.status = 'Delivered'")
    java.math.BigDecimal sumTotalByStatusDelivered();
}
