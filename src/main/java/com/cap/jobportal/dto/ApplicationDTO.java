package com.cap.jobportal.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ApplicationDTO {

    private String status;

    private Long userId;

    private Long jobId;
}
