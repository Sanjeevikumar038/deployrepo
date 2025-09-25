import React, { useState } from 'react';
import axios from 'axios';
import { useToast, ToastContainer } from './Toast';

const QuizForm = ({ onQuizCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [errors, setErrors] = useState({});
  const { toasts, addToast, removeToast } = useToast();

  const validateForm = () => {
    const newErrors = {};
    if (!title || title.length < 3 || title.length > 100) {
      newErrors.title = 'Quiz title must be between 3 and 100 characters.';
    }
    if (!description || description.length < 5) {
      newErrors.description = 'Quiz description is required (minimum 5 characters).';
    }

    const parsedTimeLimit = parseInt(timeLimit);
    if (isNaN(parsedTimeLimit) || parsedTimeLimit < 1 || parsedTimeLimit > 180) {
      newErrors.timeLimit = 'Time limit must be a number between 1 and 180 minutes.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const newQuiz = { 
      id: Date.now(), 
      title, 
      description, 
      timeLimit: parseInt(timeLimit),
      createdAt: new Date().toISOString()
    };

    try {
      // Try API first
      const BASE_URL = process.env.REACT_APP_API_URL || 'https://deployrepo-i9b2.onrender.com/api';
      await axios.post(`${BASE_URL}/quizzes`, newQuiz);
      addToast('Quiz created successfully!', 'success');
    } catch (err) {
      // Fallback to localStorage
      console.log('API failed, using localStorage');
      const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
      existingQuizzes.push(newQuiz);
      localStorage.setItem('quizzes', JSON.stringify(existingQuizzes));
      addToast('Quiz created successfully (offline mode)!', 'success');
    }
    
    // Reset form
    setTitle('');
    setDescription('');
    setTimeLimit('');
    setErrors({});
    onQuizCreated();
  };

return (
<div className="quiz-form-container">
<h2>Create New Quiz</h2>
<form onSubmit={handleSubmit} className="quiz-form">
<div className="form-group">
<label htmlFor="title-input">Title</label>
<input
type="text"
id="title-input"
value={title}
onChange={(e) => setTitle(e.target.value)}
placeholder="Enter quiz title (e.g., Java Basics Quiz)"
/>
{errors.title && <span className="error-message">{errors.title}</span>}
</div>
<div className="form-group">
<label htmlFor="description-input">Description</label>
<textarea
id="description-input"
value={description}
onChange={(e) => setDescription(e.target.value)}
placeholder="Enter quiz description"
/>
{errors.description && <span className="error-message">{errors.description}</span>}
</div>
<div className="form-group">
<label htmlFor="timeLimit">Time Limit (minutes)</label>
<input
type="number"
id="timeLimit"
value={timeLimit}
onChange={(e) => setTimeLimit(e.target.value)}
placeholder="Enter time limit (1-180 minutes)"
/>
{errors.timeLimit && <span className="error-message">{errors.timeLimit}</span>}
</div>
<button type="submit" className="create-quiz-button">Create Quiz</button>
</form>
<ToastContainer toasts={toasts} removeToast={removeToast} />
</div>
);
};

export default QuizForm;