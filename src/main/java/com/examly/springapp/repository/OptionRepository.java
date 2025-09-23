package com.examly.springapp.repository;
import com.examly.springapp.model.Option;
import com.examly.springapp.model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface OptionRepository extends JpaRepository<Option, Long> {
    Option findByQuestionAndIsCorrect(Question question, Boolean isCorrect);
}