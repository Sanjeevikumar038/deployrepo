import React, { useState, useEffect } from 'react';
import EmailService from './EmailService';

const EmailNotifications = () => {
  const [emailHistory, setEmailHistory] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
    const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const history = EmailService.getEmailHistory();
    
    setQuizzes(savedQuizzes);
    setStudents(savedStudents);
    setEmailHistory(history);
  };

  const sendQuizReminders = async () => {
    if (!selectedQuiz) {
      setMessage('Please select a quiz first');
      return;
    }

    setSending(true);
    setMessage('Sending reminders...');

    const quiz = quizzes.find(q => q.id.toString() === selectedQuiz);
    const studentsWithEmail = students.filter(student => student.email);
    
    if (studentsWithEmail.length === 0) {
      setMessage('No students with email addresses found');
      setSending(false);
      return;
    }
    
    const emailPromises = studentsWithEmail.map(student => 
      EmailService.sendQuizReminder(student.email, quiz)
    );

    try {
      const results = await Promise.allSettled(emailPromises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      setMessage(`✅ Sent ${successful} reminder emails successfully!`);
      loadData();
    } catch (error) {
      setMessage('❌ Failed to send reminders');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const reminderEmails = emailHistory.filter(e => e.type === 'reminder');
  const resultEmails = emailHistory.filter(e => e.type === 'results');

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 0.5rem 0'
          }}>
            📧 Email Management
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Send reminders and track email notifications
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #3b82f6'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏰</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
              {reminderEmails.length}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Reminders Sent</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #10b981'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📊</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {resultEmails.length}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Results Sent</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #8b5cf6'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {students.filter(s => s.email).length}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Active Students</div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #f59e0b'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📧</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {emailHistory.length}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Emails</div>
          </div>
        </div>

        {/* Send Reminder Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '1.5rem'
          }}>
            ⏰ Send Quiz Reminder
          </h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Select Quiz
            </label>
            <select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: 'white',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <option value="">Choose a quiz...</option>
              {quizzes.map(quiz => (
                <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
              ))}
            </select>
          </div>

          <button
            onClick={sendQuizReminders}
            disabled={sending || !selectedQuiz}
            style={{
              backgroundColor: selectedQuiz && !sending ? '#3b82f6' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: selectedQuiz && !sending ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              transform: selectedQuiz && !sending ? 'translateY(0)' : 'none'
            }}
            onMouseOver={(e) => {
              if (selectedQuiz && !sending) {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (selectedQuiz && !sending) {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {sending ? '⏳ Sending...' : '📤 Send Reminder'}
          </button>

          {message && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: message.includes('❌') ? '#fef2f2' : '#f0fdf4',
              color: message.includes('❌') ? '#dc2626' : '#166534',
              border: `1px solid ${message.includes('❌') ? '#fecaca' : '#bbf7d0'}`,
              fontSize: '0.875rem'
            }}>
              {message}
            </div>
          )}
        </div>

        {/* Email Tables */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem'
        }}>
          
          {/* Reminder Emails */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⏰ Reminder Emails
              <span style={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px'
              }}>
                {reminderEmails.length}
              </span>
            </h3>
            
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}>
              {reminderEmails.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#9ca3af'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                  <p>No reminder emails sent yet</p>
                </div>
              ) : (
                reminderEmails.slice(-10).reverse().map((email, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    borderBottom: index < reminderEmails.slice(-10).length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#3b82f6',
                      borderRadius: '50%'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '500',
                        color: '#1e293b',
                        fontSize: '0.875rem'
                      }}>
                        {email.email}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#64748b'
                      }}>
                        {formatDate(email.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Result Emails */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📊 Result Emails
              <span style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                fontSize: '0.75rem',
                padding: '0.25rem 0.5rem',
                borderRadius: '12px'
              }}>
                {resultEmails.length}
              </span>
            </h3>
            
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '8px'
            }}>
              {resultEmails.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#9ca3af'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                  <p>No result emails sent yet</p>
                </div>
              ) : (
                resultEmails.slice(-10).reverse().map((email, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    borderBottom: index < resultEmails.slice(-10).length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      backgroundColor: '#10b981',
                      borderRadius: '50%'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontWeight: '500',
                        color: '#1e293b',
                        fontSize: '0.875rem'
                      }}>
                        {email.email}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#64748b'
                      }}>
                        {formatDate(email.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailNotifications;