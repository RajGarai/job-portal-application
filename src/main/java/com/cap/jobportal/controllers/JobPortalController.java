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

    // ✅ CREATE Job
    @PostMapping
    public ResponseEntity<JobPortal> createJob(@RequestBody @Valid JobPortalDTO jobPortalDTO) {
        JobPortal createdJob = jobPortalService.createJob(jobPortalDTO);
        return ResponseEntity.status(201).body(createdJob); // HTTP 201 CREATED
    }

    // ✅ UPDATE Job
    @PutMapping("/{id}")
    public ResponseEntity<JobPortal> updateJob(
            @PathVariable Long id,
            @RequestBody JobPortalDTO jobPortalDTO) {

        JobPortal updatedJob = jobPortalService.updateJob(jobPortalDTO, id);
        return ResponseEntity.ok(updatedJob); // HTTP 200 OK
    }

    // ✅ DELETE Job
    @DeleteMapping("/{id}/{userid}")
    public ResponseEntity<String> deleteJob(@PathVariable Long id,@PathVariable Long UserId) {
        jobPortalService.deleteJob(id,UserId);
        return ResponseEntity.ok("Job deleted successfully");
    }

    // ✅ GET Job By ID
    @GetMapping("/{id}")
    public ResponseEntity<JobPortal> getJobById(@PathVariable Long id) {
        JobPortal job = jobPortalService.getJobById(id);
        return ResponseEntity.ok(job); // HTTP 200 OK
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<JobPortalDTO>>> getAllJobs() {

        List<JobPortalDTO> jobs = jobPortalService.getAllJobs();

        return ResponseEntity.ok(
                new ApiResponse<>(true, "All jobs fetched successfully", jobs)
        );
    }
}
