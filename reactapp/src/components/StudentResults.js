import React, { useState, useEffect, useCallback } from 'react';
import './ModernUI.css';

const StudentResults = ({ studentId = 'current-student' }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    try {
      let studentResults = [];
      const currentStudentName = localStorage.getItem('username') || localStorage.getItem('studentName') || 'Student';
      console.log('Looking for results for student:', currentStudentName);
      console.log('Current localStorage quizResults:', localStorage.getItem('quizResults'));
      
      // Use localStorage directly since server is not running
      console.log('Using localStorage data directly');
      
      const quizResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const quizAttempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
      
      console.log('=== DEBUGGING TIMING DATA ===');
      console.log('quizResults:', quizResults);
      console.log('quizAttempts:', quizAttempts);
      console.log('Current student name for filtering:', currentStudentName);
      
      // Check each quizResult for timing data
      quizResults.forEach((result, index) => {
        console.log(`QuizResult ${index}:`, {
          studentName: result.studentName,
          quizTitle: result.quizTitle,
          timeTaken: result.timeTaken,
          hasTimeTaken: !!result.timeTaken
        });
      });
      
      // Use quizResults directly - it has the actual timeTaken data
      studentResults = quizResults.filter(result => {
        console.log(`QuizResults entry:`, result);
        console.log(`Timing data: ${result.timeTaken}`);
        return result.studentName === currentStudentName;
      });
      
      console.log('Final studentResults with timing:', studentResults);
      
      // Enhance results with missing data but keep original timeTaken
      studentResults = studentResults.map(result => {
        const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        const quiz = savedQuizzes.find(q => q.id === result.quizId);
        return {
          ...result,
          quizTitle: result.quizTitle || quiz?.title || 'Quiz',
          correctAnswers: result.correctAnswers || result.score
        };
      });
      
      console.log('Enhanced localStorage results:', studentResults);
      
      // Sort results by completedAt date (latest first)
      const sortedResults = studentResults.sort((a, b) => 
        new Date(b.completedAt) - new Date(a.completedAt)
      );
      console.log('Setting results in state:', sortedResults);
      setResults(sortedResults);
      setLoading(false);
    } catch (err) {
      console.log('Overall fetch error:', err);
      setResults([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) return (
    <div className="modern-loading">
      <div className="modern-spinner"></div>
      Loading your results...
    </div>
  );

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
        margin: '0 0 2rem 0',
        textAlign: 'center'
      }}>
        My Quiz Results
      </h2>
      
      {results.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#6b7280',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          No quiz results found. Take some quizzes to see your results here!
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#3b82f6',
                color: 'white'
              }}>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>Quiz</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>Score</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>Correct/Total</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>Time Taken</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>Date</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => {
                // Fix score calculation - result.score is number of correct answers, not percentage
                const correctAnswers = result.correctAnswers || result.score || 0;
                const totalQuestions = result.totalQuestions || 1;
                const percentage = (correctAnswers / totalQuestions) * 100;
                const getScoreColor = (score) => {
                  if (score >= 80) return { bg: '#dcfce7', text: '#065f46' };
                  if (score >= 60) return { bg: '#fef3c7', text: '#92400e' };
                  return { bg: '#fef2f2', text: '#dc2626' };
                };
                const getScoreIcon = (score) => {
                  if (score >= 80) return '🏆';
                  if (score >= 60) return '✅';
                  return '📚';
                };
                const scoreColor = getScoreColor(percentage);
                
                return (
                  <tr key={result.id} style={{
                    backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <td style={{
                      padding: '1rem',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        display: 'inline-block'
                      }}>
                        {result.quizTitle || 'Quiz'}
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{
                        backgroundColor: scoreColor.bg,
                        color: scoreColor.text,
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600',
                        fontSize: '0.875rem'
                      }}>
                        <span>{getScoreIcon(percentage)}</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      {correctAnswers}/{totalQuestions}
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#6b7280'
                    }}>
                      {result.timeTaken || 'N/A'}
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#6b7280',
                      fontSize: '0.875rem'
                    }}>
                      {new Date(result.completedAt).toLocaleDateString()}
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{
                        backgroundColor: percentage >= 60 ? '#dcfce7' : '#fef2f2',
                        color: percentage >= 60 ? '#065f46' : '#dc2626',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        display: 'inline-block'
                      }}>
                        {percentage >= 60 ? '✅ Passed' : '❌ Failed'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentResults;