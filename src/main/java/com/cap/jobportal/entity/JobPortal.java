package com.cap.jobportal.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

@Entity
@Table(name="job_portal")
public class JobPortal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    @Column(name = "title")
    private String title;

    @NotBlank(message = "Description is required")
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "Location is required")
    @Size(max = 100, message = "Location must not exceed 100 characters")
    @Column(name = "location")
    private String location;

    @NotBlank(message = "Company name is required")
    @Size(max = 25, message = "Company name must not exceed 15 characters")
    @Column(name = "company_name")
    private String companyName;

    @ManyToOne
    @JoinColumn(name = "posted_by")
    private User postedBy;

    @OneToMany(mappedBy = "jobPortal")
    private List<Application> applications;

}
