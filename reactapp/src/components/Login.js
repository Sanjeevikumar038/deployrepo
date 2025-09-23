import React, { useState, useEffect } from 'react';
import './ModernUI.css';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '', email: '' });
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [adminError, setAdminError] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Load students and migrate to database
  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      const studentList = JSON.parse(savedStudents);
      setStudents(studentList);
      
      // Migrate to database
      migrateStudentsToDatabase(studentList);
    }
    
    // Listen for admin modal open event from navbar
    const handleOpenAdminModal = () => {
      setShowAdminModal(true);
    };
    
    window.addEventListener('openAdminModal', handleOpenAdminModal);
    
    return () => {
      window.removeEventListener('openAdminModal', handleOpenAdminModal);
    };
  }, []);

  // Migrate localStorage students to database
  const migrateStudentsToDatabase = async (students) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/students/migrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(students)
      });
      console.log('Students migrated to database');
    } catch (error) {
      console.log('Migration failed, continuing with localStorage');
    }
  };

  // Save students to localStorage
  const saveStudents = (studentList) => {
    localStorage.setItem('students', JSON.stringify(studentList));
    setStudents(studentList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignup) {
        // Student signup via API
        if (credentials.username.length < 3) {
          setError('Username must be at least 3 characters');
          setIsLoading(false);
          return;
        }
        if (credentials.password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/students/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        
        if (response.ok) {
          const student = await response.json();
          localStorage.setItem('username', student.username);
          setIsLoading(false);
          onLogin();
        } else {
          const errorMsg = await response.text();
          setError(errorMsg);
          setIsLoading(false);
        }
      } else {
        // Student login via API
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/students/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: credentials.username, password: credentials.password })
        });
        
        if (response.ok) {
          const student = await response.json();
          localStorage.setItem('username', student.username);
          setIsLoading(false);
          onLogin();
        } else {
          const errorMsg = await response.text();
          setError(errorMsg);
          setIsLoading(false);
        }
      }
    } catch (error) {
      // Fallback to localStorage if API fails
      console.log('API failed, using localStorage fallback');
      
      if (isSignup) {
        if (students.find(s => s.username === credentials.username)) {
          setError('Username already exists');
          setIsLoading(false);
          return;
        }
        
        if (students.find(s => s.email === credentials.email)) {
          setError('Email already exists');
          setIsLoading(false);
          return;
        }
        
        const newStudent = { username: credentials.username, password: credentials.password, email: credentials.email };
        const updatedStudents = [...students, newStudent];
        saveStudents(updatedStudents);
        localStorage.setItem('username', credentials.username);
        setIsLoading(false);
        onLogin();
      } else {
        const student = students.find(s => s.username === credentials.username && s.password === credentials.password);
        if (student) {
          localStorage.setItem('username', credentials.username);
          setIsLoading(false);
          onLogin();
        } else {
          setError('Invalid credentials');
          setIsLoading(false);
        }
      }
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);

    await new Promise(resolve => setTimeout(resolve, 300));

    if (adminCredentials.username === 'admin' && adminCredentials.password === 'admin123') {
      localStorage.setItem('username', 'admin');
      localStorage.setItem('userRole', 'admin');
      setAdminLoading(false);
      setShowAdminModal(false);
      onLogin('admin');
    } else {
      setAdminError('Invalid admin credentials');
      setAdminLoading(false);
    }
  };

  return (
    <div className="login-page-wide" style={{
      marginTop: 0,
      paddingTop: 0,
      height: 'calc(100vh - 156px)'
    }}>
      <div className="login-left-panel" style={{
        background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          height: '100%',
          color: 'white',
          textAlign: 'center',
          padding: '2rem',
          paddingTop: '6rem'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>🎓</div>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            textAlign: 'center',
            margin: '0 0 1rem 0'
          }}>QuizMaster</h1>
          <p style={{
            fontSize: '1.2rem',
            opacity: 0.9,
            lineHeight: '1.6',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            margin: '0',
            marginTop: '3rem'
          }}>Test Your Knowledge, Track Your Growth</p>
        </div>
      </div>
      
      <div className="login-right-panel" style={{
        background: '#ffffff'
      }}>
        <div className="login-form-container">
          <div className="form-header" style={{
            transform: isSignup ? 'translateY(-10px)' : 'translateY(0)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <h2 style={{
              transform: isSignup ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
            <p style={{
              opacity: isSignup ? 0.9 : 0.7,
              transition: 'opacity 0.4s ease'
            }}>{isSignup ? 'Start your learning journey today' : 'Please sign in to your account'}</p>
          </div>

          <form onSubmit={handleSubmit} className="wide-login-form" style={{
            transform: isSignup ? 'translateX(5px)' : 'translateX(0)',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            {isSignup && (
              <div className="input-group" style={{
                opacity: isSignup ? 1 : 0,
                transform: isSignup ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
                maxHeight: isSignup ? '80px' : '0',
                overflow: 'hidden',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <label>Email</label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  placeholder="Enter your email"
                  required
                />
              </div>
            )}

            <div className="input-group" style={{
              transform: isSignup ? 'translateY(0)' : 'translateY(0)',
              transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <label>Username</label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="input-group" style={{
              transform: isSignup ? 'translateY(0)' : 'translateY(0)',
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <label>Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="error-alert">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"/>
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className={`submit-btn ${isLoading ? 'loading' : ''}`} disabled={isLoading} style={{
              transform: isSignup ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                isSignup ? 'Signup' : 'Sign In'
              )}
            </button>
          </form>



          <div className="form-footer" style={{
            transform: isSignup ? 'translateY(10px)' : 'translateY(0)',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <p>
              {isSignup ? 'Already have an account?' : 'New Student?'}
              <button 
                type="button" 
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError('');
                  setCredentials({ username: '', password: '', email: '' });
                }}
                className="switch-btn"
                style={{
                  transform: isSignup ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {isSignup ? 'Sign In' : 'Signup'}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Admin Login Modal */}
      {showAdminModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            width: '400px',
            maxWidth: '90vw',
            boxShadow: '0 20px 25px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              textAlign: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '0.5rem'
              }}>👑 Admin Login</h3>
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem'
              }}>Enter admin credentials to access dashboard</p>
            </div>
            
            <form onSubmit={handleAdminLogin}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>Username</label>
                <input
                  type="text"
                  value={adminCredentials.username}
                  onChange={(e) => setAdminCredentials({...adminCredentials, username: e.target.value})}
                  placeholder="Enter admin username"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>Password</label>
                <input
                  type="password"
                  value={adminCredentials.password}
                  onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
                  placeholder="Enter admin password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
              
              {adminError && (
                <div style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  textAlign: 'center'
                }}>
                  {adminError}
                </div>
              )}
              
              <div style={{
                display: 'flex',
                gap: '0.75rem'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminModal(false);
                    setAdminCredentials({ username: '', password: '' });
                    setAdminError('');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminLoading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    backgroundColor: adminLoading ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: adminLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {adminLoading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;