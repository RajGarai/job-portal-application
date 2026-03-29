package com.cap.jobportal.dto;

import com.cap.jobportal.entity.ApplicationStatus;

import java.time.LocalDateTime;

public class ApplicationJobResponse {
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private UserDTO userDTO;

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public UserDTO getUserDTO() {
        return userDTO;
    }

    public void setUserDTO(UserDTO userDTO) {
        this.userDTO = userDTO;
    }
}
