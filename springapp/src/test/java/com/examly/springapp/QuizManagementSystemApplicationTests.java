package com.examly.springapp;

import com.examly.springapp.dto.*;
import com.examly.springapp.model.*;
import com.examly.springapp.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.annotation.DirtiesContext;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
public class QuizManagementSystemApplicationTests {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    private String baseUrl;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port;
        
        // Clean up database before each test
        quizAttemptRepository.deleteAll();
        optionRepository.deleteAll();
        questionRepository.deleteAll();
        quizRepository.deleteAll();
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    // Test 1: Create Quiz Successfully
    @Test
    @Order(1)
    public void testCreateQuiz_Success() {
        QuizDTO quizDTO = new QuizDTO();
        quizDTO.setTitle("Java Fundamentals");
        quizDTO.setDescription("Test your Java knowledge");
        quizDTO.setTimeLimit(60);

        HttpEntity<QuizDTO> request = new HttpEntity<>(quizDTO, createHeaders());
        
        ResponseEntity<QuizDTO> response = restTemplate.postForEntity(
            baseUrl + "/api/quizzes", request, QuizDTO.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Java Fundamentals", response.getBody().getTitle());
        assertEquals("Test your Java knowledge", response.getBody().getDescription());
        assertEquals(60, response.getBody().getTimeLimit());
        assertNotNull(response.getBody().getId());
        assertNotNull(response.getBody().getCreatedAt());
    }

    // Test 2: Create Quiz with Validation Errors
    @Test
    @Order(2)
    public void testCreateQuiz_ValidationError() {
        QuizDTO invalidQuiz = new QuizDTO();
        invalidQuiz.setTitle("AB"); // Too short
        invalidQuiz.setTimeLimit(200); // Too high

        HttpEntity<QuizDTO> request = new HttpEntity<>(invalidQuiz, createHeaders());
        
        ResponseEntity<ErrorResponse> response = restTemplate.postForEntity(
            baseUrl + "/api/quizzes", request, ErrorResponse.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getStatus());
        assertTrue(response.getBody().getErrors().size() > 0);
    }

    // Test 3: Get All Quizzes
    @Test
    @Order(3)
    public void testGetAllQuizzes_Success() {
        // Create test quizzes
        Quiz quiz1 = Quiz.builder()
            .title("Quiz 1")
            .description("First quiz")
            .timeLimit(30)
            .build();
        
        Quiz quiz2 = Quiz.builder()
            .title("Quiz 2")
            .description("Second quiz")
            .timeLimit(45)
            .build();

        quizRepository.save(quiz1);
        quizRepository.save(quiz2);

        ResponseEntity<QuizDTO[]> response = restTemplate.getForEntity(
            baseUrl + "/api/quizzes", QuizDTO[].class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().length);
        assertEquals("Quiz 1", response.getBody()[0].getTitle());
        assertEquals("Quiz 2", response.getBody()[1].getTitle());
    }

    // Test 4: Get Quiz By ID Successfully
    @Test
    @Order(4)
    public void testGetQuizById_Success() {
        Quiz savedQuiz = Quiz.builder()
            .title("Test Quiz")
            .description("A test quiz")
            .timeLimit(60)
            .build();
        savedQuiz = quizRepository.save(savedQuiz);

        ResponseEntity<QuizDTO> response = restTemplate.getForEntity(
            baseUrl + "/api/quizzes/" + savedQuiz.getId(), QuizDTO.class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Test Quiz", response.getBody().getTitle());
        assertEquals(savedQuiz.getId(), response.getBody().getId());
    }

    // Test 5: Get Quiz By Non-existent ID
    @Test
    @Order(5)
    public void testGetQuizById_NotFound() {
        ResponseEntity<ErrorResponse> response = restTemplate.getForEntity(
            baseUrl + "/api/quizzes/999", ErrorResponse.class);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().getStatus());
        assertTrue(response.getBody().getErrors().contains("Quiz not found"));
    }

    // Test 6: Add Question to Quiz Successfully
    @Test
    @Order(6)
    public void testAddQuestionToQuiz_Success() {
        // Create a quiz first
        Quiz savedQuiz = Quiz.builder()
            .title("Test Quiz")
            .description("A test quiz")
            .timeLimit(60)
            .build();
        savedQuiz = quizRepository.save(savedQuiz);

        // Create question DTO
        QuestionDTO questionDTO = new QuestionDTO();
        questionDTO.setQuestionText("What is Java?");
        questionDTO.setQuestionType("MULTIPLE_CHOICE");
        
        List<OptionDTO> options = new ArrayList<>();
        OptionDTO option1 = new OptionDTO();
        option1.setOptionText("A programming language");
        option1.setIsCorrect(true);
        
        OptionDTO option2 = new OptionDTO();
        option2.setOptionText("A coffee type");
        option2.setIsCorrect(false);
        
        options.add(option1);
        options.add(option2);
        questionDTO.setOptions(options);

        HttpEntity<QuestionDTO> request = new HttpEntity<>(questionDTO, createHeaders());
        
        ResponseEntity<QuestionDTO> response = restTemplate.postForEntity(
            baseUrl + "/api/quizzes/" + savedQuiz.getId() + "/questions", 
            request, QuestionDTO.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("What is Java?", response.getBody().getQuestionText());
        assertEquals("MULTIPLE_CHOICE", response.getBody().getQuestionType());
        assertEquals(2, response.getBody().getOptions().size());
        assertTrue(response.getBody().getOptions().get(0).getIsCorrect());
        assertFalse(response.getBody().getOptions().get(1).getIsCorrect());
    }

    // Test 7: Add Question with Validation Errors
    @Test
    @Order(7)
    public void testAddQuestionToQuiz_ValidationError() {
        Quiz savedQuiz = Quiz.builder()
            .title("Test Quiz")
            .description("A test quiz")
            .timeLimit(60)
            .build();
        savedQuiz = quizRepository.save(savedQuiz);

        // Create invalid question (no correct answer)
        QuestionDTO questionDTO = new QuestionDTO();
        questionDTO.setQuestionText("Invalid question?");
        questionDTO.setQuestionType("MULTIPLE_CHOICE");
        
        List<OptionDTO> options = new ArrayList<>();
        OptionDTO option1 = new OptionDTO();
        option1.setOptionText("Option 1");
        option1.setIsCorrect(false);
        
        OptionDTO option2 = new OptionDTO();
        option2.setOptionText("Option 2");
        option2.setIsCorrect(false);
        
        options.add(option1);
        options.add(option2);
        questionDTO.setOptions(options);

        HttpEntity<QuestionDTO> request = new HttpEntity<>(questionDTO, createHeaders());
        
        ResponseEntity<ErrorResponse> response = restTemplate.postForEntity(
            baseUrl + "/api/quizzes/" + savedQuiz.getId() + "/questions", 
            request, ErrorResponse.class);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getErrors().contains("Each question must have exactly one correct option"));
    }

    // Test 8: Add Question to Non-existent Quiz
    @Test
    @Order(8)
    public void testAddQuestionToQuiz_QuizNotFound() {
        QuestionDTO questionDTO = new QuestionDTO();
        questionDTO.setQuestionText("What is Java?");
        questionDTO.setQuestionType("TRUE_FALSE");
        
        List<OptionDTO> options = new ArrayList<>();
        OptionDTO option1 = new OptionDTO();
        option1.setOptionText("True");
        option1.setIsCorrect(true);
        
        OptionDTO option2 = new OptionDTO();
        option2.setOptionText("False");
        option2.setIsCorrect(false);
        
        options.add(option1);
        options.add(option2);
        questionDTO.setOptions(options);

        HttpEntity<QuestionDTO> request = new HttpEntity<>(questionDTO, createHeaders());
        
        ResponseEntity<ErrorResponse> response = restTemplate.postForEntity(
            baseUrl + "/api/quizzes/999/questions", 
            request, ErrorResponse.class);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getErrors().contains("Quiz not found"));
    }

    // Test 9: Submit Quiz Attempt Successfully
    @Test
    @Order(9)
    public void testSubmitQuizAttempt_Success() {
        // Create quiz with questions
        Quiz savedQuiz = Quiz.builder()
            .title("Test Quiz")
            .description("A test quiz")
            .timeLimit(60)
            .build();
        savedQuiz = quizRepository.save(savedQuiz);

        // Create question
        Question question = Question.builder()
            .quiz(savedQuiz)
            .questionText("What is 2+2?")
            .questionType("MULTIPLE_CHOICE")
            .build();
        question = questionRepository.save(question);

        // Create options
        Option correctOption = Option.builder()
            .question(question)
            .optionText("4")
            .isCorrect(true)
            .build();
        correctOption = optionRepository.save(correctOption);

        Option wrongOption = Option.builder()
            .question(question)
            .optionText("5")
            .isCorrect(false)
            .build();
        wrongOption = optionRepository.save(wrongOption);

        // Create quiz attempt DTO
        QuizAttemptDTO attemptDTO = new QuizAttemptDTO();
        attemptDTO.setQuizId(savedQuiz.getId());
        attemptDTO.setStudentName("John Doe");
        
        List<AnswerDTO> answers = new ArrayList<>();
        AnswerDTO answer = new AnswerDTO();
        answer.setQuestionId(question.getId());
        answer.setSelectedOptionId(correctOption.getId());
        answers.add(answer);
        attemptDTO.setAnswers(answers);

        HttpEntity<QuizAttemptDTO> request = new HttpEntity<>(attemptDTO, createHeaders());
        
        ResponseEntity<QuizAttemptDTO> response = restTemplate.postForEntity(
            baseUrl + "/api/quiz-attempts", request, QuizAttemptDTO.class);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(savedQuiz.getId(), response.getBody().getQuizId());
        assertEquals("John Doe", response.getBody().getStudentName());
        assertEquals(1, response.getBody().getScore()); // Correct answer
        assertEquals(1, response.getBody().getTotalQuestions());
        assertNotNull(response.getBody().getCompletedAt());
    }

    // Test 10: Get Quiz Attempts by Quiz ID
    @Test
    @Order(10)
    public void testGetQuizAttempts_Success() {
        // Create quiz
        Quiz savedQuiz = Quiz.builder()
            .title("Test Quiz")
            .description("A test quiz")
            .timeLimit(60)
            .build();
        savedQuiz = quizRepository.save(savedQuiz);

        // Create quiz attempts
        QuizAttempt attempt1 = QuizAttempt.builder()
            .quiz(savedQuiz)
            .studentName("Student 1")
            .score(8)
            .totalQuestions(10)
            .build();
        
        QuizAttempt attempt2 = QuizAttempt.builder()
            .quiz(savedQuiz)
            .studentName("Student 2")
            .score(6)
            .totalQuestions(10)
            .build();

        quizAttemptRepository.save(attempt1);
        quizAttemptRepository.save(attempt2);

        ResponseEntity<QuizAttemptDTO[]> response = restTemplate.getForEntity(
            baseUrl + "/api/quizzes/" + savedQuiz.getId() + "/attempts", 
            QuizAttemptDTO[].class);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().length);
        
        // Check first attempt
        QuizAttemptDTO firstAttempt = response.getBody()[0];
        assertEquals(savedQuiz.getId(), firstAttempt.getQuizId());
        assertEquals("Student 1", firstAttempt.getStudentName());
        assertEquals(8, firstAttempt.getScore());
        assertEquals(10, firstAttempt.getTotalQuestions());
        
        // Check second attempt
        QuizAttemptDTO secondAttempt = response.getBody()[1];
        assertEquals("Student 2", secondAttempt.getStudentName());
        assertEquals(6, secondAttempt.getScore());
    }
}