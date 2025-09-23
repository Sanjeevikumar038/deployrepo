package com.examly.springapp.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
public class OptionDTO {
    private Long id;
    @NotBlank(message = "Option text cannot be blank.")
    @Size(min = 1, max = 200, message = "Option text must be between 1 and 200 characters.")
    private String optionText;
    @NotNull(message = "isCorrect field is required.")
    private Boolean isCorrect;
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getOptionText() {
        return optionText;
    }
    public void setOptionText(String optionText) {
        this.optionText = optionText;
    }
    public Boolean getIsCorrect() {
        return isCorrect;
    }
    public void setIsCorrect(Boolean isCorrect) {
        this.isCorrect = isCorrect;
    }
}