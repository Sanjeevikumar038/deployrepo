import React, { useState, useEffect } from 'react';

const UserAccounts = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'student' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Update user statuses from localStorage
    const userStatuses = JSON.parse(localStorage.getItem('userStatuses') || '{}');
    setUsers(prevUsers => 
      prevUsers.map(user => ({
        ...user,
        active: userStatuses[user.name]?.active !== undefined ? userStatuses[user.name].active : user.active
      })).filter(user => !userStatuses[user.name]?.deleted)
    );
  }, []);

  const fetchUsers = async () => {
    try {
      // Try to fetch from database API first
      const response = await fetch('http://localhost:8080/api/students');
      if (response.ok) {
        const students = await response.json();
        const studentUsers = students.map(student => ({
          id: student.id,
          name: student.username,
          email: student.email || 'N/A',
          role: 'student',
          active: true,
          joinedDate: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
        }));
        setUsers(studentUsers);
      } else {
        // Fallback to localStorage
        const savedStudents = localStorage.getItem('students');
        const studentUsers = savedStudents ? JSON.parse(savedStudents).map((student, index) => ({
          id: index + 1,
          name: student.username,
          email: student.email || 'N/A',
          role: 'student',
          active: true,
          joinedDate: new Date().toISOString().split('T')[0]
        })) : [];
        setUsers(studentUsers);
      }
      setLoading(false);
    } catch (err) {
      // Fallback to localStorage on error
      const savedStudents = localStorage.getItem('students');
      const studentUsers = savedStudents ? JSON.parse(savedStudents).map((student, index) => ({
        id: index + 1,
        name: student.username,
        email: student.email || 'N/A',
        role: 'student',
        active: true,
        joinedDate: new Date().toISOString().split('T')[0]
      })) : [];
      setUsers(studentUsers);
      setLoading(false);
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    
    // Validate password length
    if (newUser.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    try {
      // Try API first
      const response = await fetch('http://localhost:8080/api/students/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUser.name,
          email: newUser.email,
          password: newUser.password
        })
      });
      
      if (response.ok) {
        // Refresh the user list from database
        fetchUsers();
        setNewUser({ name: '', email: '', password: '', role: 'student' });
        setShowAddForm(false);
      } else {
        const errorMsg = await response.text();
        alert(errorMsg);
      }
    } catch (error) {
      // Fallback to localStorage
      const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
      if (savedStudents.find(s => s.username === newUser.name)) {
        alert('Username already exists');
        return;
      }
      
      if (savedStudents.find(s => s.email === newUser.email)) {
        alert('Email already exists');
        return;
      }
      
      const newStudent = {
        username: newUser.name,
        email: newUser.email,
        password: newUser.password
      };
      const updatedStudents = [...savedStudents, newStudent];
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      
      const user = {
        id: Date.now(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        active: true,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', password: '', role: 'student' });
      setShowAddForm(false);
    }
  };

  const toggleUserStatus = (userId) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? {...user, active: !user.active} : user
    );
    setUsers(updatedUsers);
    
    // Update localStorage with user status
    const userStatuses = JSON.parse(localStorage.getItem('userStatuses') || '{}');
    const targetUser = updatedUsers.find(u => u.id === userId);
    if (targetUser) {
      userStatuses[targetUser.name] = { active: targetUser.active, deleted: false };
      localStorage.setItem('userStatuses', JSON.stringify(userStatuses));
    }
  };

  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? They will not be able to login or signup again.')) {
      const targetUser = users.find(u => u.id === userId);
      setUsers(users.filter(user => user.id !== userId));
      
      // Mark user as deleted in localStorage
      const userStatuses = JSON.parse(localStorage.getItem('userStatuses') || '{}');
      if (targetUser) {
        userStatuses[targetUser.name] = { active: false, deleted: true };
        localStorage.setItem('userStatuses', JSON.stringify(userStatuses));
        
        // Remove from students list
        const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
        const updatedStudents = savedStudents.filter(s => s.username !== targetUser.name);
        localStorage.setItem('students', JSON.stringify(updatedStudents));
      }
    }
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? { bg: '#fef3c7', text: '#92400e' } : { bg: '#dbeafe', text: '#1e40af' };
  };

  const getStatusColor = (active) => {
    return active ? { bg: '#dcfce7', text: '#065f46' } : { bg: '#fef2f2', text: '#dc2626' };
  };

  if (loading) return (
    <div style={{ 
      width: '100vw', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8fafc' 
    }}>
      Loading user accounts...
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
        Manage Student Accounts
      </h2>
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showAddForm ? '1.5rem' : '0' }}>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: showAddForm ? '#6b7280' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            {showAddForm ? 'Cancel' : 'Add New User'}
          </button>
          
          <div>
            <label style={{ marginRight: '1rem', fontWeight: '500', color: '#374151' }}>Sort by:</label>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ 
                padding: '0.5rem', 
                borderRadius: '6px', 
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                fontSize: '0.875rem'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
        
        {showAddForm && (
          <form onSubmit={addUser} style={{ display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Name:</label>
              <input
                type="text"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Email:</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Password:</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>Role:</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button 
              type="submit" 
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Add User
            </button>
          </form>
        )}
      </div>

      {users.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#6b7280',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          No users found.
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
                  fontSize: '1rem'
                }}>User</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>Email</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>Role</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>Status</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>Joined Date</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users
                .sort((a, b) => {
                  return sortOrder === 'newest' ? b.id - a.id : a.id - b.id;
                })
                .map((user, index) => {
                const roleColor = getRoleColor(user.role);
                const statusColor = getStatusColor(user.active);
                
                return (
                  <tr key={user.id} style={{
                    backgroundColor: index % 2 === 0 ? '#f8fafc' : 'white',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <td style={{
                      padding: '1rem',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <div style={{
                          fontSize: '1.5rem'
                        }}>
                          👤
                        </div>
                        <div>
                          <div style={{
                            fontWeight: '600',
                            color: '#1f2937'
                          }}>
                            {user.name}
                          </div>
                          <div style={{
                            color: '#6b7280',
                            fontSize: '0.875rem'
                          }}>
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#6b7280',
                      fontSize: '1rem'
                    }}>
                      {user.email}
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{
                        backgroundColor: roleColor.bg,
                        color: roleColor.text,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        display: 'inline-block'
                      }}>
                        {user.role === 'admin' ? '👑 Admin' : '🎓 Student'}
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{
                        backgroundColor: statusColor.bg,
                        color: statusColor.text,
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        display: 'inline-block'
                      }}>
                        {user.active ? '✅ Active' : '❌ Inactive'}
                      </div>
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      color: '#6b7280',
                      fontSize: '1rem'
                    }}>
                      {new Date(user.joinedDate).toLocaleDateString()}
                    </td>
                    <td style={{
                      padding: '1rem',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                          onClick={() => toggleUserStatus(user.id)}
                          style={{
                            backgroundColor: user.active ? '#f59e0b' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          {user.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 0.75rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
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

export default UserAccounts;