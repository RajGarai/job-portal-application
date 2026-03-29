package com.cap.jobportal.repository;

import com.cap.jobportal.entity.JobPortal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface JobPortalRepository extends JpaRepository<JobPortal,Long> {
}
