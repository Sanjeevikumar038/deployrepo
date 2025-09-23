import React, { useState } from 'react';

const MigrateStudents = () => {
  const [migrating, setMigrating] = useState(false);
  const [result, setResult] = useState('');

  const migrateStudents = async () => {
    setMigrating(true);
    setResult('');

    try {
      const students = JSON.parse(localStorage.getItem('students') || '[]');
      
      if (students.length === 0) {
        setResult('No students found in localStorage');
        setMigrating(false);
        return;
      }

      const response = await fetch('http://localhost:8080/api/students/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(students)
      });

      if (response.ok) {
        const savedStudents = await response.json();
        setResult(`Successfully migrated ${savedStudents.length} students to database`);
      } else {
        const error = await response.text();
        setResult(`Migration failed: ${error}`);
      }
    } catch (error) {
      setResult(`Error: ${error.message}`);
    }

    setMigrating(false);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      margin: '1rem 0',
      border: '1px solid #e5e7eb'
    }}>
      <h3>Migrate Students to Database</h3>
      <p>Click to migrate students from localStorage to Neon database:</p>
      
      <button
        onClick={migrateStudents}
        disabled={migrating}
        style={{
          backgroundColor: migrating ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '0.75rem 1.5rem',
          cursor: migrating ? 'not-allowed' : 'pointer',
          marginBottom: '1rem'
        }}
      >
        {migrating ? 'Migrating...' : 'Migrate Students'}
      </button>

      {result && (
        <div style={{
          padding: '0.75rem',
          borderRadius: '6px',
          backgroundColor: result.includes('Successfully') ? '#dcfce7' : '#fef2f2',
          color: result.includes('Successfully') ? '#166534' : '#dc2626',
          border: `1px solid ${result.includes('Successfully') ? '#bbf7d0' : '#fecaca'}`
        }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default MigrateStudents;