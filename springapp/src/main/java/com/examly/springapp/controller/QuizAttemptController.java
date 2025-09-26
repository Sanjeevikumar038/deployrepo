package com.examly.springapp.controller;
import com.examly.springapp.dto.QuizAttemptDTO;
import com.examly.springapp.service.QuizAttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
@RestController
@RequestMapping
public class QuizAttemptController {
    @Autowired
    private QuizAttemptService quizAttemptService;
    @PostMapping("/api/quiz-attempts")
    public ResponseEntity<QuizAttemptDTO> submitQuizAttempt(@Valid @RequestBody QuizAttemptDTO quizAttemptDTO) {
        QuizAttemptDTO result = quizAttemptService.submitQuizAttempt(quizAttemptDTO);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }
    @GetMapping("/api/quizzes/{quizId}/attempts")
    public ResponseEntity<List<QuizAttemptDTO>> getQuizAttemptsByQuizId(@PathVariable Long quizId) {
        List<QuizAttemptDTO> attempts = quizAttemptService.getQuizAttemptsByQuizId(quizId);
        return new ResponseEntity<>(attempts, HttpStatus.OK);
    }
}