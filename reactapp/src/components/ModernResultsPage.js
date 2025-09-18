import React, { useState, useEffect } from 'react';
import './ModernUI.css';

const ModernResultsPage = ({ attempt, onReturnHome }) => {
  const [detailedResults, setDetailedResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (attempt) {
      processResults();
    }
  }, [attempt]);

  const processResults = () => {
    try {
      const { answers, quiz, score, totalQuestions, correctAnswers } = attempt;
      
      // Calculate detailed statistics
      const incorrectAnswers = totalQuestions - correctAnswers;
      const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
      const timePerQuestion = quiz.duration ? Math.round((quiz.duration * 60) / totalQuestions) : 0;
      
      // Process each question with user's answer
      const questionResults = quiz.questions.map((question, index) => {
        const userAnswer = answers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        
        return {
          question: question.questionText,
          userAnswer: question.options ? question.options[userAnswer] : userAnswer,
          correctAnswer: question.options ? question.options[question.correctAnswer] : question.correctAnswer,
          isCorrect,
          options: question.options || []
        };
      });

      setDetailedResults({
        score,
        accuracy,
        correctAnswers,
        incorrectAnswers,
        totalQuestions,
        timePerQuestion,
        questionResults,
        quizTitle: quiz.title,
        completedAt: new Date().toLocaleString()
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error processing results:', error);
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--success-color)';
    if (score >= 60) return 'var(--warning-color)';
    return 'var(--danger-color)';
  };

  const getPerformanceMessage = (score) => {
    if (score >= 90) return { message: 'Excellent work! Outstanding performance!', emoji: '🎉' };
    if (score >= 80) return { message: 'Great job! You did very well!', emoji: '👏' };
    if (score >= 70) return { message: 'Good work! Keep it up!', emoji: '👍' };
    if (score >= 60) return { message: 'You passed! Consider reviewing the material.', emoji: '✅' };
    return { message: 'Keep studying and try again!', emoji: '📚' };
  };

  if (loading || !detailedResults) {
    return (
      <div className="modern-loading">
        <div className="modern-spinner"></div>
        Processing your results...
      </div>
    );
  }

  const performance = getPerformanceMessage(detailedResults.score);

  return (
    <div className="modern-results-page">
      {/* Header Card */}
      <div className="modern-card" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{performance.emoji}</div>
        <h1 style={{ 
          color: getScoreColor(detailedResults.score), 
          fontSize: '3rem', 
          margin: '0 0 0.5rem 0' 
        }}>
          {detailedResults.score}%
        </h1>
        <h2 style={{ color: 'var(--text-primary)', margin: '0 0 1rem 0' }}>
          {detailedResults.quizTitle}
        </h2>
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: '1.1rem', 
          margin: '0 0 1rem 0' 
        }}>
          {performance.message}
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
          Completed on {detailedResults.completedAt}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="modern-dashboard">
        <div className="modern-stats-card" style={{ background: 'linear-gradient(135deg, var(--success-color), var(--accent-color))' }}>
          <div className="modern-stats-number">{detailedResults.correctAnswers}</div>
          <div className="modern-stats-label">Correct Answers</div>
        </div>
        <div className="modern-stats-card" style={{ background: 'linear-gradient(135deg, var(--danger-color), var(--warning-color))' }}>
          <div className="modern-stats-number">{detailedResults.incorrectAnswers}</div>
          <div className="modern-stats-label">Incorrect Answers</div>
        </div>
        <div className="modern-stats-card" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' }}>
          <div className="modern-stats-number">{detailedResults.accuracy}%</div>
          <div className="modern-stats-label">Accuracy</div>
        </div>
        <div className="modern-stats-card" style={{ background: 'linear-gradient(135deg, var(--warning-color), var(--success-color))' }}>
          <div className="modern-stats-number">{detailedResults.totalQuestions}</div>
          <div className="modern-stats-label">Total Questions</div>
        </div>
      </div>

      {/* Detailed Question Review */}
      <div className="modern-card">
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Question by Question Review
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {detailedResults.questionResults.map((result, index) => (
            <div 
              key={index} 
              className="modern-card" 
              style={{ 
                margin: 0, 
                padding: '1.5rem',
                borderLeft: `4px solid ${result.isCorrect ? 'var(--success-color)' : 'var(--danger-color)'}`,
                backgroundColor: result.isCorrect ? '#f0fdf4' : '#fef2f2'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ 
                  fontSize: '1.5rem',
                  color: result.isCorrect ? 'var(--success-color)' : 'var(--danger-color)'
                }}>
                  {result.isCorrect ? '✅' : '❌'}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    color: 'var(--text-primary)', 
                    margin: '0 0 1rem 0',
                    fontSize: '1rem'
                  }}>
                    Question {index + 1}: {result.question}
                  </h4>
                  
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Your Answer: </strong>
                    <span style={{ 
                      color: result.isCorrect ? 'var(--success-color)' : 'var(--danger-color)',
                      fontWeight: '500'
                    }}>
                      {result.userAnswer || 'No answer provided'}
                    </span>
                  </div>
                  
                  {!result.isCorrect && (
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Correct Answer: </strong>
                      <span style={{ color: 'var(--success-color)', fontWeight: '500' }}>
                        {result.correctAnswer}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
        <button 
          className="modern-btn modern-btn-primary"
          onClick={onReturnHome}
        >
          Return to Dashboard
        </button>
        <button 
          className="modern-btn modern-btn-secondary"
          onClick={() => window.print()}
        >
          Print Results
        </button>
      </div>
    </div>
  );
};

export default ModernResultsPage;