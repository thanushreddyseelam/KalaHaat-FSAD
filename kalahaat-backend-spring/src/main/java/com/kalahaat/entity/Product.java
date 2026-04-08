package com.kalahaat.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT ''")
    private String image;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT ''")
    private String origin;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT ''")
    private String material;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT ''")
    private String dimensions;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT ''")
    private String tribe;

    @Column(columnDefinition = "VARCHAR(255) DEFAULT ''")
    private String artisan;

    @Column(columnDefinition = "FLOAT DEFAULT 0")
    private Float rating;

    @Column(name = "badge")
    private String badge;

    @Column(columnDefinition = "INTEGER DEFAULT 10")
    private Integer stock;

    @Column(name = "bg", columnDefinition = "VARCHAR(255) DEFAULT '#F5EDD6'")
    private String bg;

    @Column(name = "emoji", columnDefinition = "VARCHAR(255) DEFAULT ''")
    private String emoji;

    @Column(name = "verificationStatus", columnDefinition = "ENUM('pending', 'approved', 'rejected') DEFAULT 'approved'")
    private String verificationStatus;

    @Column(name = "verificationNotes", columnDefinition = "TEXT")
    private String verificationNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artisanUserId")
    private AppUser artisanUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verifiedBy")
    private AppUser verifier;

    @CreationTimestamp
    @Column(name = "createdAt", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updatedAt")
    private LocalDateTime updatedAt;

    // --- Constructors ---
    public Product() {}

    // --- Getters & Setters ---
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }

    public String getTribe() { return tribe; }
    public void setTribe(String tribe) { this.tribe = tribe; }

    public String getArtisan() { return artisan; }
    public void setArtisan(String artisan) { this.artisan = artisan; }

    public Float getRating() { return rating; }
    public void setRating(Float rating) { this.rating = rating; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getBg() { return bg; }
    public void setBg(String bg) { this.bg = bg; }

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }

    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

    public String getVerificationNotes() { return verificationNotes; }
    public void setVerificationNotes(String verificationNotes) { this.verificationNotes = verificationNotes; }

    public AppUser getArtisanUser() { return artisanUser; }
    public void setArtisanUser(AppUser artisanUser) { this.artisanUser = artisanUser; }

    public AppUser getVerifier() { return verifier; }
    public void setVerifier(AppUser verifier) { this.verifier = verifier; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
