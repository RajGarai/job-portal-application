package com.cap.jobportal.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
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
    @JsonIgnore
    private List<Application> applications;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public @NotBlank(message = "Title is required") @Size(max = 100, message = "Title must not exceed 100 characters") String getTitle() {
        return title;
    }

    public void setTitle(@NotBlank(message = "Title is required") @Size(max = 100, message = "Title must not exceed 100 characters") String title) {
        this.title = title;
    }

    public @NotBlank(message = "Description is required") String getDescription() {
        return description;
    }

    public void setDescription(@NotBlank(message = "Description is required") String description) {
        this.description = description;
    }

    public @NotBlank(message = "Location is required") @Size(max = 100, message = "Location must not exceed 100 characters") String getLocation() {
        return location;
    }

    public void setLocation(@NotBlank(message = "Location is required") @Size(max = 100, message = "Location must not exceed 100 characters") String location) {
        this.location = location;
    }

    public @NotBlank(message = "Company name is required") @Size(max = 25, message = "Company name must not exceed 15 characters") String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(@NotBlank(message = "Company name is required") @Size(max = 25, message = "Company name must not exceed 15 characters") String companyName) {
        this.companyName = companyName;
    }

    public User getPostedBy() {
        return postedBy;
    }

    public void setPostedBy(User postedBy) {
        this.postedBy = postedBy;
    }

    public List<Application> getApplications() {
        return applications;
    }

    public void setApplications(List<Application> applications) {
        this.applications = applications;
    }
}
