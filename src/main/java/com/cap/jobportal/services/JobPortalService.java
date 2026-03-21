package com.cap.jobportal.services;

import com.cap.jobportal.dto.JobPortalDTO;
import com.cap.jobportal.dto.UserDTO;
import com.cap.jobportal.entity.JobPortal;
import com.cap.jobportal.entity.Role;
import com.cap.jobportal.entity.User;
import com.cap.jobportal.repository.JobPortalRepository;
import com.cap.jobportal.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;


@Service
public class JobPortalService {
    @Autowired
    JobPortalRepository jobPortalRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ModelMapper modelMapper;


    private void checkAdmin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Access Denied! Only ADMIN allowed");
        }
    }

    public JobPortal createJob(JobPortalDTO dto){

        checkAdmin(dto.getPostedById());

        JobPortal jobPortal = modelMapper.map(dto, JobPortal.class);

        User user = userRepository.findById(dto.getPostedById())
                .orElseThrow(() -> new RuntimeException("User not found"));

        jobPortal.setPostedBy(user);

        return jobPortalRepository.save(jobPortal);
    }

    public JobPortal updateJob(JobPortalDTO dto, Long id){

        checkAdmin(dto.getPostedById());

        JobPortal existingJob = jobPortalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));

        modelMapper.map(dto, existingJob);

        return jobPortalRepository.save(existingJob);
    }

    public void deleteJob(Long id, Long userId) {

        checkAdmin(userId); // 🔥 AUTH CHECK

        if (!jobPortalRepository.existsById(id)) {
            throw new RuntimeException("Job not found with id: " + id);
        }

        jobPortalRepository.deleteById(id);
    }

    public JobPortal getJobById(Long id) {

        return jobPortalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }


    public List<JobPortalDTO> getAllJobs() {
        return jobPortalRepository.findAll()
                .stream()
                .map(job -> modelMapper.map(job, JobPortalDTO.class))
                .collect(Collectors.toList());
    }

}
