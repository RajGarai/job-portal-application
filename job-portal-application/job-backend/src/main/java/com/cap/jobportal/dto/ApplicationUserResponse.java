package com.cap.jobportal.dto;

import com.cap.jobportal.entity.ApplicationStatus;

import java.time.LocalDateTime;

public class ApplicationUserResponse {
    private ApplicationStatus status;

    private JobPortalDTO job;

    private LocalDateTime createAt;

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public JobPortalDTO getJob() {
        return job;
    }

    public void setJob(JobPortalDTO job) {
        this.job = job;
    }

    public LocalDateTime getCreateAt() {
        return createAt;
    }

    public void setCreateAt(LocalDateTime createAt) {
        this.createAt = createAt;
    }
}
