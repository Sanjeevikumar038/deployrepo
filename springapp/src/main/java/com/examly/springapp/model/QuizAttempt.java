package com.examly.springapp.model;

import jakarta.persistence.*;
import java.util.Date;
import lombok.*;

@Entity
@Table(name = "quiz_attempts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    private String studentName;
    private Integer score;
    private Integer totalQuestions;

    @Temporal(TemporalType.TIMESTAMP)
    private Date completedAt;


}