package com.cap.jobportal.repository;

import com.cap.jobportal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}

