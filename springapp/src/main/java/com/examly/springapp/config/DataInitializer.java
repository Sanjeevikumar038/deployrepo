package com.examly.springapp.config;

import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(QuizRepository quizRepository, QuestionRepository questionRepository, OptionRepository optionRepository, StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.optionRepository = optionRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

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
        
        if (studentRepository.count() == 0) {
            Student testStudent = new Student();
            testStudent.setUsername("sanju");
            testStudent.setPassword(passwordEncoder.encode("password"));
            testStudent.setEmail("727723euc045@gmail.com");
            studentRepository.save(testStudent);
            
            System.out.println("Test student created: username=sanju, password=password, email=727723euc045@gmail.com");
        }
    }
}
