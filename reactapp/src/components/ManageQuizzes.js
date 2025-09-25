import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { buttonStyles } from './buttonStyles';
import { handleApiError } from './errorHandler';

const ManageQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // Refresh data when component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchQuizzes();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://deployrepo-i9b2.onrender.coms/api/quizzes');
      setQuizzes(response.data);
      setError(''); // Clear any previous errors
      setLoading(false);
    } catch (err) {
      setError(handleApiError(err, 'Failed to fetch quizzes'));
      setLoading(false);
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    
    try {
      await axios.delete(`https://deployrepo-i9b2.onrender.com//api/quizzes/${quizId}`);
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
    } catch (err) {
      setError(handleApiError(err, 'Failed to delete quiz'));
    }
  };



  if (loading) return <div>Loading quizzes...</div>;
  if (error) return <div className="error">{error}</div>;

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
        margin: '0 0 2rem 0'
      }}>
        Manage Quizzes
      </h2>

      {/* Quiz containers - 3 per row */}
      {quizzes.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          color: '#6b7280'
        }}>
          No quizzes found.
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '1.5rem'
        }}>
          {quizzes.map(quiz => (
            <div key={quiz.id} style={{ 
              backgroundColor: 'white', 
              border: '1px solid #e5e7eb', 
              borderRadius: '12px', 
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ 
                color: '#1f2937', 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0' 
              }}>
                {quiz.title}
              </h3>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.875rem', 
                margin: '0 0 1rem 0' 
              }}>
                {quiz.description}
              </p>
              <p style={{ 
                color: '#374151', 
                fontSize: '0.875rem', 
                margin: '0 0 1.5rem 0' 
              }}>
                <strong>Time Limit:</strong> {quiz.timeLimit} minutes
              </p>
              <button 
                onClick={() => deleteQuiz(quiz.id)}
                style={{ ...buttonStyles.danger, ...buttonStyles.small }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageQuizzes;