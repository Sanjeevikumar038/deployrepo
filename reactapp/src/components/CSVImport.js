import React, { useState } from 'react';
import './ModernUI.css';

const CSVImport = ({ availableQuizzes, onQuestionsImported }) => {
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [csvData, setCsvData] = useState('');
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');

  const sampleCSV = `Question Text,Option A,Option B,Option C,Option D,Correct Answer
What is 2+2?,2,3,4,5,C
What is the capital of France?,London,Paris,Berlin,Madrid,B
Which planet is closest to the Sun?,Venus,Earth,Mercury,Mars,C`;

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    if (headers.length < 6) {
      throw new Error('CSV must have at least 6 columns: Question Text, Option A, Option B, Option C, Option D, Correct Answer');
    }

    const questions = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 6) continue;

      const [questionText, optionA, optionB, optionC, optionD, correctAnswer] = values;
      
      const options = [
        { id: Date.now() + i * 4 + 1, optionText: optionA, isCorrect: correctAnswer.toUpperCase() === 'A' },
        { id: Date.now() + i * 4 + 2, optionText: optionB, isCorrect: correctAnswer.toUpperCase() === 'B' },
        { id: Date.now() + i * 4 + 3, optionText: optionC, isCorrect: correctAnswer.toUpperCase() === 'C' },
        { id: Date.now() + i * 4 + 4, optionText: optionD, isCorrect: correctAnswer.toUpperCase() === 'D' }
      ];

      questions.push({
        id: Date.now() + i,
        questionText: questionText.replace(/"/g, ''),
        options,
        quizId: selectedQuizId
      });
    }

    return questions;
  };

  const handleImport = async () => {
    if (!selectedQuizId) {
      setImportStatus('❌ Please select a quiz first');
      return;
    }

    if (!csvData.trim()) {
      setImportStatus('❌ Please paste CSV data');
      return;
    }
    
    // Validate CSV format before processing
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      setImportStatus('❌ CSV must have at least one question row');
      return;
    }

    setImporting(true);
    setImportStatus('📤 Importing questions...');

    try {
      const questions = parseCSV(csvData);
      const BASE_URL = 'http://localhost:8080';
      
      // Try to save to API first
      let apiSuccess = false;
      try {
        for (const question of questions) {
          const questionData = {
            questionText: question.questionText,
            questionType: 'MULTIPLE_CHOICE',
            options: question.options.map(opt => ({
              optionText: opt.optionText,
              isCorrect: opt.isCorrect
            }))
          };
          
          await fetch(`${BASE_URL}/api/quizzes/${selectedQuizId}/questions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(questionData)
          });
        }
        apiSuccess = true;
      } catch (apiError) {
        console.log('API failed, saving to localStorage:', apiError);
      }
      
      // Always save to localStorage as backup
      const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      const quizIndex = existingQuizzes.findIndex(q => q.id.toString() === selectedQuizId.toString());
      
      if (quizIndex !== -1) {
        if (!existingQuizzes[quizIndex].questions) {
          existingQuizzes[quizIndex].questions = [];
        }
        existingQuizzes[quizIndex].questions.push(...questions);
        localStorage.setItem('quizzes', JSON.stringify(existingQuizzes));
      }

      setImportStatus(`✅ Successfully imported ${questions.length} questions${apiSuccess ? ' to database' : ' to local storage'}`);
      setCsvData('');
      if (onQuestionsImported) onQuestionsImported(questions);
      
      setTimeout(() => setImportStatus(''), 3000);
    } catch (error) {
      setImportStatus(`❌ Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_questions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modern-card">
      <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📊 Import Questions from CSV
      </h3>

      <div className="modern-form-group">
        <label className="modern-form-label">Select Quiz:</label>
        <select 
          className="modern-form-select"
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
        >
          <option value="">Choose a quiz...</option>
          {availableQuizzes.map(quiz => (
            <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
          ))}
        </select>
      </div>

      <div className="modern-form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label className="modern-form-label">CSV Data:</label>
          <button 
            onClick={downloadSample}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            📥 Download Sample
          </button>
        </div>
        <textarea
          className="modern-form-textarea"
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="Paste your CSV data here..."
          rows="8"
          style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>CSV Format:</h4>
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '1rem', 
          borderRadius: '8px', 
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          border: '1px solid #e5e7eb'
        }}>
          Question Text,Option A,Option B,Option C,Option D,Correct Answer<br/>
          What is 2+2?,2,3,4,5,C<br/>
          What is the capital of France?,London,Paris,Berlin,Madrid,B
        </div>
      </div>

      {importStatus && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          backgroundColor: importStatus.includes('❌') ? '#fef2f2' : '#f0fdf4',
          color: importStatus.includes('❌') ? '#dc2626' : '#059669',
          border: `1px solid ${importStatus.includes('❌') ? '#fecaca' : '#bbf7d0'}`,
          fontWeight: '600'
        }}>
          {importStatus}
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={importing || !selectedQuizId || !csvData.trim()}
        className="modern-btn"
        style={{
          backgroundColor: importing ? '#9ca3af' : '#3b82f6',
          color: 'white',
          width: '100%',
          padding: '1rem',
          fontSize: '1rem',
          fontWeight: '600'
        }}
      >
        {importing ? '📤 Importing...' : '📊 Import Questions'}
      </button>
    </div>
  );
};

export default CSVImport;