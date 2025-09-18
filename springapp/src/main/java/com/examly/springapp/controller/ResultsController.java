package com.examly.springapp.controller;

import com.examly.springapp.dto.QuizAttemptDTO;
import com.examly.springapp.service.QuizAttemptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Controller for handling quiz results

@RestController
@RequestMapping("/api")
public class ResultsController {

    @Autowired
    private QuizAttemptService quizAttemptService;

    @GetMapping("/results")
    public ResponseEntity<List<QuizAttemptDTO>> getAllResults() {
        List<QuizAttemptDTO> results = quizAttemptService.getAllQuizAttempts();
        return ResponseEntity.ok(results);
    }
}