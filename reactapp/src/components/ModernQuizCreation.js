import React, { useState, useEffect } from 'react';
import './ModernUI.css';

const ModernQuizCreation = ({ onQuizCreated }) => {
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    duration: 30,
    questions: []
  });
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadAvailableQuestions();
  }, []);

  const loadAvailableQuestions = () => {
    try {
      const questions = JSON.parse(localStorage.getItem('questions') || '[]');
      setAvailableQuestions(questions);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (selectedQuestions.length === 0) {
        setMessage('Please select at least one question for the quiz.');
        setLoading(false);
        return;
      }

      const selectedQuestionObjects = availableQuestions.filter(q => 
        selectedQuestions.includes(q.id)
      );

      const newQuiz = {
        id: Date.now(),
        ...quiz,
        questions: selectedQuestionObjects,
        createdAt: new Date().toISOString()
      };

      const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      const updatedQuizzes = [...existingQuizzes, newQuiz];
      localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));

      setMessage('Quiz created successfully!');
      setQuiz({ title: '', description: '', duration: 30, questions: [] });
      setSelectedQuestions([]);
      
      if (onQuizCreated) {
        onQuizCreated();
      }
    } catch (error) {
      setMessage('Error creating quiz. Please try again.');
      console.error('Error creating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-quiz-creation">
      <div className="modern-card">
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Create New Quiz
        </h2>

        <form onSubmit={handleSubmit} className="modern-form" style={{ padding: 0 }}>
          <div className="modern-form-group">
            <label className="modern-form-label">Quiz Title</label>
            <input
              type="text"
              name="title"
              value={quiz.title}
              onChange={handleInputChange}
              className="modern-form-input"
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="modern-form-group">
            <label className="modern-form-label">Description</label>
            <textarea
              name="description"
              value={quiz.description}
              onChange={handleInputChange}
              className="modern-form-input"
              placeholder="Enter quiz description"
              rows="3"
              required
            />
          </div>

          <div className="modern-form-group">
            <label className="modern-form-label">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={quiz.duration}
              onChange={handleInputChange}
              className="modern-form-input"
              min="1"
              max="180"
              required
            />
          </div>

          <div className="modern-form-group">
            <label className="modern-form-label">
              Select Questions ({selectedQuestions.length} selected)
            </label>
            
            {availableQuestions.length === 0 ? (
              <div className="modern-alert modern-alert-warning">
                No questions available. Please add questions to the question bank first.
              </div>
            ) : (
              <div style={{ 
                maxHeight: '300px', 
                overflowY: 'auto', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--border-radius)',
                padding: '1rem'
              }}>
                {availableQuestions.map(question => (
                  <div key={question.id} style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '0.75rem',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--border-radius)',
                    marginBottom: '0.5rem',
                    backgroundColor: selectedQuestions.includes(question.id) ? '#f0f9ff' : 'white'
                  }}>
                    <input
                      type="checkbox"
                      id={`question-${question.id}`}
                      checked={selectedQuestions.includes(question.id)}
                      onChange={() => handleQuestionToggle(question.id)}
                      style={{ marginTop: '0.25rem' }}
                    />
                    <label 
                      htmlFor={`question-${question.id}`}
                      style={{ 
                        flex: 1, 
                        textAlign: 'left', 
                        cursor: 'pointer',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                        {question.questionText}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        gap: '1rem'
                      }}>
                        <span>Type: {question.type}</span>
                        <span>Options: {question.options?.length || 0}</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {message && (
            <div className={`modern-alert ${message.includes('Error') ? 'modern-alert-danger' : 'modern-alert-success'}`}>
              {message}
            </div>
          )}

          <button 
            type="submit" 
            className="modern-btn modern-btn-primary"
            disabled={loading || availableQuestions.length === 0}
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <div className="modern-spinner" style={{ width: '1rem', height: '1rem', margin: 0, marginRight: '0.5rem' }}></div>
                Creating Quiz...
              </>
            ) : (
              'Create Quiz'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModernQuizCreation;