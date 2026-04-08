package com.kalahaat.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "orderId", nullable = false, unique = true)
    private String orderId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(precision = 10, scale = 2, columnDefinition = "DECIMAL(10,2) DEFAULT 0.00")
    private BigDecimal shipping;

    @Column(name = "paymentMethod", nullable = false)
    private String paymentMethod;

    @Column(columnDefinition = "ENUM('Pending Payment', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Processing'")
    private String status;

    @Column(name = "razorpayOrderId")
    private String razorpayOrderId;

    @Column(name = "razorpayPaymentId")
    private String razorpayPaymentId;

    @Column(name = "razorpaySignature")
    private String razorpaySignature;

    private String addressName;
    private String addressPhone;
    private String addressLine1;
    private String addressLine2;
    private String addressCity;
    private String addressState;
    private String addressPin;

    @Column(name = "addressType")
    private String addressType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customerId")
    private AppUser customer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "createdAt", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updatedAt")
    private LocalDateTime updatedAt;

    public Order() {}

    public static OrderBuilder builder() { return new OrderBuilder(); }

    // --- Getters & Setters ---
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public BigDecimal getShipping() { return shipping; }
    public void setShipping(BigDecimal shipping) { this.shipping = shipping; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }
    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }
    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }
    public String getAddressName() { return addressName; }
    public void setAddressName(String addressName) { this.addressName = addressName; }
    public String getAddressPhone() { return addressPhone; }
    public void setAddressPhone(String addressPhone) { this.addressPhone = addressPhone; }
    public String getAddressLine1() { return addressLine1; }
    public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
    public String getAddressLine2() { return addressLine2; }
    public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
    public String getAddressCity() { return addressCity; }
    public void setAddressCity(String addressCity) { this.addressCity = addressCity; }
    public String getAddressState() { return addressState; }
    public void setAddressState(String addressState) { this.addressState = addressState; }
    public String getAddressPin() { return addressPin; }
    public void setAddressPin(String addressPin) { this.addressPin = addressPin; }
    public String getAddressType() { return addressType; }
    public void setAddressType(String addressType) { this.addressType = addressType; }
    public AppUser getCustomer() { return customer; }
    public void setCustomer(AppUser customer) { this.customer = customer; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static class OrderBuilder {
        private Order order = new Order();
        public OrderBuilder orderId(String id) { order.setOrderId(id); return this; }
        public OrderBuilder customer(AppUser u) { order.setCustomer(u); return this; }
        public OrderBuilder total(BigDecimal t) { order.setTotal(t); return this; }
        public OrderBuilder shipping(BigDecimal s) { order.setShipping(s); return this; }
        public OrderBuilder paymentMethod(String p) { order.setPaymentMethod(p); return this; }
        public OrderBuilder status(String s) { order.setStatus(s); return this; }
        public OrderBuilder addressName(String n) { order.setAddressName(n); return this; }
        public OrderBuilder addressPhone(String p) { order.setAddressPhone(p); return this; }
        public OrderBuilder addressLine1(String l) { order.setAddressLine1(l); return this; }
        public OrderBuilder addressLine2(String l) { order.setAddressLine2(l); return this; }
        public OrderBuilder addressCity(String c) { order.setAddressCity(c); return this; }
        public OrderBuilder addressState(String s) { order.setAddressState(s); return this; }
        public OrderBuilder addressPin(String p) { order.setAddressPin(p); return this; }
        public OrderBuilder addressType(String t) { order.setAddressType(t); return this; }
        public OrderBuilder items(List<OrderItem> i) { order.setItems(i); return this; }
        public Order build() { return order; }
    }
}
