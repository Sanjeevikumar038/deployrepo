import React, { useState, useEffect, useCallback } from 'react';
import './ModernUI.css';
import './Leaderboard.css';

const AdminLeaderboard = ({ onBack }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [quizStats, setQuizStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [availableQuizzes, setAvailableQuizzes] = useState([]);

  const loadLeaderboardData = useCallback(() => {
    try {
      const attempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
      
      // Get unique quiz titles for filter dropdown
      const uniqueQuizzes = [...new Set(attempts.map(attempt => attempt.quizTitle))];
      setAvailableQuizzes(uniqueQuizzes);
      
      // Filter attempts by selected quiz if not 'all'
      const filteredAttempts = selectedQuiz === 'all' ? attempts : attempts.filter(attempt => attempt.quizTitle === selectedQuiz);
      
      // Overall student rankings
      const studentStats = {};
      const quizPerformance = {};
      
      filteredAttempts.forEach(attempt => {
        // Student stats
        if (!studentStats[attempt.studentName]) {
          studentStats[attempt.studentName] = {
            studentName: attempt.studentName,
            totalScore: 0,
            totalAttempts: 0,
            quizzesTaken: new Set(),
            bestScore: 0,
            worstScore: 100
          };
        }
        
        const student = studentStats[attempt.studentName];
        student.totalScore += attempt.score;
        student.totalAttempts += 1;
        student.quizzesTaken.add(attempt.quizTitle);
        student.bestScore = Math.max(student.bestScore, attempt.score);
        student.worstScore = Math.min(student.worstScore, attempt.score);
        
        // Quiz performance stats
        if (!quizPerformance[attempt.quizTitle]) {
          quizPerformance[attempt.quizTitle] = {
            quizTitle: attempt.quizTitle,
            totalAttempts: 0,
            totalScore: 0,
            highestScore: 0,
            lowestScore: 100,
            students: new Set()
          };
        }
        
        const quiz = quizPerformance[attempt.quizTitle];
        quiz.totalAttempts += 1;
        quiz.totalScore += attempt.score;
        quiz.highestScore = Math.max(quiz.highestScore, attempt.score);
        quiz.lowestScore = Math.min(quiz.lowestScore, attempt.score);
        quiz.students.add(attempt.studentName);
      });
      
      // Process student data
      const studentLeaderboard = Object.values(studentStats).map(student => ({
        ...student,
        averageScore: Math.round(student.totalScore / student.totalAttempts),
        quizzesTaken: student.quizzesTaken.size
      })).sort((a, b) => b.averageScore - a.averageScore);
      
      studentLeaderboard.forEach((student, index) => {
        student.rank = index + 1;
      });
      
      // Process quiz data
      const quizLeaderboard = Object.values(quizPerformance).map(quiz => ({
        ...quiz,
        averageScore: Math.round(quiz.totalScore / quiz.totalAttempts),
        studentsCount: quiz.students.size
      })).sort((a, b) => b.averageScore - a.averageScore);
      
      setLeaderboardData(studentLeaderboard);
      setQuizStats(quizLeaderboard);
      setLoading(false);
    } catch (error) {
      console.error('Error loading admin leaderboard:', error);
      setLoading(false);
    }
  }, [selectedQuiz]);

  useEffect(() => {
    loadLeaderboardData();
  }, [loadLeaderboardData]);

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return '#ffd700';
      case 2: return '#c0c0c0';
      case 3: return '#cd7f32';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="modern-loading">
        <div className="modern-spinner"></div>
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="admin-leaderboard-container">
      {/* Header with Tabs */}
      <div className="admin-leaderboard-header">
        <h2 style={{ 
          margin: 0, 
          color: '#1a202c', 
          fontSize: '2rem', 
          fontWeight: '700', 
          letterSpacing: '-0.025em' 
        }}>
          📊 Class Analytics & Rankings
        </h2>
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab('overall')}
            className={`modern-btn tab-btn ${activeTab === 'overall' ? 'active' : ''}`}
          >
            Student Rankings
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`modern-btn tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
          >
            Quiz Performance
          </button>
        </div>
      </div>

      {/* Student Rankings Tab */}
      {activeTab === 'overall' && (
        <div className="modern-card">
          <div className="rankings-header">
            <h3 className="rankings-title">
              🏆 Student Rankings
            </h3>
            <div className="rankings-filter">
              <label className="filter-label">Filter by Quiz:</label>
              <select
                value={selectedQuiz}
                onChange={(e) => setSelectedQuiz(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Quizzes (Overall)</option>
                {availableQuizzes.map(quiz => (
                  <option key={quiz} value={quiz}>{quiz}</option>
                ))}
              </select>
            </div>
          </div>
          {leaderboardData.length === 0 ? (
            <div className="modern-alert modern-alert-warning">
              No student data available yet.
            </div>
          ) : (
            <div className="leaderboard-list">
              {leaderboardData.map((student) => (
                <div key={student.studentName} className="admin-student-item">
                  {/* Rank */}
                  <div className="rank-display" style={{ color: getRankColor(student.rank) }}>
                    {getRankIcon(student.rank)}
                  </div>

                  {/* Student Name */}
                  <div className="student-name">
                    {student.studentName}
                  </div>

                  {/* Quiz Stats */}
                  <div className="student-info">
                    <div className="student-stats">
                      {selectedQuiz === 'all' 
                        ? `${student.quizzesTaken} quizzes • ${student.totalAttempts} attempts`
                        : `${student.totalAttempts} attempt${student.totalAttempts > 1 ? 's' : ''} on ${selectedQuiz}`
                      }
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="admin-student-stats">
                    <div className="admin-stat-item">
                      <div className="admin-stat-value high-score">
                        {selectedQuiz === 'all' ? student.averageScore : student.bestScore}%
                      </div>
                      <div className="admin-stat-label">{selectedQuiz === 'all' ? 'Average' : 'Score'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quiz Performance Tab */}
      {activeTab === 'quizzes' && (
        <div className="modern-card">
          <h3 className="rankings-title">
            📝 Quiz Performance Analysis
          </h3>
          {quizStats.length === 0 ? (
            <div className="modern-alert modern-alert-warning">
              No quiz data available yet.
            </div>
          ) : (
            <div className="leaderboard-list">
              {quizStats.map((quiz, index) => (
                <div key={quiz.quizTitle} className="quiz-performance-item">
                  <div className="quiz-performance-header">
                    <div>
                      <h4 className="quiz-title">
                        {quiz.quizTitle}
                      </h4>
                      <div className="quiz-meta">
                        {quiz.studentsCount} students • {quiz.totalAttempts} attempts
                      </div>
                    </div>
                    <div className={`quiz-average-score ${quiz.averageScore >= 80 ? 'high-score' : quiz.averageScore >= 60 ? 'medium-score' : 'low-score'}`}>
                      {quiz.averageScore}%
                    </div>
                  </div>
                  
                  <div className="quiz-stats-grid">
                    <div className="quiz-stat-card highest">
                      <div className="quiz-stat-value highest">
                        {quiz.highestScore}%
                      </div>
                      <div className="quiz-stat-label">Highest Score</div>
                    </div>
                    <div className="quiz-stat-card average">
                      <div className="quiz-stat-value average">
                        {quiz.averageScore}%
                      </div>
                      <div className="quiz-stat-label">Average Score</div>
                    </div>
                    <div className="quiz-stat-card lowest">
                      <div className="quiz-stat-value lowest">
                        {quiz.lowestScore}%
                      </div>
                      <div className="quiz-stat-label">Lowest Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminLeaderboard;