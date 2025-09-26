package com.examly.springapp.dto;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Date;
public class QuizDTO {
    private Long id;
    @NotBlank(message = "Quiz title must be between 3 and 100 characters.")
    @Size(min = 3, max = 100, message = "Quiz title must be between 3 and 100 characters.")
    private String title;
    @NotBlank(message = "Quiz description cannot be blank.")
    @Size(max = 255, message = "Description cannot exceed 255 characters.")
    private String description;
    @NotNull(message = "Time limit is required.")
    @Min(value = 3, message = "Time limit must be at least 3 minutes.")
    private Integer timeLimit;
    private Date createdAt;
    private Date updatedAt;
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public Integer getTimeLimit() {
        return timeLimit;
    }
    public void setTimeLimit(Integer timeLimit) {
        this.timeLimit = timeLimit;
    }
    public Date getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    public Date getUpdatedAt() {
        return updatedAt;
    }
    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}