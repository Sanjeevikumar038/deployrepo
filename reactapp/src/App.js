import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import './components/Navigation.css';
import TakeQuiz from './components/TakeQuiz';
import QuizResults from './components/QuizResults';
import QuizViewQuestions from './components/QuizViewQuestions';
import Login from './components/Login';
import StudentResults from './components/StudentResults';
import Leaderboard from './components/Leaderboard';
import EnhancedStudentDashboard from './components/EnhancedStudentDashboard';
import EnhancedAdminDashboard from './components/EnhancedAdminDashboard';
import ManageQuizzes from './components/ManageQuizzes';
import QuestionBank from './components/QuestionBank';
import AllStudentResults from './components/AllStudentResults';
import UserAccounts from './components/UserAccounts';
import AdminLeaderboard from './components/AdminLeaderboard';
import EmailService from './components/EmailService';

function AppWithRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quizListKey, setQuizListKey] = useState(0);
  const [attemptResult, setAttemptResult] = useState(null);
  const [view, setView] = useState('login');
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    EmailService.initialize();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setView('login');
      if (location.pathname !== '/login') navigate('/login');
      return;
    }
    
    const path = location.pathname;
    if (path === '/') {
      if (userRole) {
        const dashboardView = userRole === 'admin' ? 'admin-dashboard' : 'student-dashboard';
        setView(dashboardView);
        navigate(userRole === 'admin' ? '/admin' : '/student');
      } else {
        setView('login');
        navigate('/login');
      }
    }
    else if (path === '/login') {
      if (userRole) {
        const dashboardView = userRole === 'admin' ? 'admin-dashboard' : 'student-dashboard';
        setView(dashboardView);
        navigate(userRole === 'admin' ? '/admin' : '/student');
      } else {
        setView('login');
      }
    }
    else if (path === '/admin') setView('admin-dashboard');
    else if (path === '/student') setView('student-dashboard');
    else if (path === '/manage-quizzes') setView('manage-quizzes');
    else if (path === '/question-bank') setView('question-bank');
    else if (path === '/all-results') setView('all-results');
    else if (path === '/user-accounts') setView('user-accounts');
    else if (path === '/admin-leaderboard') setView('admin-leaderboard');
    else if (path === '/my-results') setView('my-results');
    else if (path === '/student-leaderboard') setView('student-leaderboard');
    else if (path.startsWith('/take-quiz/')) {
      setView('take-quiz');
      setSelectedQuizId(path.split('/')[2]);
    }
    else if (path === '/results') setView('results');
    else if (path.startsWith('/view-questions/')) {
      setView('view-questions');
      setSelectedQuizId(path.split('/')[2]);
    }
  }, [location.pathname, isAuthenticated, userRole, navigate]);

  const handleLogin = (role = 'student') => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
    if (role === 'admin') {
      setView('admin-dashboard');
      navigate('/admin');
    } else {
      setView('student-dashboard');
      navigate('/student');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    setView('login');
    navigate('/login');
  };

  const handleQuizCreated = () => {
    setQuizListKey(prevKey => prevKey + 1);
    setSelectedQuizId(null);
  };

  const handleQuestionAdded = () => {
    setQuizListKey(prevKey => prevKey + 1);
  };

  const handleAdminSelectQuiz = (quizId) => {
    setSelectedQuizId(quizId);
  };

  const handleViewQuestions = (quizId) => {
    setSelectedQuizId(quizId);
    setView('view-questions');
    navigate(`/view-questions/${quizId}`);
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      const BASE_URL = process.env.REACT_APP_API_URL || 'https://deployrepo-i9b2.onrender.com/api';
      await fetch(`${BASE_URL}/quizzes/${quizId}`, {
        method: 'DELETE'
      });
      
      // Also remove from localStorage
      const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      const updatedQuizzes = quizzes.filter(quiz => quiz.id !== quizId);
      localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes));
      
      setQuizListKey(prevKey => prevKey + 1);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz. Please try again.');
    }
  };

  const handleStudentSelectQuiz = (quizId) => {
    setSelectedQuizId(quizId);
    setView('take-quiz');
    navigate(`/take-quiz/${quizId}`);
  };

  const handleQuizCompleted = (result) => {
    setAttemptResult(result);
    setView('results');
    navigate('/results');
  };

  const handleReturnHome = () => {
    if (userRole === 'admin') {
      setView('admin-dashboard');
      navigate('/admin');
    } else {
      setView('student-dashboard');
      navigate('/student');
    }
    setSelectedQuizId(null);
    setAttemptResult(null);
  };

  const handleViewMyResults = () => {
    setView('my-results');
    navigate('/my-results');
  };

  const handleStudentLeaderboard = () => {
    setView('student-leaderboard');
    navigate('/student-leaderboard');
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return <Login onLogin={handleLogin} />;
    }

    switch (view) {
      case 'login':
        return <Login onLogin={handleLogin} />;
      case 'admin-dashboard':
        return (
          <EnhancedAdminDashboard
            onManageQuizzes={() => { setView('manage-quizzes'); navigate('/manage-quizzes'); }}
            onQuestionBank={() => { setView('question-bank'); navigate('/question-bank'); }}
            onAllResults={() => { setView('all-results'); navigate('/all-results'); }}
            onUserAccounts={() => { setView('user-accounts'); navigate('/user-accounts'); }}
            onLeaderboard={() => { setView('admin-leaderboard'); navigate('/admin-leaderboard'); }}
            onSelectQuiz={handleAdminSelectQuiz}
            onViewQuestions={handleViewQuestions}
            onDeleteQuiz={handleDeleteQuiz}
            onQuizCreated={handleQuizCreated}
            onQuestionAdded={handleQuestionAdded}
            selectedQuizId={selectedQuizId}
            quizListKey={quizListKey}
          />
        );
      case 'manage-quizzes':
        return <ManageQuizzes onBack={handleReturnHome} />;
      case 'question-bank':
        return <QuestionBank onBack={handleReturnHome} />;
      case 'all-results':
        return <AllStudentResults onBack={handleReturnHome} />;
      case 'user-accounts':
        return <UserAccounts onBack={handleReturnHome} />;
      case 'admin-leaderboard':
        return <AdminLeaderboard onBack={handleReturnHome} />;
      case 'student-dashboard':
        return (
          <EnhancedStudentDashboard
            onSelectQuiz={handleStudentSelectQuiz}
            onViewMyResults={handleViewMyResults}
            onLeaderboard={handleStudentLeaderboard}
          />
        );
      case 'take-quiz':
        return <TakeQuiz quizId={selectedQuizId} onQuizCompleted={handleQuizCompleted} />;
      case 'results':
        return <QuizResults attempt={attemptResult} onReturnHome={handleReturnHome} />;
      case 'view-questions':
        return <QuizViewQuestions quizId={selectedQuizId} onReturnHome={handleReturnHome} />;
      case 'my-results':
        return <StudentResults />;
      case 'student-leaderboard':
        return <Leaderboard onBack={handleReturnHome} />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      {view !== 'take-quiz' && (
        <header className="App-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>QuizMaster</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {!isAuthenticated && view === 'login' && (
              <button
                onClick={() => {
                  // We need to pass this function to Login component
                  window.dispatchEvent(new CustomEvent('openAdminModal'));
                }}
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                }}
              >
                👆 Admin Login
              </button>
            )}
            {isAuthenticated && (
              <>
                {view !== 'admin-dashboard' && view !== 'student-dashboard' && view !== 'login' && (
                  <button onClick={handleReturnHome} className="home-button" style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', backgroundColor: '#0056b3', color: 'white', cursor: 'pointer' }}>Return to Home</button>
                )}
                <button onClick={handleLogout} className="logout-button" style={{ padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', backgroundColor: '#dc3545', color: 'white', cursor: 'pointer' }}>Logout</button>
              </>
            )}
          </div>
        </header>
      )}
      <div className="main-content" style={{ marginTop: view === 'take-quiz' ? '0' : 'auto' }}>
        {renderContent()}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<AppWithRouter />} />
      </Routes>
    </Router>
  );
}

export default App;