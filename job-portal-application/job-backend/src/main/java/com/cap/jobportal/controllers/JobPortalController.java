package com.cap.jobportal.controllers;


import com.cap.jobportal.dto.ApiResponse;
import com.cap.jobportal.dto.JobPortalDTO;
import com.cap.jobportal.entity.JobPortal;
import com.cap.jobportal.services.JobPortalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobPortalController {

    @Autowired
    private JobPortalService jobPortalService;


    @PostMapping
    public ResponseEntity<ApiResponse<JobPortal>> createJob(@RequestBody @Valid JobPortalDTO jobPortalDTO) {

        JobPortal createdJob = jobPortalService.createJob(jobPortalDTO);
        return ResponseEntity.status(201)
                .body(new ApiResponse<>(true, "Job created successfully", createdJob));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<JobPortal>> updateJob(
            @PathVariable Long id,
            @RequestBody JobPortalDTO jobPortalDTO) {

        JobPortal updatedJob = jobPortalService.updateJob(jobPortalDTO, id);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Job updated successfully", updatedJob)
        );
    }

    @DeleteMapping("/{id}/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteJob(
            @PathVariable Long id,
            @PathVariable Long userId) {
        jobPortalService.deleteJob(id, userId);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Job deleted successfully", null)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobPortal>> getJobById(@PathVariable Long id) {
        JobPortal job = jobPortalService.getJobById(id);
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Job fetched successfully", job)
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobPortal>>> getAllJobs() {
        List<JobPortal> jobs = jobPortalService.getAllJobs();
        return ResponseEntity.ok(
                new ApiResponse<>(true, "All jobs fetched successfully", jobs)
        );
    }
}
