package com.kalahaat.service;

import com.kalahaat.dto.AuthResponse;
import com.kalahaat.dto.LoginRequest;
import com.kalahaat.entity.AppUser;
import com.kalahaat.repository.AppUserRepository;
import com.kalahaat.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        AppUser user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after successful auth"));

        return buildAuthResponse(user);
    }

    public AuthResponse register(AppUser userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new RuntimeException("User already exists");
        }
        userRequest.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        
        // Defaults matching Node.js
        if(userRequest.getRole() == null) userRequest.setRole("customer");
        if(userRequest.getStatus() == null) userRequest.setStatus("active");
        
        AppUser saved = userRepository.save(userRequest);
        return buildAuthResponse(saved);
    }

    public AppUser updateMe(AppUser currentUser, AppUser updates) {
        if(updates.getName() != null) currentUser.setName(updates.getName());
        if(updates.getPhone() != null) currentUser.setPhone(updates.getPhone());
        if(updates.getTribe() != null) currentUser.setTribe(updates.getTribe());
        if(updates.getBio() != null) currentUser.setBio(updates.getBio());
        if(updates.getSpecialization() != null) currentUser.setSpecialization(updates.getSpecialization());
        if(updates.getQualifications() != null) currentUser.setQualifications(updates.getQualifications());
        return userRepository.save(currentUser);
    }

    private AuthResponse buildAuthResponse(AppUser user) {
        String token = jwtUtils.generateToken(user.getEmail());
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .tribe(user.getTribe())
                .bio(user.getBio())
                .specialization(user.getSpecialization())
                .qualifications(user.getQualifications())
                .build();
    }
}
