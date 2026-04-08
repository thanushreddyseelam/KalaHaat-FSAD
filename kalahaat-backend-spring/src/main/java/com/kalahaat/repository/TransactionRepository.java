package com.kalahaat.repository;

import com.kalahaat.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    List<Transaction> findByUserId(Integer userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.paymentStatus = 'Pending'")
    java.math.BigDecimal sumPendingAmountByUserId(Integer userId);
}
