package com.examly.springapp.dto;
import java.util.List;
public class ErrorResponse {
    private int status;
    private List<String> errors;
    public ErrorResponse(int status, List<String> errors) {
        this.status = status;
        this.errors = errors;
    }
    public int getStatus() {
        return status;
    }
    public List<String> getErrors() {
        return errors;
    }
}