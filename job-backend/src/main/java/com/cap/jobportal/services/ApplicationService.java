package com.cap.jobportal.services;


import com.cap.jobportal.dto.*;
import com.cap.jobportal.entity.Application;
import com.cap.jobportal.entity.JobPortal;
import com.cap.jobportal.entity.User;
import com.cap.jobportal.exception.ResourceNotFoundException;
import com.cap.jobportal.repository.ApplicationRepository;
import com.cap.jobportal.repository.JobPortalRepository;
import com.cap.jobportal.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    ApplicationRepository applicationRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    JobPortalRepository jobPortalRepository;

    @Autowired
    ModelMapper modelMapper;
    private User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " , userId));
    }

    private JobPortal getJobById(Long jobId) {
        return jobPortalRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " , jobId));
    }
    public ApplicationDTO applyJob(Long jobId, Long userId){
        Application application=new Application();

        JobPortal jobPortal = getJobById(jobId);
        User user = getUserById(userId);

        application.setJobPortal(jobPortal);
        application.setUser(user);
        application.setStatus("APPLIED");
        application.setAppliedAt(LocalDateTime.now());
        applicationRepository.save(application);

        return modelMapper.map(application, ApplicationDTO.class);

    }

    public List<ApplicationUserResponse> findApplicationByUserId(Long userId){

        getUserById(userId);

        List<Application> applications = applicationRepository.findByUserUserId(userId);

        return applications.stream()
                .map(app -> {
                    ApplicationUserResponse response = new ApplicationUserResponse();

                    response.setStatus(app.getStatus());
                    response.setJob(modelMapper.map(app.getJobPortal(), JobPortalDTO.class));
                    response.setCreateAt(app.getAppliedAt());

                    return response;
                })
                .toList();
    }

    public List<ApplicationJobResponse> findApplicationByJobId(Long jobId){

        getJobById(jobId);

        List<Application> applications = applicationRepository.findByJobPortalId(jobId);

        return applications.stream()
                .map(app -> {
                    ApplicationJobResponse response = new ApplicationJobResponse();

                    response.setStatus(app.getStatus());
                    response.setAppliedAt(app.getAppliedAt());
                    response.setUserDTO(modelMapper.map(app.getUser(), UserDTO.class));
                    return response;
                })
                .toList();
    }
}
