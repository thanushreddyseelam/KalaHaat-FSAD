package com.kalahaat.dto;

public class AuthResponse {
    private String token;
    private Integer id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String status;
    private String tribe;
    private String bio;
    private String specialization;
    private String qualifications;

    public AuthResponse() {}

    public AuthResponse(String token, Integer id, String name, String email, String phone, String role, String status, String tribe, String bio, String specialization, String qualifications) {
        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.status = status;
        this.tribe = tribe;
        this.bio = bio;
        this.specialization = specialization;
        this.qualifications = qualifications;
    }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    // --- Getters & Setters ---
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTribe() { return tribe; }
    public void setTribe(String tribe) { this.tribe = tribe; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public String getQualifications() { return qualifications; }
    public void setQualifications(String qualifications) { this.qualifications = qualifications; }

    // Simple Builder class to maintain compatibility with my existing code
    public static class AuthResponseBuilder {
        private String token;
        private Integer id;
        private String name;
        private String email;
        private String phone;
        private String role;
        private String status;
        private String tribe;
        private String bio;
        private String specialization;
        private String qualifications;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder id(Integer id) { this.id = id; return this; }
        public AuthResponseBuilder name(String name) { this.name = name; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public AuthResponseBuilder role(String role) { this.role = role; return this; }
        public AuthResponseBuilder status(String status) { this.status = status; return this; }
        public AuthResponseBuilder tribe(String tribe) { this.tribe = tribe; return this; }
        public AuthResponseBuilder bio(String bio) { this.bio = bio; return this; }
        public AuthResponseBuilder specialization(String specialization) { this.specialization = specialization; return this; }
        public AuthResponseBuilder qualifications(String qualifications) { this.qualifications = qualifications; return this; }
        public AuthResponse build() {
            return new AuthResponse(token, id, name, email, phone, role, status, tribe, bio, specialization, qualifications);
        }
    }
}
