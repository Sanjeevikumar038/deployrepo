package com.examly.springapp.service;
import com.examly.springapp.dto.AnswerDTO;
import com.examly.springapp.dto.QuizAttemptDTO;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.model.Option;
import com.examly.springapp.model.Question;
import com.examly.springapp.model.Quiz;
import com.examly.springapp.model.QuizAttempt;
import com.examly.springapp.repository.OptionRepository;
import com.examly.springapp.repository.QuestionRepository;
import com.examly.springapp.repository.QuizAttemptRepository;
import com.examly.springapp.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
@Service
public class QuizAttemptService {
    @Autowired
    private QuizRepository quizRepository;
    @Autowired
    private QuizAttemptRepository quizAttemptRepository;
    @Autowired
    private QuestionRepository questionRepository;
    @Autowired
    private OptionRepository optionRepository;
    @Transactional
    public QuizAttemptDTO submitQuizAttempt(QuizAttemptDTO quizAttemptDTO) {
        Quiz quiz = quizRepository.findById(quizAttemptDTO.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        int score = 0;
        int totalQuestions = 0;
        List<Question> questions = questionRepository.findByQuizId(quiz.getId());
        totalQuestions = questions.size();
        Map<Long, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, q -> q));
        for (AnswerDTO answer : quizAttemptDTO.getAnswers()) {
            Question question = questionMap.get(answer.getQuestionId());
            if (question != null) {
                Option correctOption = optionRepository.findByQuestionAndIsCorrect(question, true);
                if (correctOption != null && correctOption.getId().equals(answer.getSelectedOptionId())) {
                    score++;
                }
            }
        }
        
QuizAttempt quizAttempt = new QuizAttempt();
quizAttempt.setQuiz(quiz);
quizAttempt.setStudentName(quizAttemptDTO.getStudentName());
quizAttempt.setScore(score);
quizAttempt.setTotalQuestions(totalQuestions);
quizAttempt.setCompletedAt(new Date());
QuizAttempt savedAttempt = quizAttemptRepository.save(quizAttempt);
return convertToDTO(savedAttempt);
}
public List<QuizAttemptDTO> getQuizAttemptsByQuizId(Long quizId) {
Quiz quiz = quizRepository.findById(quizId)
.orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
return quizAttemptRepository.findByQuizId(quizId).stream()
.map(this::convertToDTO)
.collect(Collectors.toList());
}
public List<QuizAttemptDTO> getAllQuizAttempts() {
return quizAttemptRepository.findAll().stream()
.map(this::convertToDTO)
.collect(Collectors.toList());
}
private QuizAttemptDTO convertToDTO(QuizAttempt quizAttempt) {
QuizAttemptDTO dto = new QuizAttemptDTO();
dto.setId(quizAttempt.getId());
dto.setQuizId(quizAttempt.getQuiz().getId());
dto.setStudentName(quizAttempt.getStudentName());
dto.setScore(quizAttempt.getScore());
dto.setTotalQuestions(quizAttempt.getTotalQuestions());
dto.setCompletedAt(quizAttempt.getCompletedAt());
dto.setQuizTitle(quizAttempt.getQuiz().getTitle());
dto.setStudentId(String.valueOf(quizAttempt.getId()));
dto.setTimeTaken("N/A");
return dto;
}
}