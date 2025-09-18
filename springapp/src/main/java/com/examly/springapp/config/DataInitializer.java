package com.examly.springapp.config;

import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private OptionRepository optionRepository;

    @Override
    public void run(String... args) throws Exception {
        if (quizRepository.count() == 0) {
            // Create sample quiz
            Quiz quiz = Quiz.builder()
                    .title("Java Basics Quiz")
                    .description("Test your knowledge of Java fundamentals")
                    .timeLimit(30)
                    .createdAt(new Date())
                    .updatedAt(new Date())
                    .build();
            
            quiz = quizRepository.save(quiz);
            
            // Create sample question
            Question question = Question.builder()
                    .quiz(quiz)
                    .questionText("What is the main method signature in Java?")
                    .questionType("multiple-choice")
                    .build();
            
            question = questionRepository.save(question);
            
            // Create options
            Option option1 = Option.builder()
                    .question(question)
                    .optionText("public static void main(String[] args)")
                    .isCorrect(true)
                    .build();
            
            Option option2 = Option.builder()
                    .question(question)
                    .optionText("public void main(String[] args)")
                    .isCorrect(false)
                    .build();
            
            Option option3 = Option.builder()
                    .question(question)
                    .optionText("static void main(String[] args)")
                    .isCorrect(false)
                    .build();
            
            optionRepository.saveAll(Arrays.asList(option1, option2, option3));
            
            System.out.println("Sample data initialized successfully!");
        }
    }
}