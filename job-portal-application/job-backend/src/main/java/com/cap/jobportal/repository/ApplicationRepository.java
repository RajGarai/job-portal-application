package com.cap.jobportal.repository;

import com.cap.jobportal.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ApplicationRepository extends JpaRepository<Application,Long> {
    // FIXED
    List<Application> findByUserUserId(Long userId);

    // This is already correct
    List<Application> findByJobPortalId(Long jobId);
}
