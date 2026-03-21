package com.cap.jobportal.services;


import com.cap.jobportal.dto.UserDTO;
import com.cap.jobportal.entity.Role;
import com.cap.jobportal.entity.User;
import com.cap.jobportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User registerUser(UserDTO userDTO) throws Exception {

        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new Exception("User with email " + userDTO.getEmail() + " already exists!");
        }

        User user = new User();
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setPassword(userDTO.getPassword()); // In production, hash the password
        user.setRole(Role.valueOf(userDTO.getRole().toUpperCase())); // Set role from DTO

        // Save and return the user
        return userRepository.save(user);
    }

    public User getUserById(Long id) throws Exception {
        Optional<User> user = userRepository.findById(id);
        if (!user.isPresent()) {
            throw new Exception("User with ID " + id + " not found!");
        }
        return user.get();
    }

    public User updateUser(Long id, UserDTO userDTO) throws Exception {
        // Get existing user
        User user = getUserById(id);

        // Update user fields
        if (userDTO.getName() != null && !userDTO.getName().isEmpty()) {
            user.setName(userDTO.getName());
        }

        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(userDTO.getPassword()); // In production, hash the password
        }

        if (userDTO.getRole() != null && !userDTO.getRole().isEmpty()) {
            user.setRole(Role.valueOf(userDTO.getRole().toUpperCase()));
        }

        if (userDTO.getEmail() != null && !userDTO.getEmail().isEmpty()
                && !userDTO.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(userDTO.getEmail())) {
                throw new Exception("Email " + userDTO.getEmail() + " is already in use!");
            }
            user.setEmail(userDTO.getEmail());
        }

        // Save and return the updated user
        return userRepository.save(user);
    }

    public void deleteUser(Long id) throws Exception {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    public User getUserByEmail(String email) throws Exception {
        Optional<User> user = userRepository.findByEmail(email);
        if (!user.isPresent()) {
            throw new Exception("User with email " + email + " not found!");
        }
        return user.get();
    }
}
