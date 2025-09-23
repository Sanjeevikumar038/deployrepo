import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const TakeQuiz = ({ quizId, onQuizCompleted }) => {
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [musicPlaying, setMusicPlaying] = useState(true);
    const [autoSaveStatus, setAutoSaveStatus] = useState('');
    const [studentName] = useState(() => {
        const username = localStorage.getItem('username') || localStorage.getItem('studentName') || 'Student';
        console.log('Current username from localStorage:', username);
        console.log('All localStorage keys:', Object.keys(localStorage));
        return username;
    });

    // Shuffle functions for randomization
    const shuffleArray = useCallback((array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, []);

    const shuffleQuestions = useCallback((questions) => {
        return shuffleArray(questions);
    }, [shuffleArray]);

    const shuffleOptions = useCallback((options) => {
        return shuffleArray(options);
    }, [shuffleArray]);

    // Simple beep function for last 10 seconds
    const playBeep = useCallback(() => {
        if (!musicPlaying) return;
        
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.frequency.setValueAtTime(800, ctx.currentTime); // Mild beep frequency
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime); // Low volume

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.2); // Short 0.2 second beep
    }, [musicPlaying]);

    // Fullscreen functions
    const enterFullscreen = async () => {
        try {
            const element = document.documentElement;
            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                await element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                await element.msRequestFullscreen();
            }
        } catch (error) {
            console.log('Fullscreen request failed:', error);
            // Continue with quiz even if fullscreen fails
        }
    };

    const exitFullscreen = async () => {
        try {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                await document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                await document.msExitFullscreen();
            }
        } catch (error) {
            console.log('Exit fullscreen failed:', error);
        }
    };

    // Auto-save progress
    useEffect(() => {
        if (answers.length > 0 && quizId) {
            const saveKey = `quiz_progress_${quizId}_${studentName}`;
            const progressData = {
                answers,
                currentQuestionIndex,
                timeLeft,
                savedAt: Date.now()
            };
            localStorage.setItem(saveKey, JSON.stringify(progressData));
            setAutoSaveStatus('✓ Saved');
            setTimeout(() => setAutoSaveStatus(''), 2000);
        }
    }, [answers, currentQuestionIndex, quizId, studentName, timeLeft]);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                
                const quizResponse = await axios.get(`${BASE_URL}/quizzes/${quizId}`);
                setQuiz(quizResponse.data);
                const questionsResponse = await axios.get(`${BASE_URL}/quizzes/${quizId}/questions`);
                
                // Get edited and deleted questions from localStorage
                const editedQuestions = JSON.parse(localStorage.getItem('editedQuestions') || '{}');
                const deletedQuestions = JSON.parse(localStorage.getItem('deletedQuestions') || '[]');
                console.log('Edited questions available:', editedQuestions);
                console.log('Deleted questions:', deletedQuestions);
                
                // Filter out deleted questions and use edited versions if available
                const finalQuestions = questionsResponse.data
                    .filter(q => !deletedQuestions.includes(q.id)) // Remove deleted questions
                    .map(q => {
                        if (editedQuestions[q.id]) {
                            console.log('Using edited version for question:', q.id);
                            return editedQuestions[q.id];
                        }
                        return q;
                    });
                
                console.log('Final questions for quiz (after filtering deleted):', finalQuestions);
                
                // Shuffle questions for each student
                const shuffledQuestions = shuffleQuestions(finalQuestions);
                
                // Shuffle options for each question
                const questionsWithShuffledOptions = shuffledQuestions.map(question => ({
                    ...question,
                    options: shuffleOptions(question.options)
                }));
                
                console.log('Questions and options shuffled for student:', questionsWithShuffledOptions);
                setQuestions(questionsWithShuffledOptions);
                
                // Check for saved progress
                const saveKey = `quiz_progress_${quizId}_${studentName}`;
                const savedProgress = localStorage.getItem(saveKey);
                
                if (savedProgress) {
                    const progressData = JSON.parse(savedProgress);
                    setAnswers(progressData.answers || []);
                    setCurrentQuestionIndex(progressData.currentQuestionIndex || 0);
                    setTimeLeft(progressData.timeLeft || quizResponse.data.timeLimit * 60);
                    setAutoSaveStatus('📂 Progress restored');
                    setTimeout(() => setAutoSaveStatus(''), 3000);
                } else {
                    setTimeLeft(quizResponse.data.timeLimit * 60);
                }
                
                setStartTime(Date.now());
                
                // Auto-enter fullscreen when quiz loads (with user interaction)
                setTimeout(() => {
                    if (document.documentElement.requestFullscreen) {
                        enterFullscreen();
                    }
                }, 1000);
            } catch (err) {
                const apiErrors = err.response?.data?.errors || ['Failed to load quiz. Please check backend and URL.'];
                setError(Array.isArray(apiErrors) ? apiErrors.join(', ') : apiErrors.toString());
                console.error('Error fetching quiz or questions:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId, shuffleQuestions, shuffleOptions, studentName]);

    const handleSubmitQuiz = useCallback(async () => {
try {
const submission = {
quizId: quiz.id,
studentName: studentName,
answers
};
console.log('Submitting quiz with data:', submission);

// Calculate score
console.log('=== SCORING DEBUG ===');
console.log('Total answers:', answers.length);
console.log('Total questions:', questions.length);
console.log('All answers:', answers);

const correctAnswers = answers.filter(answer => {
const question = questions.find(q => q.id === answer.questionId);
const selectedOption = question?.options.find(opt => opt.id === answer.selectedOptionId);
console.log('Question:', question?.questionText);
console.log('Selected option ID:', answer.selectedOptionId);
console.log('Selected option:', selectedOption);
console.log('Is correct:', selectedOption?.isCorrect);
return selectedOption?.isCorrect === true;
}).length;

console.log('Correct answers count:', correctAnswers);

const score = Math.round((correctAnswers / questions.length) * 100);
const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);
const timeTakenFormatted = `${Math.floor(timeTakenSeconds / 60)}:${(timeTakenSeconds % 60).toString().padStart(2, '0')}`;

// Create result object
const quizResult = {
id: Date.now(),
quizTitle: quiz.title,
studentName: studentName,
score: score,
correctAnswers: correctAnswers,
totalQuestions: questions.length,
completedAt: new Date().toISOString(),
timeTaken: timeTakenFormatted
};

// Always save to localStorage for local display
const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
existingResults.push(quizResult);
localStorage.setItem('quizResults', JSON.stringify(existingResults));

// Also save to quizAttempts for admin dashboard
const existingAttempts = JSON.parse(localStorage.getItem('quizAttempts') || '[]');
existingAttempts.push(quizResult);
localStorage.setItem('quizAttempts', JSON.stringify(existingAttempts));

// CRITICAL: Clear retake permission and saved progress
localStorage.setItem('retakePermissions', '[]');
const saveKey = `quiz_progress_${quiz.id}_${studentName}`;
localStorage.removeItem(saveKey);

// Force immediate dashboard refresh
window.dispatchEvent(new Event('quizSubmitted'));
window.dispatchEvent(new Event('retakePermissionUpdated'));

console.log('Saved to localStorage. All results:', existingResults);

// Mark quiz as completed to prevent fullscreen re-entry
setQuizCompleted(true);

// Exit fullscreen when quiz is completed
await exitFullscreen();

// Small delay to ensure fullscreen exit completes
setTimeout(() => {
// Try API as well
axios.post(`${BASE_URL}/quiz-attempts`, submission)
.then(result => {
console.log('Quiz submission successful:', result.data);
onQuizCompleted(result.data);
})
.catch(apiErr => {
console.log('API failed, but localStorage saved:', apiErr);
onQuizCompleted(quizResult);
});
}, 300);
} catch (err) {
const apiErrors = err.response?.data?.errors || ['Failed to submit quiz. Please try again.'];
setError(Array.isArray(apiErrors) ? apiErrors.join(', ') : apiErrors.toString());
console.error('Error submitting quiz:', err);
}
}, [quiz, studentName, answers, questions, startTime, onQuizCompleted]);

    // Handle fullscreen events and prevent exit
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isCurrentlyFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
            
            // If user tries to exit fullscreen during quiz, re-enter it (but not if quiz is completed)
            if (!isCurrentlyFullscreen && !loading && questions.length > 0 && !quizCompleted) {
                setTimeout(async () => {
                    try {
                        await enterFullscreen();
                    } catch (error) {
                        console.log('Re-entering fullscreen failed:', error);
                    }
                }, 500);
            }
        };

        // Prevent common exit shortcuts and copy/paste
        const handleKeyDown = (e) => {
            // Prevent F11, Escape, Alt+Tab, Ctrl+Shift+I, F12
            if (e.key === 'F11' || e.key === 'Escape' || 
                (e.altKey && e.key === 'Tab') ||
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                e.key === 'F12') {
                e.preventDefault();
                return false;
            }
            
            // Prevent copy/paste/cut operations
            if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x' || e.key === 'a' || e.key === 's')) {
                e.preventDefault();
                return false;
            }
        };

        // Prevent right-click context menu
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // Prevent clipboard operations
        const handleCopy = (e) => {
            e.preventDefault();
            return false;
        };

        const handlePaste = (e) => {
            e.preventDefault();
            return false;
        };

        const handleCut = (e) => {
            e.preventDefault();
            return false;
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('cut', handleCut);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('cut', handleCut);
        };
    }, [loading, questions.length, quizCompleted]);

    useEffect(() => {
        if (timeLeft > 0 && !loading) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleSubmitQuiz();
                        return 0;
                    }
                    
                    // Show warning at 1 minute (60 seconds)
                    if (prev === 61) {
                        setShowWarning(true);
                        setTimeout(() => setShowWarning(false), 5000); // Hide after 5 seconds
                    }
                    
                    // Beep in last 10 seconds
                    if (prev <= 10 && prev > 0) {
                        playBeep();
                    }
                    
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, loading, handleSubmitQuiz, playBeep]); 

    // Cleanup effect to exit fullscreen when component unmounts
    useEffect(() => {
        return () => {
            // Exit fullscreen when component unmounts (student leaves quiz)
            if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
                exitFullscreen();
            }
        };
    }, []);

    const handleAnswerSelect = (optionId) => {
        const existingAnswer = answers.find(a => a.questionId === questions[currentQuestionIndex].id);
        
if (existingAnswer) {
setAnswers(answers.map(a =>
a.questionId === questions[currentQuestionIndex].id ? { ...a, selectedOptionId: optionId } : a
));
} else {
setAnswers([...answers, { questionId: questions[currentQuestionIndex].id, selectedOptionId: optionId }]);
}
};

const handleNextQuestion = () => {
setCurrentQuestionIndex(currentQuestionIndex + 1);
};

const handlePreviousQuestion = () => {
setCurrentQuestionIndex(currentQuestionIndex - 1);
};

if (loading) return <LoadingSpinner />;
if (error) return <div className="error-state">Error: {error}</div>;
if (questions.length === 0) return <div className="empty-state">No questions available for this quiz.</div>;

const currentQuestion = questions[currentQuestionIndex];
const selectedOptionId = answers.find(a => a.questionId === currentQuestion.id)?.selectedOptionId;

return (
<div style={{ 
width: '100vw', 
height: '100vh', 
backgroundColor: '#f8fafc', 
margin: 0, 
padding: 0, 
overflow: 'hidden',
webkitUserSelect: 'none',
mozUserSelect: 'none',
msUserSelect: 'none',
userSelect: 'none',
webkitTouchCallout: 'none',
webkitTapHighlightColor: 'transparent'
}}>
{/* Warning Alert */}
{showWarning && (
<div style={{
position: 'fixed',
top: '50%',
left: '50%',
transform: 'translate(-50%, -50%)',
backgroundColor: '#dc2626',
color: 'white',
padding: '2rem 3rem',
borderRadius: '16px',
boxShadow: '0 20px 40px rgba(220, 38, 38, 0.4)',
zIndex: 9999,
fontSize: '1.5rem',
fontWeight: '700',
textAlign: 'center',
border: '3px solid #fecaca',
animation: 'pulse 1s infinite'
}}>
⚠️ WARNING: Only 1 minute remaining!
<br />
<span style={{ fontSize: '1rem', fontWeight: '500' }}>Please review your answers</span>
</div>
)}
{/* Header */}
<div style={{ 
display: 'flex', 
justifyContent: 'space-between', 
alignItems: 'center', 
height: '90px',
padding: '0 3rem',
backgroundColor: 'white',
borderBottom: '3px solid #e5e7eb',
boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
}}>
<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
<div style={{
width: '40px',
height: '40px',
backgroundColor: '#3b82f6',
borderRadius: '8px',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
color: 'white',
fontWeight: '700',
fontSize: '1.25rem'
}}>
Q
</div>
<h1 style={{ 
margin: 0, 
fontSize: '1.75rem', 
fontWeight: '700', 
color: '#1f2937',
letterSpacing: '-0.025em'
}}>
{quiz.title}
</h1>
{timeLeft <= 10 && (
<button
onClick={() => setMusicPlaying(!musicPlaying)}
style={{
padding: '0.5rem',
backgroundColor: musicPlaying ? '#10b981' : '#6b7280',
color: 'white',
border: 'none',
borderRadius: '8px',
fontSize: '1rem',
cursor: 'pointer',
marginLeft: '1rem'
}}
>
{musicPlaying ? '🎵' : '🔇'}
</button>
)}
</div>
<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
{autoSaveStatus && (
<div style={{
fontSize: '0.875rem',
color: '#10b981',
fontWeight: '600',
padding: '0.5rem 1rem',
backgroundColor: '#f0fdf4',
borderRadius: '8px',
border: '1px solid #bbf7d0'
}}>
{autoSaveStatus}
</div>
)}
<div style={{ 
position: 'relative',
display: 'flex',
alignItems: 'center',
gap: '1rem'
}}>
<div style={{
width: '60px',
height: '60px',
position: 'relative',
display: 'flex',
alignItems: 'center',
justifyContent: 'center'
}}>
<svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
<circle
cx="30"
cy="30"
r="25"
fill="none"
stroke="#e5e7eb"
strokeWidth="4"
/>
<circle
cx="30"
cy="30"
r="25"
fill="none"
stroke={timeLeft < 300 ? '#dc2626' : '#059669'}
strokeWidth="4"
strokeDasharray={`${2 * Math.PI * 25}`}
strokeDashoffset={`${2 * Math.PI * 25 * (1 - (timeLeft / (quiz?.timeLimit * 60 || 1)))}`}
strokeLinecap="round"
style={{ transition: 'stroke-dashoffset 1s linear' }}
/>
</svg>
<div style={{
position: 'absolute',
fontSize: '0.75rem',
fontWeight: '700',
color: timeLeft < 300 ? '#dc2626' : '#059669'
}}>
{Math.floor(timeLeft / 60)}
</div>
</div>
<div style={{ 
fontSize: '1.5rem', 
fontWeight: '700', 
color: timeLeft < 300 ? '#dc2626' : '#059669',
backgroundColor: timeLeft < 300 ? '#fef2f2' : '#f0fdf4',
padding: '1rem 2rem',
borderRadius: '12px',
border: `3px solid ${timeLeft < 300 ? '#fecaca' : '#bbf7d0'}`,
boxShadow: timeLeft < 300 ? '0 4px 12px rgba(220, 38, 38, 0.2)' : '0 4px 12px rgba(5, 150, 105, 0.2)',
display: 'flex',
alignItems: 'center',
gap: '0.5rem'
}}>
<span style={{ fontSize: '1.25rem' }}>{timeLeft < 300 ? '⏰' : '⏱️'}</span>
{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
</div>
</div>
</div>
</div>

{/* Main Content - Responsive Layout */}
<div style={{ 
  display: 'flex', 
  height: 'calc(100vh - 80px)',
  flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
}}>
{/* Question Numbers Panel */}
<div style={{ 
width: window.innerWidth <= 768 ? '100%' : '12%',
height: window.innerWidth <= 768 ? 'auto' : '100%',
backgroundColor: '#f8fafc', 
padding: window.innerWidth <= 768 ? '1rem' : '1.5rem 1rem',
borderRight: window.innerWidth <= 768 ? 'none' : '2px solid #e5e7eb',
borderBottom: window.innerWidth <= 768 ? '2px solid #e5e7eb' : 'none',
overflowY: 'auto',
boxShadow: window.innerWidth <= 768 ? 'inset 0 -2px 4px rgba(0,0,0,0.05)' : 'inset -2px 0 4px rgba(0,0,0,0.05)'
}}>
<h3 style={{ 
margin: '0 0 1.5rem 0', 
fontSize: '0.875rem', 
fontWeight: '700', 
color: '#1f2937', 
textAlign: 'center',
textTransform: 'uppercase',
letterSpacing: '0.05em'
}}>Questions</h3>
<div style={{ 
  display: 'grid', 
  gridTemplateColumns: window.innerWidth <= 768 ? 'repeat(auto-fit, minmax(40px, 1fr))' : '1fr', 
  gap: '0.75rem' 
}}>
{questions.map((_, index) => {
const isAnswered = answers.some(a => a.questionId === questions[index].id);
return (
<button
key={index}
onClick={() => setCurrentQuestionIndex(index)}
style={{
padding: '0.875rem',
border: currentQuestionIndex === index ? '2px solid #3b82f6' : '1px solid #d1d5db',
borderRadius: '8px',
cursor: 'pointer',
fontWeight: '600',
fontSize: '0.875rem',
backgroundColor: currentQuestionIndex === index ? '#3b82f6' : isAnswered ? '#10b981' : 'white',
color: currentQuestionIndex === index ? 'white' : isAnswered ? 'white' : '#374151',
transition: 'all 0.2s ease',
boxShadow: currentQuestionIndex === index ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
transform: currentQuestionIndex === index ? 'translateY(-1px)' : 'none'
}}
>
{index + 1}
</button>
);
})}
</div>
</div>

{/* Question Panel */}
<div style={{ 
width: window.innerWidth <= 768 ? '100%' : '43%',
height: window.innerWidth <= 768 ? 'auto' : '100%',
backgroundColor: 'white', 
padding: window.innerWidth <= 768 ? '1rem' : '2rem 2.5rem',
borderRight: window.innerWidth <= 768 ? 'none' : '2px solid #e5e7eb',
borderBottom: window.innerWidth <= 768 ? '2px solid #e5e7eb' : 'none',
overflow: 'auto'
}}>
<div style={{
marginBottom: '1.5rem',
fontSize: '0.875rem',
fontWeight: '600',
color: '#6b7280',
textTransform: 'uppercase',
letterSpacing: '0.05em',
paddingBottom: '0.75rem',
borderBottom: '2px solid #e5e7eb'
}}>
Question {currentQuestionIndex + 1} of {questions.length}
</div>
<h2 style={{ 
margin: '0', 
fontSize: '1.375rem', 
fontWeight: '600', 
color: '#1f2937',
lineHeight: '1.7',
textAlign: 'left'
}}>
{currentQuestion.questionText}
</h2>
</div>

{/* Options & Navigation Panel */}
<div style={{ 
width: window.innerWidth <= 768 ? '100%' : '45%',
height: window.innerWidth <= 768 ? 'auto' : '100%',
backgroundColor: '#fafbfc', 
padding: window.innerWidth <= 768 ? '1rem' : '4rem 2.5rem 3rem 2.5rem',
display: 'flex',
flexDirection: 'column',
flex: 1
}}>
<div style={{ 
flex: 1, 
display: 'flex',
flexDirection: 'column'
}}>
<h3 style={{
margin: '0 0 1.5rem 0',
fontSize: '1.125rem',
fontWeight: '600',
color: '#374151',
textAlign: 'center'
}}>
Choose the correct option:
</h3>
<div style={{
flex: 1,
overflowY: 'auto',
marginBottom: '2rem',
paddingTop: '1rem'
}}>
{currentQuestion.options.map((option, index) => (
<label
key={option.id}
style={{
display: 'flex',
alignItems: 'center',
padding: '1.5rem 1.5rem 1.25rem 1.5rem',
marginBottom: '1rem',
border: '2px solid',
borderColor: selectedOptionId === option.id ? '#3b82f6' : '#d1d5db',
borderRadius: '12px',
cursor: 'pointer',
backgroundColor: selectedOptionId === option.id ? '#eff6ff' : 'white',
transition: 'all 0.3s ease',
boxShadow: selectedOptionId === option.id ? '0 4px 12px rgba(59, 130, 246, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
transform: selectedOptionId === option.id ? 'translateY(-2px)' : 'none',
position: 'relative'
}}
>
<div style={{
width: '20px',
height: '20px',
borderRadius: '50%',
border: '2px solid',
borderColor: selectedOptionId === option.id ? '#3b82f6' : '#d1d5db',
marginRight: '1rem',
display: 'flex',
alignItems: 'center',
justifyContent: 'center',
backgroundColor: selectedOptionId === option.id ? '#3b82f6' : 'white',
transition: 'all 0.2s'
}}>
{selectedOptionId === option.id && (
<div style={{
width: '8px',
height: '8px',
borderRadius: '50%',
backgroundColor: 'white'
}}/>
)}
</div>
<input
type="radio"
name={`question-${currentQuestion.id}`}
value={option.id}
checked={selectedOptionId === option.id}
onChange={() => handleAnswerSelect(option.id)}
style={{ display: 'none' }}
/>
<span style={{ 
fontSize: '1rem', 
color: selectedOptionId === option.id ? '#1f2937' : '#374151',
fontWeight: selectedOptionId === option.id ? '600' : '400',
lineHeight: '1.5'
}}>
{option.optionText}
</span>
</label>
))}
</div>

{/* Progress Bar at Bottom */}
<div style={{
marginBottom: '1.5rem'
}}>
<div style={{
fontSize: '0.75rem',
color: '#6b7280',
textAlign: 'center',
marginBottom: '0.75rem'
}}>
{answers.length} of {questions.length} answered ({Math.round((answers.length / questions.length) * 100)}%)
</div>
<div style={{
width: '100%',
height: '8px',
backgroundColor: '#e5e7eb',
borderRadius: '4px',
overflow: 'hidden'
}}>
<div style={{
width: `${(answers.length / questions.length) * 100}%`,
height: '100%',
backgroundColor: '#10b981',
transition: 'width 0.3s ease',
borderRadius: '4px'
}} />
</div>
</div>

{/* Navigation Buttons */}
<div style={{ 
display: 'flex', 
gap: '1rem'
}}>
<button
onClick={handlePreviousQuestion}
disabled={currentQuestionIndex === 0}
style={{
flex: 1,
padding: window.innerWidth <= 768 ? '1.25rem 1rem' : '1rem 1.5rem',
border: 'none',
borderRadius: '10px',
fontWeight: '600',
fontSize: window.innerWidth <= 768 ? '1rem' : '0.95rem',
minHeight: '48px',
cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
backgroundColor: currentQuestionIndex === 0 ? '#f3f4f6' : '#6b7280',
color: currentQuestionIndex === 0 ? '#9ca3af' : 'white',
transition: 'all 0.2s ease',
boxShadow: currentQuestionIndex === 0 ? 'none' : '0 2px 4px rgba(0,0,0,0.1)',
transform: currentQuestionIndex === 0 ? 'none' : 'hover:translateY(-1px)'
}}
>
← Previous
</button>

{currentQuestionIndex < questions.length - 1 ? (
<button
onClick={handleNextQuestion}
style={{
flex: 1,
padding: window.innerWidth <= 768 ? '1.25rem 1rem' : '1rem 1.5rem',
border: 'none',
borderRadius: '10px',
fontWeight: '600',
fontSize: window.innerWidth <= 768 ? '1rem' : '0.95rem',
minHeight: '48px',
cursor: 'pointer',
backgroundColor: '#3b82f6',
color: 'white',
transition: 'all 0.2s ease',
boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
transform: 'hover:translateY(-1px)'
}}
>
Next →
</button>
) : (
<button
onClick={handleSubmitQuiz}
style={{
flex: 1,
padding: window.innerWidth <= 768 ? '1.25rem 1rem' : '1rem 1.5rem',
border: 'none',
borderRadius: '10px',
fontWeight: '700',
fontSize: window.innerWidth <= 768 ? '1rem' : '0.95rem',
minHeight: '48px',
cursor: 'pointer',
backgroundColor: '#dc2626',
color: 'white',
transition: 'all 0.2s ease',
boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
transform: 'hover:translateY(-1px)',
textTransform: 'uppercase',
letterSpacing: '0.05em'
}}
>
🎯 Submit Quiz
</button>
)}
</div>
</div>
</div>
</div>
</div>
);
};

export default TakeQuiz;