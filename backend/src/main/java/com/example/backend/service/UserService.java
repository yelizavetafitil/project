package com.example.backend.service;

import com.example.backend.dto.UserDto;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Cacheable(value = "users", key = "'all'")
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Cacheable(value = "users", key = "#id")
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }

    @Cacheable(value = "users", key = "'username_' + #username")
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return convertToDto(user);
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserDto createUser(UserDto userDto) {
        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        user.setPassword(passwordEncoder.encode(userDto.getPassword() != null ? userDto.getPassword() : "password123"));
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setPhone(userDto.getPhone());
        user.setAddress(userDto.getAddress());
        user.setRole(userDto.getRole() != null ? User.Role.valueOf(userDto.getRole()) : User.Role.CUSTOMER);
        user.setActive(userDto.getActive() != null ? userDto.getActive() : true);

        user = userRepository.save(user);
        return convertToDto(user);
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserDto updateUser(Long id, UserDto userDto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setPhone(userDto.getPhone());
        user.setAddress(userDto.getAddress());
        user.setEmail(userDto.getEmail());

        user = userRepository.save(user);
        return convertToDto(user);
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserDto updateUserRole(Long id, User.Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role);
        user = userRepository.save(user);
        return convertToDto(user);
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    private UserDto convertToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        dto.setCreatedAt(user.getCreatedAt());
        dto.setActive(user.getActive());
        return dto;
    }
}









