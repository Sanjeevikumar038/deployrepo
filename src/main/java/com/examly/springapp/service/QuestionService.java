package com.examly.springapp.service;
import com.examly.springapp.dto.OptionDTO;
import com.examly.springapp.dto.QuestionDTO;
import com.examly.springapp.exception.BadRequestException;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.model.Option;
import com.examly.springapp.model.Question;
import com.examly.springapp.model.Quiz;
import com.examly.springapp.repository.OptionRepository;
import com.examly.springapp.repository.QuestionRepository;
import com.examly.springapp.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
@Service
public class QuestionService {
    @Autowired
    private QuizRepository quizRepository;
    @Autowired
    private QuestionRepository questionRepository;
    @Autowired
    private OptionRepository optionRepository;
    @Transactional
    public QuestionDTO addQuestion(Long quizId, QuestionDTO questionDTO) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
        long correctOptionsCount = questionDTO.getOptions().stream()
                .filter(OptionDTO::getIsCorrect)
                .count();
        if (correctOptionsCount != 1) {
            throw new BadRequestException("Each question must have exactly one correct option");
        }
        Question question = new Question();
        question.setQuiz(quiz);
        question.setQuestionText(questionDTO.getQuestionText());
        question.setQuestionType(questionDTO.getQuestionType());
        Question savedQuestion = questionRepository.save(question);
        List<Option> options = questionDTO.getOptions().stream()
                .map(optionDTO -> {
                    Option option = new Option();
                    option.setQuestion(savedQuestion);
                    option.setOptionText(optionDTO.getOptionText());
                    option.setIsCorrect(optionDTO.getIsCorrect());
                    return option;
                })
                .collect(Collectors.toList());
        optionRepository.saveAll(options);
        return convertToDTO(savedQuestion, options);
    }
public List<QuestionDTO> getQuestionsByQuizId(Long quizId) {
Quiz quiz = quizRepository.findById(quizId)
.orElseThrow(() -> new ResourceNotFoundException("Quiz not found"));
return questionRepository.findByQuizId(quizId).stream()
.map(question -> convertToDTO(question, question.getOptions()))
.collect(Collectors.toList());
}
private QuestionDTO convertToDTO(Question question, List<Option> options) {
QuestionDTO questionDTO = new QuestionDTO();
questionDTO.setId(question.getId());
questionDTO.setQuestionText(question.getQuestionText());
questionDTO.setQuestionType(question.getQuestionType());
List<OptionDTO> optionDTOs = options.stream()
.map(option -> {
OptionDTO optionDTO = new OptionDTO();
optionDTO.setId(option.getId());
optionDTO.setOptionText(option.getOptionText());
optionDTO.setIsCorrect(option.getIsCorrect());
return optionDTO;
})
.collect(Collectors.toList());
questionDTO.setOptions(optionDTOs);
return questionDTO;
}
}