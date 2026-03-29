package com.cap.jobportal.controllers;


import com.cap.jobportal.dto.ApiResponse;
import com.cap.jobportal.dto.ApplicationDTO;
import com.cap.jobportal.dto.ApplicationJobResponse;
import com.cap.jobportal.dto.ApplicationUserResponse;
import com.cap.jobportal.services.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/app")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;


    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<ApplicationDTO>> applyJob(
            @RequestParam Long jobId,
            @RequestParam Long userId) {

        ApplicationDTO response = applicationService.applyJob(jobId, userId);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Applied successfully", response)
        );
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ApplicationUserResponse>>> getApplicationsByUser(
            @PathVariable Long userId) {

        List<ApplicationUserResponse> response =
                applicationService.findApplicationByUserId(userId);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "User applications fetched", response)
        );
    }


    @GetMapping("/job/{jobId}")
    public ResponseEntity<ApiResponse<List<ApplicationJobResponse>>> getApplicationsByJob(
            @PathVariable Long jobId) {

        List<ApplicationJobResponse> response =
                applicationService.findApplicationByJobId(jobId);

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Job applications fetched", response)
        );
    }
}
