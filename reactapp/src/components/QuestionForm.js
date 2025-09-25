import React, { useState } from 'react';
import axios from 'axios';

const QuestionForm = ({ quizId, onQuestionAdded }) => {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [options, setOptions] = useState([
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false }
  ]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!questionText || questionText.length < 5 || questionText.length > 500) {
      newErrors.questionText = 'Question text must be between 5 and 500 characters.';
    }
    const correctOptions = options.filter(opt => opt.isCorrect);
    if (correctOptions.length !== 1) {
      newErrors.options = 'Each question must have exactly one correct option';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].optionText = value;
    setOptions(newOptions);
  };

  const handleCorrectOptionChange = (index) => {
    const newOptions = options.map((option, i) => ({
      ...option,
      isCorrect: i === index
    }));
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    if (questionType === 'MULTIPLE_CHOICE') {
      setOptions([...options, { optionText: '', isCorrect: false }]);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleTypeChange = (e) => {
    setQuestionType(e.target.value);
    if (e.target.value === 'TRUE_FALSE') {
      setOptions([
        { optionText: 'True', isCorrect: false },
        { optionText: 'False', isCorrect: false }
      ]);
    } else {
      setOptions([
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false }
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setMessage('');
      return;
    }

    const newQuestion = {
      questionText,
      questionType,
      options,
    };

    try {
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
await axios.post(
`${BASE_URL}/quizzes/${quizId}/questions`,
newQuestion
);
setMessage('Question added!');
setQuestionText('');
setOptions(
questionType === 'TRUE_FALSE'
? [
{ optionText: 'True', isCorrect: false },
{ optionText: 'False', isCorrect: false }
]
: [
{ optionText: '', isCorrect: false },
{ optionText: '', isCorrect: false }
]
);
setErrors({});
onQuestionAdded();
} catch (err) {
// Fallback to localStorage when API fails
console.log('API failed, saving question to localStorage');
try {
  const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
  const quizIndex = quizzes.findIndex(q => q.id === quizId);
  
  if (quizIndex !== -1) {
    if (!quizzes[quizIndex].questions) {
      quizzes[quizIndex].questions = [];
    }
    
    const questionId = Date.now().toString();
    const questionWithId = { ...newQuestion, id: questionId };
    quizzes[quizIndex].questions.push(questionWithId);
    
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    
    // Dispatch event to update student dashboard
    window.dispatchEvent(new Event('questionsUpdated'));
    
    setMessage('Question added!');
    setQuestionText('');
    setOptions(
      questionType === 'TRUE_FALSE'
        ? [
            { optionText: 'True', isCorrect: false },
            { optionText: 'False', isCorrect: false }
          ]
        : [
            { optionText: '', isCorrect: false },
            { optionText: '', isCorrect: false }
          ]
    );
    setErrors({});
    onQuestionAdded();
  } else {
    setMessage('Quiz not found');
  }
} catch (localErr) {
  const apiErrors = err.response?.data?.errors || ['An unexpected error occurred.'];
  setMessage(Array.isArray(apiErrors) ? apiErrors.join(', ') : apiErrors.toString());
}
}
};

return (
<div className="question-form-container">
<h2>Add Question to Quiz</h2>
<form onSubmit={handleSubmit}>
<div className="form-group">
<label htmlFor="questionText">Question Text</label>
<input
type="text"
id="questionText"
value={questionText}
onChange={(e) => setQuestionText(e.target.value)}
placeholder="Enter your question"
/>
{errors.questionText && <span className="error-message">{errors.questionText}</span>}
</div>

<div className="form-group">
<label htmlFor="questionType">Question Type</label>
<select id="questionType" value={questionType} onChange={handleTypeChange}>
<option value="MULTIPLE_CHOICE">Multiple Choice</option>
<option value="TRUE_FALSE">True/False</option>
</select>
</div>

<h3>Options</h3>
{options.map((option, index) => (
<div key={index} className="option-group">
<input
type="radio"
name="correctOption"
checked={option.isCorrect}
onChange={() => handleCorrectOptionChange(index)}
/>
<input
type="text"
value={option.optionText}
onChange={(e) => handleOptionChange(index, e.target.value)}
readOnly={questionType === 'TRUE_FALSE'}
maxLength={200}
placeholder={questionType === 'TRUE_FALSE' ? option.optionText : `Enter option ${index + 1}`}
/>
{questionType === 'MULTIPLE_CHOICE' && options.length > 2 && (
<button type="button" onClick={() => handleRemoveOption(index)}>
Remove
</button>
)}
</div>
))}

{questionType === 'MULTIPLE_CHOICE' && (
<button 
  type="button" 
  onClick={handleAddOption}
  style={{
    backgroundColor: '#10b981',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginRight: '1rem',
    marginBottom: '1rem',
    fontSize: '1rem',
    fontWeight: '600'
  }}
>
Add Option
</button>
)}

{errors.options && <span className="error-message">{errors.options}</span>}
<button 
  type="submit"
  style={{
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600'
  }}
>
Add Question
</button>
</form>
{message && <p className="status-message">{message}</p>}
</div>
);
};

export default QuestionForm;