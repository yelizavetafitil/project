package com.example.backend.service;

import com.example.backend.dto.AuthRequest;
import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setRole(User.Role.CUSTOMER);
        user.setActive(true);

        user = userRepository.save(user);
        log.info("User registered successfully: {}", user.getUsername());

        String token = jwtTokenProvider.generateToken(
                org.springframework.security.core.userdetails.User.builder()
                        .username(user.getUsername())
                        .password(user.getPassword())
                        .authorities("ROLE_" + user.getRole().name())
                        .build()
        );

        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }

    public AuthResponse login(AuthRequest request) {
        log.debug("Attempting login for username: {}", request.getUsername());
        

        if (!userRepository.existsByUsername(request.getUsername())) {
            log.warn("Login attempt for non-existent user: {}", request.getUsername());
            throw new RuntimeException("Invalid username or password");
        }
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            log.debug("Authentication successful for user: {}", userDetails.getUsername());
            
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> {
                        log.error("User not found in database after successful authentication: {}", userDetails.getUsername());
                        return new RuntimeException("User not found");
                    });

            if (!user.getActive()) {
                log.warn("Attempted login for inactive user: {}", user.getUsername());
                throw new RuntimeException("User account is disabled");
            }

            String token = jwtTokenProvider.generateToken(userDetails);
            log.debug("Token generated successfully for user: {}", user.getUsername());

            return new AuthResponse(token, user.getUsername(), user.getRole().name());
        } catch (BadCredentialsException e) {
            log.warn("Bad credentials for username: {}", request.getUsername());
            throw new RuntimeException("Invalid username or password", e);
        } catch (AuthenticationException e) {
            log.error("Authentication failed for username: {}", request.getUsername(), e);
            throw new RuntimeException("Authentication failed: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Unexpected error during login for username: {}", request.getUsername(), e);
            throw new RuntimeException("Login failed: " + e.getMessage(), e);
        }
    }
}

