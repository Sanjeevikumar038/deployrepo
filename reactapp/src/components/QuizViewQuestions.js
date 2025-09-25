import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuizViewQuestions = ({ quizId, onReturnHome }) => {
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        setLoading(true);

        // Check localStorage first
        const localQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        const localQuiz = localQuizzes.find(q => q.id === quizId);
        const deletedQuestions = JSON.parse(localStorage.getItem('deletedQuestions') || '[]');

        if (localQuiz && localQuiz.questions && localQuiz.questions.length > 0) {
          // Use localStorage data
          setQuiz(localQuiz);
          setQuestions(localQuiz.questions.filter(q => !deletedQuestions.includes(q.id)));
        } else {
          // Fallback to API
          const BASE_URL = "https://deployrepo-i9b2.onrender.com";

          // Fetch quiz details
          const quizResponse = await axios.get(`${BASE_URL}/api/quizzes/${quizId}`);
          setQuiz(quizResponse.data);

          // Fetch questions for the quiz
          const questionsResponse = await axios.get(`${BASE_URL}/api/quizzes/${quizId}/questions`);
          
          // Filter out deleted questions and apply localStorage edits
          let apiQuestions = questionsResponse.data.filter(q => !deletedQuestions.includes(q.id));
          
          // Apply localStorage edits to API questions
          if (localQuiz && localQuiz.questions) {
            apiQuestions = apiQuestions.map(apiQ => {
              const localQ = localQuiz.questions.find(lq => lq.id === apiQ.id);
              return localQ || apiQ;
            });
          }
          
          setQuestions(apiQuestions);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load quiz questions.');
        console.error('Error fetching quiz questions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  const filteredQuestions = questions.filter(question => 
    filter === 'all' || question.questionType === filter
  );

  if (loading) {
    return (
      <div style={{ 
        width: '100vw', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc' 
      }}>
        Loading quiz questions...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        width: '100vw', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        gap: '1rem'
      }}>
        <p style={{ color: '#dc2626', fontSize: '1.125rem' }}>{error}</p>
        <button 
          onClick={onReturnHome}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer'
          }}
        >
          Back to Admin Home
        </button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={{ 
        width: '100vw', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        gap: '1rem'
      }}>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Quiz not found.</p>
        <button 
          onClick={onReturnHome}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer'
          }}
        >
          Back to Admin Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100vw', 
      minHeight: '100vh', 
      margin: 0, 
      padding: '2rem',
      backgroundColor: '#f8fafc',
      boxSizing: 'border-box'
    }}>
      <h2 style={{ 
        fontSize: '2rem', 
        fontWeight: '700', 
        color: '#1f2937', 
        margin: '0 0 1rem 0',
        textAlign: 'center'
      }}>
        {quiz.title} - Questions
      </h2>
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <p style={{ color: '#6b7280', margin: '0 0 0.5rem 0' }}>{quiz.description}</p>
        <p style={{ color: '#374151', fontWeight: '500', margin: 0 }}>Time Limit: {quiz.timeLimit} minutes</p>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <label style={{ marginRight: '1rem', fontWeight: '500' }}>Filter by type:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ 
              padding: '0.5rem', 
              borderRadius: '6px', 
              border: '1px solid #d1d5db',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Types</option>
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
            <option value="TRUE_FALSE">True/False</option>
          </select>
        </div>
        <button 
          onClick={onReturnHome}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Back to Admin Home
        </button>
      </div>

      {filteredQuestions.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#6b7280',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          No questions found for this quiz.
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '1.5rem' 
        }}>
          {filteredQuestions.map((question, qIndex) => (
            <div key={question.id} style={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: '12px', 
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                backgroundColor: '#dbeafe', 
                color: '#1e40af', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '6px', 
                fontSize: '0.75rem', 
                fontWeight: '500', 
                display: 'inline-block', 
                marginBottom: '1rem' 
              }}>
                {question.questionType === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 'True/False'}
              </div>
              
              <div style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                padding: '0.25rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '500',
                display: 'inline-block',
                marginBottom: '1rem',
                marginLeft: '0.5rem'
              }}>
                Q{qIndex + 1}
              </div>
              
              <p style={{ 
                color: '#374151', 
                fontSize: '1rem', 
                fontWeight: '500', 
                margin: '0 0 1rem 0' 
              }}>
                {question.questionText}
              </p>
              
              <div style={{ marginBottom: '1rem' }}>
                {question.options && question.options.map((option, index) => (
                  <div key={option.id || index} style={{ 
                    padding: '0.5rem', 
                    backgroundColor: option.isCorrect ? '#dcfce7' : '#f9fafb', 
                    borderRadius: '6px', 
                    marginBottom: '0.25rem',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>{option.isCorrect ? '✅' : '🔲'}</span>
                    <span>{option.optionText}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizViewQuestions;