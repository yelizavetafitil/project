package com.example.backend.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception ex) {
        logger.error("Unhandled exception: ", ex);
        
        Map<String, Object> error = new HashMap<>();
        error.put("error", ex.getClass().getSimpleName());
        error.put("message", ex.getMessage());
        error.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        logger.error("Runtime exception: ", ex);
        
        Map<String, Object> error = new HashMap<>();
        error.put("error", ex.getClass().getSimpleName());
        error.put("message", ex.getMessage());
        
      
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("Invalid username or password") || 
                ex.getMessage().contains("Bad credentials")) {
                status = HttpStatus.UNAUTHORIZED;
            } else if (ex.getMessage().contains("already exists")) {
                status = HttpStatus.CONFLICT;
            } else if (ex.getMessage().contains("not found")) {
                status = HttpStatus.NOT_FOUND;
            } else if (ex.getMessage().contains("disabled") || 
                       ex.getMessage().contains("locked")) {
                status = HttpStatus.FORBIDDEN;
            }
        }
        
        error.put("status", status.value());
        
        return ResponseEntity.status(status).body(error);
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentialsException(BadCredentialsException ex) {
        logger.warn("Bad credentials exception: {}", ex.getMessage());
        
        Map<String, Object> error = new HashMap<>();
        error.put("error", "BadCredentialsException");
        error.put("message", "Invalid username or password");
        error.put("status", HttpStatus.UNAUTHORIZED.value());
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}

