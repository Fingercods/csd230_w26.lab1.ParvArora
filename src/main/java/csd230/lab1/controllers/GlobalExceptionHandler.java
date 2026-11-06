
package csd230.lab1.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BookNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleBookNotFound(
            BookNotFoundException exception) {

        Map<String, String> error = Map.of(
                "error", "Not Found",
                "message", exception.getMessage()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResourceNotFound(
            ResourceNotFoundException exception) {

        Map<String, String> error = Map.of(
                "error", "Not Found",
                "message", exception.getMessage()
        );

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
