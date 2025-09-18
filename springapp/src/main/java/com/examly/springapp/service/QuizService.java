package com.examly.springapp.service;
import com.examly.springapp.dto.QuizDTO;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.model.Quiz;
import com.examly.springapp.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
@Service
public class QuizService {
    @Autowired
    private QuizRepository quizRepository;
    public QuizDTO createQuiz(QuizDTO quizDTO) {
        Quiz quiz = new Quiz();
        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setTimeLimit(quizDTO.getTimeLimit());
        quiz.setCreatedAt(new Date());
        quiz.setUpdatedAt(new Date());
        Quiz savedQuiz = quizRepository.save(quiz);
        return convertToDTO(savedQuiz);
    }
    public List<QuizDTO> getAllQuizzes() {
        return quizRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    public QuizDTO getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        return convertToDTO(quiz);
    }
public QuizDTO updateQuiz(Long id, QuizDTO quizDTO) {
Quiz quiz = quizRepository.findById(id)
.orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
quiz.setTitle(quizDTO.getTitle());
quiz.setDescription(quizDTO.getDescription());
quiz.setTimeLimit(quizDTO.getTimeLimit());
quiz.setUpdatedAt(new Date());
Quiz updatedQuiz = quizRepository.save(quiz);
return convertToDTO(updatedQuiz);
}
public void deleteQuiz(Long id) {
if (!quizRepository.existsById(id)) {
throw new ResourceNotFoundException("Quiz not found");
}
quizRepository.deleteById(id);
}
private QuizDTO convertToDTO(Quiz quiz) {
QuizDTO quizDTO = new QuizDTO();
quizDTO.setId(quiz.getId());
quizDTO.setTitle(quiz.getTitle());
quizDTO.setDescription(quiz.getDescription());
quizDTO.setTimeLimit(quiz.getTimeLimit());
quizDTO.setCreatedAt(quiz.getCreatedAt());
quizDTO.setUpdatedAt(quiz.getUpdatedAt());
return quizDTO;
}
}