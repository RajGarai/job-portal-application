package com.cap.jobportal.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        })
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @NotBlank
    @Column(name="name")
    private String name;

    @NotBlank
    @Column(name="email")
    @Email
    private String email;

    @NotBlank
    @Size(min=6,max = 12)
    @Column(name="password")
    private String password;

    @Column(name = "user_role")
    private Role role;

    @OneToMany(mappedBy = "user", cascade = {CascadeType.MERGE,CascadeType.PERSIST}, fetch = FetchType.LAZY)
    private List<Application> applications;

    @OneToMany(mappedBy = "postedBy",cascade={CascadeType.MERGE,CascadeType.PERSIST}, fetch=FetchType.LAZY)
    private List<JobPortal> jobs;

}
