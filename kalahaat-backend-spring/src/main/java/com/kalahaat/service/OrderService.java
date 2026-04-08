package com.kalahaat.service;

import com.kalahaat.entity.*;
import com.kalahaat.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Transactional
    public Order placeOrder(AppUser customer, Map<String, Object> orderData) {
        List<Map<String, Object>> itemsData = (List<Map<String, Object>>) orderData.get("items");
        Map<String, Object> addressData = (Map<String, Object>) orderData.get("address");
        
        String paymentMethod = (String) orderData.get("paymentMethod");
        BigDecimal total = new BigDecimal(String.valueOf(orderData.get("total")));
        BigDecimal shipping = new BigDecimal(String.valueOf(orderData.getOrDefault("shipping", "0")));

        // Generate Order ID (Matches KH-TIMESTAMP-RANDOM logic)
        String orderId = "KH-" + Long.toString(System.currentTimeMillis(), 36).toUpperCase() + 
                         "-" + String.format("%04d", new Random().nextInt(10000));

        Order order = Order.builder()
                .orderId(orderId)
                .customer(customer)
                .total(total)
                .shipping(shipping)
                .paymentMethod(paymentMethod)
                .status(paymentMethod.equalsIgnoreCase("cod") ? "Confirmed" : "Processing")
                .addressName((String) addressData.get("name"))
                .addressPhone((String) addressData.get("phone"))
                .addressLine1((String) addressData.get("line1"))
                .addressLine2((String) addressData.getOrDefault("line2", ""))
                .addressCity((String) addressData.get("city"))
                .addressState((String) addressData.get("state"))
                .addressPin((String) addressData.get("pin"))
                .addressType((String) addressData.getOrDefault("type", "home"))
                .items(new ArrayList<>())
                .build();

        Order savedOrder = orderRepository.save(order);

        for (Map<String, Object> itemData : itemsData) {
            OrderItem item = OrderItem.builder()
                    .order(savedOrder)
                    .name((String) itemData.get("name"))
                    .price(new BigDecimal(String.valueOf(itemData.get("price"))))
                    .qty((Integer) itemData.get("qty"))
                    .image((String) itemData.get("image"))
                    .build();
            orderItemRepository.save(item);
        }

        // Clear user's cart
        cartRepository.findByUserId(customer.getId()).ifPresent(cart -> {
            cartItemRepository.deleteAll(cart.getItems());
            cart.getItems().clear();
        });

        return savedOrder;
    }

    public List<Order> getMyOrders(AppUser customer) {
        return orderRepository.findByCustomerId(customer.getId());
    }
}
