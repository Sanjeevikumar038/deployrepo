package com.examly.springapp.controller;
import com.examly.springapp.dto.QuestionDTO;
import com.examly.springapp.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
@RestController

@RequestMapping("/api/quizzes/{quizId}/questions")
public class QuestionController {
    @Autowired
    private QuestionService questionService;
    @PostMapping
    public ResponseEntity<QuestionDTO> addQuestionToQuiz(@PathVariable Long quizId, @Valid @RequestBody QuestionDTO questionDTO) {
        QuestionDTO addedQuestion = questionService.addQuestion(quizId, questionDTO);
        return new ResponseEntity<>(addedQuestion, HttpStatus.CREATED);
    }
    @GetMapping
    public ResponseEntity<List<QuestionDTO>> getQuestionsByQuizId(@PathVariable Long quizId) {
        List<QuestionDTO> questions = questionService.getQuestionsByQuizId(quizId);
        return new ResponseEntity<>(questions, HttpStatus.OK);
    }
}