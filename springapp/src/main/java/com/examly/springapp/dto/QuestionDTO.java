package com.examly.springapp.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
public class QuestionDTO {
    private Long id;
    @NotBlank(message = "Question text must be between 5 and 500 characters.")
    @Size(min = 5, max = 500, message = "Question text must be between 5 and 500 characters.")
    private String questionText;
    @NotBlank(message = "Question type is required.")
    private String questionType;
    @Valid
    @NotNull(message = "Options cannot be null.")
    private List<OptionDTO> options;
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getQuestionText() {
        return questionText;
    }
    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }
    public String getQuestionType() {
        return questionType;
    }
    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }
    public List<OptionDTO> getOptions() {
        return options;
    }
    public void setOptions(List<OptionDTO> options) {
        this.options = options;
    }
}