import React, { useState, useEffect, useCallback } from 'react';
import './ModernUI.css';
import './Leaderboard.css';

const Leaderboard = ({ onBack }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUser] = useState(() => localStorage.getItem('username') || 'Student');
  const [loading, setLoading] = useState(true);
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
      
      // Group attempts by student and calculate average scores
      const studentStats = {};
      
      filteredAttempts.forEach(attempt => {
        if (!studentStats[attempt.studentName]) {
          studentStats[attempt.studentName] = {
            studentName: attempt.studentName,
            totalScore: 0,
            totalAttempts: 0,
            quizzesTaken: new Set()
          };
        }
        
        studentStats[attempt.studentName].totalScore += attempt.score;
        studentStats[attempt.studentName].totalAttempts += 1;
        studentStats[attempt.studentName].quizzesTaken.add(attempt.quizTitle);
      });
      
      // Convert to array and calculate averages
      const leaderboard = Object.values(studentStats).map(student => ({
        studentName: student.studentName,
        averageScore: Math.round(student.totalScore / student.totalAttempts),
        totalAttempts: student.totalAttempts,
        quizzesTaken: student.quizzesTaken.size,
        isCurrentUser: student.studentName === currentUser
      }));
      
      // Sort by average score (descending)
      leaderboard.sort((a, b) => b.averageScore - a.averageScore);
      
      // Add rankings
      leaderboard.forEach((student, index) => {
        student.rank = index + 1;
      });
      
      setLeaderboardData(leaderboard);
      setLoading(false);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLoading(false);
    }
  }, [currentUser, selectedQuiz]);

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
        Loading leaderboard...
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      {/* Header with Filter */}
      <div className="leaderboard-header">
        <h2 style={{ 
          margin: 0, 
          color: '#1a202c', 
          fontSize: '2rem', 
          fontWeight: '700', 
          letterSpacing: '-0.025em' 
        }}>
          🏆 Class Leaderboard
        </h2>
        <div className="leaderboard-filter">
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

      {/* Leaderboard */}
      <div className="modern-card">
        {leaderboardData.length === 0 ? (
          <div className="modern-alert modern-alert-warning">
            No quiz attempts found. Complete some quizzes to see the leaderboard!
          </div>
        ) : (
          <div className="leaderboard-list">
            {leaderboardData.map((student, index) => (
              <div key={student.studentName} className={`admin-student-item ${student.isCurrentUser ? 'current-user' : ''}`}>
                {/* Rank */}
                <div className="rank-display" style={{ color: getRankColor(student.rank) }}>
                  {getRankIcon(student.rank)}
                </div>

                {/* Student Name */}
                <div className={`student-name ${student.isCurrentUser ? 'current-user-name' : ''}`}>
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
                    <div className={`admin-stat-value ${student.averageScore >= 80 ? 'high-score' : student.averageScore >= 60 ? 'medium-score' : 'low-score'}`}>
                      {student.averageScore}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {leaderboardData.length > 0 && (
        <div className="modern-card performance-summary">
          <h3 className="summary-title">
            Your Performance Summary
          </h3>
          {(() => {
            const currentUserData = leaderboardData.find(s => s.isCurrentUser);
            if (!currentUserData) {
              return (
                <p className="no-data-message">
                  Complete some quizzes to see your performance!
                </p>
              );
            }
            
            const totalStudents = leaderboardData.length;
            const percentile = Math.round(((totalStudents - currentUserData.rank + 1) / totalStudents) * 100);
            
            return (
              <div className="summary-stats">
                <div className="stat-item">
                  <div className="stat-value rank-value">
                    #{currentUserData.rank}
                  </div>
                  <div className="stat-label">
                    Your Rank
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-value percentile-value">
                    {percentile}%
                  </div>
                  <div className="stat-label">
                    Percentile
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-value average-value">
                    {currentUserData.averageScore}%
                  </div>
                  <div className="stat-label">
                    Average Score
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;