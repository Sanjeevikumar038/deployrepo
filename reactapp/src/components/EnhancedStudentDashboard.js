import React, { useState, useEffect } from 'react';
import './ModernUI.css';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://deployrepo-i9b2.onrender.com/api';

const EnhancedStudentDashboard = ({ onSelectQuiz, onViewMyResults, onLeaderboard }) => {
  const [studentStats, setStudentStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    recentAttempts: []
  });
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentName] = useState(() => localStorage.getItem('username') || 'Student');
  const [forceUpdate, setForceUpdate] = useState(0);
  const [questionCounts, setQuestionCounts] = useState({});

  
  // Check if student has already taken this quiz
  const hasStudentTakenQuiz = (quiz) => {
    const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
    return attempts.some(attempt => 
      attempt.quizTitle === quiz.title && attempt.studentName === studentName
    );
  };

  // Check if student has retake permission
  const hasRetakePermission = (quiz) => {
    const permissions = JSON.parse(localStorage.getItem('retakePermissions') || '[]');
    return permissions.some(permission => 
      permission.quizTitle === quiz.title && permission.studentName === studentName
    );
  };



  useEffect(() => {
    loadStudentData();
  }, []);

  useEffect(() => {
    const handleQuestionsUpdated = () => {
      loadStudentData();
    };
    const handleRetakePermissionUpdated = () => {
      loadStudentData();
    };
    const handleQuizSubmitted = () => {
      loadStudentData();
      setForceUpdate(prev => prev + 1);
    };
    window.addEventListener('retakePermissionUpdated', handleRetakePermissionUpdated);
    window.addEventListener('quizSubmitted', handleQuizSubmitted);
    window.addEventListener('questionsUpdated', handleQuestionsUpdated);
    window.addEventListener('retakePermissionUpdated', handleRetakePermissionUpdated);
    return () => {
      window.removeEventListener('questionsUpdated', handleQuestionsUpdated);
      window.removeEventListener('retakePermissionUpdated', handleRetakePermissionUpdated);
      window.removeEventListener('quizSubmitted', handleQuizSubmitted);
    };
  }, []);

  const loadStudentData = async () => {
    try {
      const username = localStorage.getItem('username');
      
      // Load quizzes from localStorage (includes questions)
      const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      
      const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
      
      // Filter attempts for current student
      const studentAttempts = attempts.filter(attempt => attempt.studentName === username);
      
      // Calculate stats
      const completedQuizIds = [...new Set(studentAttempts.map(attempt => attempt.quizId))];
      const totalScore = studentAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
      const averageScore = studentAttempts.length > 0 ? Math.round(totalScore / studentAttempts.length) : 0;
      
      // Get recent attempts (last 5)
      const recentAttempts = studentAttempts
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 5);

      setStudentStats({
        totalQuizzes: quizzes.length,
        completedQuizzes: completedQuizIds.length,
        averageScore,
        recentAttempts
      });

      // Load question counts for each quiz
      const counts = {};
      const deletedQuestions = JSON.parse(localStorage.getItem('deletedQuestions') || '[]');
      
      for (const quiz of quizzes) {
        try {
          const response = await fetch(`${BASE_URL}/quizzes/${quiz.id}/questions`);
          if (response.ok) {
            const questions = await response.json();
            const activeQuestions = questions.filter(q => !deletedQuestions.includes(q.id));
            counts[quiz.id] = activeQuestions.length;
          } else {
            counts[quiz.id] = 0;
          }
        } catch (err) {
          counts[quiz.id] = 0;
        }
      }
      setQuestionCounts(counts);
      
      setAvailableQuizzes(quizzes);
      setLoading(false);
    } catch (error) {
      console.error('Error loading student data:', error);
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="modern-loading">
        <div className="modern-spinner"></div>
        Loading your dashboard...
      </div>
    );
  }



  return (
    <div className="enhanced-student-dashboard" style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', flexDirection: window.innerWidth <= 768 ? 'column' : 'row' }}>
      {/* Stats Section */}
      <div className="student-left-sidebar" style={{ 
        width: window.innerWidth <= 768 ? '100%' : '20%',
        height: window.innerWidth <= 768 ? 'auto' : '100%',
        backgroundColor: '#f8fafc', 
        padding: window.innerWidth <= 768 ? '1rem' : '1.5rem 1rem',
        display: window.innerWidth <= 768 ? 'grid' : 'flex',
        gridTemplateColumns: window.innerWidth <= 768 ? 'repeat(3, 1fr)' : 'none',
        flexDirection: 'column', 
        gap: '1rem',
        borderRight: window.innerWidth <= 768 ? 'none' : '1px solid #e5e7eb',
        borderBottom: window.innerWidth <= 768 ? '1px solid #e5e7eb' : 'none',
        overflow: 'hidden'
      }}>
        <div className="student-stats-card" style={{
          backgroundColor: '#3b82f6',
          borderRadius: '12px',
          padding: '1.5rem',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
        }}>
          <div className="student-stats-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</div>
          <div className="student-stats-number" style={{ fontSize: '2rem', fontWeight: '700' }}>{studentStats.totalQuizzes}</div>
          <div className="student-stats-label" style={{ fontSize: '0.875rem', opacity: 0.9 }}>Available Quizzes</div>
        </div>
        <div className="student-stats-card" style={{
          backgroundColor: '#10b981',
          borderRadius: '12px',
          padding: '1.5rem',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
        }}>
          <div className="student-stats-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
          <div className="student-stats-number" style={{ fontSize: '2rem', fontWeight: '700' }}>{studentStats.completedQuizzes}</div>
          <div className="student-stats-label" style={{ fontSize: '0.875rem', opacity: 0.9 }}>Completed Quizzes</div>
        </div>
        <div className="student-stats-card" style={{
          backgroundColor: '#f59e0b',
          borderRadius: '12px',
          padding: '1.5rem',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)'
        }}>
          <div className="student-stats-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
          <div className="student-stats-number" style={{ fontSize: '2rem', fontWeight: '700' }}>{studentStats.averageScore}%</div>
          <div className="student-stats-label" style={{ fontSize: '0.875rem', opacity: 0.9 }}>Average Score</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="student-main-content" style={{ 
        width: window.innerWidth <= 768 ? '100%' : '80%',
        padding: window.innerWidth <= 768 ? '1rem' : '1.5rem',
        overflowY: 'auto',
        height: window.innerWidth <= 768 ? 'auto' : '100vh',
        flex: 1
      }}>
        {/* Welcome Section */}
        <div className="modern-card">
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Welcome back, {localStorage.getItem('username')}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Test your knowledge and track your progress with our interactive quizzes.
          </p>
        </div>

        {/* Available Quizzes */}
        <div className="modern-card">
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Available Quizzes
          </h3>
          {availableQuizzes.length === 0 ? (
            <div className="modern-alert modern-alert-warning">
              No quizzes available at the moment. Check back later!
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {availableQuizzes.map(quiz => (
                <div key={`${quiz.id}-${forceUpdate}`} className="modern-card quiz-card-mobile" style={{ margin: 0, padding: '1rem', position: 'relative' }}>
                  <div className="quiz-card-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: 'var(--text-primary)', margin: '0 0 0.5rem 0', textAlign: 'left' }}>
                        {quiz.title}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', margin: '0 0 1rem 0', fontSize: '0.875rem', textAlign: 'left' }}>
                        {quiz.description}
                      </p>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span>⏱️ {quiz.timeLimit} minutes</span>
                        <span>❓ {questionCounts[quiz.id] || 0} questions</span>
                      </div>
                    </div>
                    {hasStudentTakenQuiz(quiz) && !hasRetakePermission(quiz) ? (
                      <button 
                        className="modern-btn quiz-card-button"
                        style={{ 
                          marginLeft: '1rem', 
                          backgroundColor: '#10b981', 
                          color: 'white', 
                          cursor: 'default' 
                        }}
                        disabled
                      >
                        Submitted
                      </button>
                    ) : (
                      <button 
                        className="modern-btn modern-btn-primary quiz-card-button"
                        onClick={() => onSelectQuiz(quiz.id)}
                        style={{ marginLeft: '1rem' }}
                      >
                        {hasStudentTakenQuiz(quiz) ? 'Retake Quiz' : 'Start Quiz'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="student-action-buttons" style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '1rem' }}>
            <button className="modern-btn student-action-btn" onClick={onViewMyResults} style={{ backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe', padding: '1rem', fontSize: '1rem', flex: 1 }}>
              📊 View My Results
            </button>
            <button className="modern-btn student-action-btn" onClick={onLeaderboard} style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '1rem', fontSize: '1rem', flex: 1 }}>
              🏆 Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStudentDashboard;