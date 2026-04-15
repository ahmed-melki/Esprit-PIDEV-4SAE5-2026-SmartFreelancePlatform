package com.freeflow.user_service.api.controller;

import com.freeflow.user_service.api.dto.LoginRequest;
import com.freeflow.user_service.api.dto.LoginResponse;
import com.freeflow.user_service.domain.entity.User;
import com.freeflow.user_service.infrastructure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!user.getEmailVerified()) {
            throw new RuntimeException("Please verify your email before logging in. A confirmation link has been sent.");
        }

        return ResponseEntity.ok(new LoginResponse(user.getId(), user.getEmail(), user.getRole().name()));
    }

    @GetMapping("/test-hash")
    public ResponseEntity<String> testHash() {
        String hash = passwordEncoder.encode("password123");
        return ResponseEntity.ok(hash);
    }
}