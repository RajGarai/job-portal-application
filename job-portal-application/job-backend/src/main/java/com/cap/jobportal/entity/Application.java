package com.cap.jobportal.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_status")
    private ApplicationStatus status;

    @Column(nullable = false)
    private LocalDateTime appliedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "job_id")
    private JobPortal jobPortal;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = ApplicationStatus.valueOf(status);
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public JobPortal getJobPortal() {
        return jobPortal;
    }

    public void setJobPortal(JobPortal jobPortal) {
        this.jobPortal = jobPortal;
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
}
