package com.cap.jobportal.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message,Long id) {
        super(message+id);
    }
}
