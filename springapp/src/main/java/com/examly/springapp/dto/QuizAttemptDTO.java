package com.examly.springapp.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Date;
import java.util.List;
public class QuizAttemptDTO {
    private Long id;
    @NotNull(message = "Quiz ID is required.")
    private Long quizId;
    @NotBlank(message = "Student name is required.")
    @Size(min = 3, max = 100, message = "Student name must be between 3 and 100 characters.")
    private String studentName;
    private Integer score;
    private Integer totalQuestions;
    private Date completedAt;
    private String quizTitle;
    private String studentId;
    private String timeTaken;
    @Valid
    private List<AnswerDTO> answers;
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public Long getQuizId() {
        return quizId;
    }
    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }
    public String getStudentName() {
        return studentName;
    }
    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }
    public Integer getScore() {
        return score;
    }
    public void setScore(Integer score) {
        this.score = score;
    }
    public Integer getTotalQuestions() {
        return totalQuestions;
    }
    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }
    public Date getCompletedAt() {
        return completedAt;
    }
    public void setCompletedAt(Date completedAt) {
        this.completedAt = completedAt;
    }
    public List<AnswerDTO> getAnswers() {
        return answers;
    }
    public void setAnswers(List<AnswerDTO> answers) {
        this.answers = answers;
    }
    public String getQuizTitle() {
        return quizTitle;
    }
    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }
    public String getStudentId() {
        return studentId;
    }
    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }
    public String getTimeTaken() {
        return timeTaken;
    }
    public void setTimeTaken(String timeTaken) {
        this.timeTaken = timeTaken;
    }
}