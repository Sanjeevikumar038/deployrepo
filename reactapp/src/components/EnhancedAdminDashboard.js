import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QuizForm from './QuizForm';
import QuestionForm from './QuestionForm';
import QuizList from './QuizList';
import AIQuestionGenerator from './AIQuestionGenerator';
import EmailNotifications from './EmailNotifications';
import CSVImport from './CSVImport';
import './ModernUI.css';

const EnhancedAdminDashboard = ({ 
  onManageQuizzes, 
  onQuestionBank, 
  onAllResults, 
  onUserAccounts,
  onLeaderboard,
  onQuizCreated,
  onQuestionAdded,
  onSelectQuiz,
  onViewQuestions,
  onDeleteQuiz,
  selectedQuizId,
  quizListKey
}) => {
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showEmailNotifications, setShowEmailNotifications] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [selectedQuizForQuestion, setSelectedQuizForQuestion] = useState(null);

  const [availableQuizzes, setAvailableQuizzes] = useState([]);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    loadQuizzes();
  }, [quizListKey]);

  const loadQuizzes = async () => {
    try {
      const BASE_URL = 'http://localhost:8080';
      const response = await axios.get(`${BASE_URL}/api/quizzes`);
      setAvailableQuizzes(response.data);
    } catch (error) {
      const localQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      setAvailableQuizzes(localQuizzes);
    }
  };

  const QuizSelector = ({ onQuizSelected }) => (
    <div className="modern-form-group" style={{ marginBottom: '1.5rem' }}>
      <label className="modern-form-label">Select Quiz to Add Questions:</label>
      <select 
        className="modern-form-select"
        onChange={(e) => onQuizSelected(e.target.value)}
        defaultValue=""
      >
        <option value="" disabled>Choose a quiz...</option>
        {availableQuizzes.map(quiz => (
          <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
        ))}
      </select>
    </div>
  );
  const [adminStats, setAdminStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    totalStudents: 0,
    totalAttempts: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [quizListKey]);

  useEffect(() => {
    const handleQuestionsUpdated = () => {
      loadAdminData();
      loadQuizzes();
    };
    const handleQuizCreated = () => {
      loadQuizzes();
      loadAdminData();
    };
    window.addEventListener('questionsUpdated', handleQuestionsUpdated);
    window.addEventListener('quizCreated', handleQuizCreated);
    return () => {
      window.removeEventListener('questionsUpdated', handleQuestionsUpdated);
      window.removeEventListener('quizCreated', handleQuizCreated);
    };
  }, []);

  const loadAdminData = async () => {
    try {
      const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
      const deletedQuestions = JSON.parse(localStorage.getItem('deletedQuestions') || '[]');

      console.log('Loading admin data:', { quizzes, students, attempts, deletedQuestions });

      // Count questions from localStorage first, then API as fallback
      let totalQuestions = 0;
      
      // First count localStorage questions
      quizzes.forEach(quiz => {
        if (quiz.questions) {
          const activeQuestions = quiz.questions.filter(q => !deletedQuestions.includes(q.id));
          totalQuestions += activeQuestions.length;
        }
      });
      
      // If no localStorage questions, try API
      if (totalQuestions === 0) {
        for (const quiz of quizzes) {
          try {
            const BASE_URL = 'http://localhost:8080';
            const questionsResponse = await axios.get(`${BASE_URL}/api/quizzes/${quiz.id}/questions`);
            const activeApiQuestions = questionsResponse.data.filter(q => !deletedQuestions.includes(q.id));
            totalQuestions += activeApiQuestions.length;
          } catch (qErr) {
            console.log(`Failed to fetch questions for quiz ${quiz.id}`);
          }
        }
      }

      // Get recent activity (last 10 attempts)
      const recentActivity = attempts
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
        .slice(0, 10);

      const newStats = {
        totalQuizzes: quizzes.length,
        totalQuestions,
        totalStudents: students.length,
        totalAttempts: attempts.length,
        recentActivity
      };

      console.log('New admin stats:', newStats);
      setAdminStats(newStats);
      setLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="modern-loading">
        <div className="modern-spinner"></div>
        Loading admin dashboard...
      </div>
    );
  }



  return (
    <>
      <style>
        {`
          .admin-main-content::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <div className="enhanced-admin-dashboard" style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', flexDirection: window.innerWidth <= 768 ? 'column' : 'row' }}>
      {/* Left Sidebar - Stats */}
      <div className="admin-left-sidebar" style={{ 
        width: window.innerWidth <= 768 ? '100%' : '20%',
        height: window.innerWidth <= 768 ? 'auto' : '100%',
        backgroundColor: '#f8fafc', 
        padding: window.innerWidth <= 768 ? '1rem' : '1.5rem 1rem',
        display: window.innerWidth <= 768 ? 'grid' : 'flex',
        gridTemplateColumns: window.innerWidth <= 768 ? 'repeat(auto-fit, minmax(150px, 1fr))' : 'none',
        flexDirection: 'column', 
        gap: '1rem',
        borderRight: window.innerWidth <= 768 ? 'none' : '1px solid #e5e7eb',
        borderBottom: window.innerWidth <= 768 ? '1px solid #e5e7eb' : 'none',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: '#3b82f6',
          borderRadius: '12px',
          padding: '1.5rem',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(59, 130, 246, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{adminStats.totalQuizzes}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Quizzes</div>
        </div>
        <div style={{
          backgroundColor: '#10b981',
          borderRadius: '12px',
          padding: '1.5rem',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❓</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{adminStats.totalQuestions}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Total Questions</div>
        </div>
        <div style={{
          backgroundColor: '#f59e0b',
          borderRadius: '12px',
          padding: '1.5rem',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{adminStats.totalStudents}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Students</div>
        </div>
        <div style={{
          backgroundColor: '#8b5cf6',
          borderRadius: '12px',
          padding: '1.5rem',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(139, 92, 246, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
          <div style={{ fontSize: '2rem', fontWeight: '700' }}>{adminStats.totalAttempts}</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Quiz Attempts</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main-content" style={{ 
        width: window.innerWidth <= 768 ? '100%' : '80%',
        padding: window.innerWidth <= 768 ? '1rem' : '1.5rem',
        overflowY: 'scroll',
        height: window.innerWidth <= 768 ? 'auto' : '100vh',
        flex: 1,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {/* Welcome Section */}
        <div className="modern-card">
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Administrative Interface
          </h2>
        </div>

        {/* Quick Actions */}
        <div className="modern-card">
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.5rem' }}>
            🚀 Quick Actions
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: window.innerWidth <= 480 ? '1fr' : window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', 
            gap: window.innerWidth <= 480 ? '1rem' : '1.5rem',
            width: '100%'
          }}>
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1rem', fontWeight: '600' }}>Create Quiz</h4>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
                  Start building a new quiz
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowCreateQuiz(!showCreateQuiz);
                  if (!showCreateQuiz) {
                    setTimeout(() => {
                      document.getElementById('create-quiz-form')?.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                      });
                    }, 100);
                  }
                }}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {showCreateQuiz ? 'Hide Form' : 'Create Quiz'}
              </button>
            </div>
            
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>❓</div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1rem', fontWeight: '600' }}>Add Questions</h4>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
                  Build your question bank
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowAddQuestion(!showAddQuestion);
                  if (!showAddQuestion) {
                    setTimeout(() => {
                      document.getElementById('add-question-form')?.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                      });
                    }, 100);
                  }
                }}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {showAddQuestion ? 'Hide Form' : 'Add Questions'}
              </button>
            </div>
            
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤖</div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1rem', fontWeight: '600' }}>AI Questions</h4>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
                  Generate questions with AI
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowAIGenerator(!showAIGenerator);
                  if (!showAIGenerator) {
                    setTimeout(() => {
                      document.getElementById('ai-generator-form')?.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                      });
                    }, 100);
                  }
                }}
                style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {showAIGenerator ? 'Hide Generator' : 'Generate Questions'}
              </button>
            </div>
            

            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📧</div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1rem', fontWeight: '600' }}>Email Notifications</h4>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
                  Send quiz reminders and results
                </p>
              </div>
              <button 
                onClick={() => setShowEmailNotifications(!showEmailNotifications)}
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {showEmailNotifications ? 'Hide Emails' : 'Manage Emails'}
              </button>
            </div>
            
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '1.5rem 1rem',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📊</div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1rem', fontWeight: '600' }}>CSV Import</h4>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
                  Import questions from Excel/CSV
                </p>
              </div>
              <button 
                onClick={() => setShowCSVImport(!showCSVImport)}
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {showCSVImport ? 'Hide Import' : 'Import CSV'}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="modern-nav admin-nav-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', 
          gap: '1rem', 
          width: '100%' 
        }}>
          <button className="modern-btn admin-nav-btn" onClick={onManageQuizzes} style={{ backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe', padding: '1rem', fontSize: '1rem', width: '100%', minHeight: '48px' }}>
            📝 Manage Quizzes
          </button>
          <button className="modern-btn admin-nav-btn" onClick={onQuestionBank} style={{ backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', padding: '1rem', fontSize: '1rem', width: '100%', minHeight: '48px' }}>
            🏦 Question Bank
          </button>
          <button className="modern-btn admin-nav-btn" onClick={onAllResults} style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '1rem', fontSize: '1rem', width: '100%', minHeight: '48px' }}>
            📊 Student Results
          </button>
          <button className="modern-btn admin-nav-btn" onClick={onLeaderboard} style={{ backgroundColor: '#fdf2f8', color: '#be185d', border: '1px solid #fbcfe8', padding: '1rem', fontSize: '1rem', width: '100%', minHeight: '48px' }}>
            🏆 Class Rankings
          </button>
          <button className="modern-btn admin-nav-btn" onClick={onUserAccounts} style={{ backgroundColor: '#ede9fe', color: '#5b21b6', border: '1px solid #c4b5fd', padding: '1rem', fontSize: '1rem', width: '100%', minHeight: '48px' }}>
            👥 User Accounts
          </button>
        </div>

        {/* Inline Forms */}
        {showCreateQuiz && (
          <div id="create-quiz-form" className="modern-card">
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Create New Quiz</h3>
            <QuizForm onQuizCreated={(quiz) => { onQuizCreated(quiz); setShowCreateQuiz(false); loadQuizzes(); }} />
          </div>
        )}
        
        {showAddQuestion && (
          <div id="add-question-form" className="modern-card">
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Add New Question</h3>
            <QuizSelector onQuizSelected={(quizId) => {
              // Show question form for selected quiz
              setSelectedQuizForQuestion(quizId);
            }} />
            {selectedQuizForQuestion && (
              <QuestionForm 
                quizId={selectedQuizForQuestion} 
                onQuestionAdded={(question) => { 
                  onQuestionAdded(question); 
                  setShowAddQuestion(false);
                  setSelectedQuizForQuestion(null);
                }} 
              />
            )}
          </div>
        )}
        
        {showAIGenerator && (
          <div id="ai-generator-form" className="modern-card">
            <AIQuestionGenerator 
              quizId={null}
              availableQuizzes={availableQuizzes}
              onQuestionsGenerated={(questions) => {
                onQuestionAdded();
                setShowAIGenerator(false);
                loadQuizzes();
              }}
            />
          </div>
        )}
        
        {showEmailNotifications && (
          <EmailNotifications />
        )}
        
        {showCSVImport && (
          <CSVImport 
            availableQuizzes={availableQuizzes}
            onQuestionsImported={(questions) => {
              onQuestionAdded();
              setShowCSVImport(false);
              loadQuizzes();
            }}
          />
        )}
        
        {/* Available Quizzes */}
        <div className="modern-card">
          <QuizList
            key={quizListKey}
            onSelectQuiz={onSelectQuiz}
            onViewQuestions={onViewQuestions}
            onDeleteQuiz={onDeleteQuiz}
            userRole="admin"
          />
          {selectedQuizId && (
            <div style={{ marginTop: '1rem' }}>
              <h4 style={{ color: 'var(--text-primary)' }}>Add Questions to Selected Quiz</h4>
              <QuestionForm quizId={selectedQuizId} onQuestionAdded={onQuestionAdded} />
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default EnhancedAdminDashboard;