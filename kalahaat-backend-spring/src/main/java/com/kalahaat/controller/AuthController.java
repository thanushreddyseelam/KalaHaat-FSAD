package com.kalahaat.controller;

import com.kalahaat.dto.AuthResponse;
import com.kalahaat.dto.LoginRequest;
import com.kalahaat.entity.AppUser;
import com.kalahaat.repository.AppUserRepository;
import com.kalahaat.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AppUserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AppUser userRequest) {
        return ResponseEntity.status(201).body(authService.register(userRequest));
    }

    @GetMapping("/me")
    public ResponseEntity<AppUser> getMe() {
        return ResponseEntity.ok(getCurrentUser());
    }

    @PutMapping("/me")
    public ResponseEntity<AppUser> updateMe(@RequestBody AppUser updates) {
        return ResponseEntity.ok(authService.updateMe(getCurrentUser(), updates));
    }

    private AppUser getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }
}
