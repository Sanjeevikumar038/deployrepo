import React, { useEffect, useRef } from 'react';
import EmailService from './EmailService';

const QuizResults = ({ attempt, onReturnHome }) => {
    const emailSent = useRef(false);
    
    // Send email when results are displayed
    useEffect(() => {
        if (attempt && attempt.studentName && !emailSent.current) {
            const students = JSON.parse(localStorage.getItem('students') || '[]');
            const student = students.find(s => s.username === attempt.studentName);
            
            if (student && student.email) {
                const quizData = { title: attempt.quizTitle || 'Quiz' };
                const results = {
                    score: attempt.score,
                    totalQuestions: attempt.totalQuestions,
                    timeTaken: attempt.timeTaken
                };
                
                EmailService.sendQuizResults(student.email, quizData, results);
                emailSent.current = true;
            }
        }
    }, [attempt]);

    if (!attempt) {
        return (
            <div style={{ 
                width: '100vw', 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8fafc' 
            }}>
                <div style={{ textAlign: 'center', color: '#6b7280' }}>
                    No quiz results found.
                </div>
            </div>
        );
    }

    const percentage = (attempt.score / attempt.totalQuestions) * 100;
    const isPassed = percentage >= 60;

    return (
        <div style={{ 
            width: '100vw', 
            minHeight: '100vh', 
            margin: 0, 
            padding: '2rem',
            backgroundColor: '#f8fafc',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '3rem',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center'
            }}>
                {/* Success/Fail Icon */}
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1.5rem'
                }}>
                    {isPassed ? '🎉' : '📚'}
                </div>

                {/* Title */}
                <h2 style={{ 
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    color: '#1f2937', 
                    margin: '0 0 2rem 0'
                }}>
                    Quiz Results
                </h2>

                {/* Student Info Card */}
                <div style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    textAlign: 'left'
                }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <span style={{ 
                            color: '#6b7280', 
                            fontSize: '0.875rem', 
                            fontWeight: '500' 
                        }}>
                            Student Name
                        </span>
                        <div style={{ 
                            color: '#1f2937', 
                            fontSize: '1.125rem', 
                            fontWeight: '600',
                            marginTop: '0.25rem'
                        }}>
                            {attempt.studentName}
                        </div>
                    </div>
                </div>

                {/* Score Cards Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '1rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        backgroundColor: '#dbeafe',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#1e40af',
                            marginBottom: '0.5rem'
                        }}>
                            {attempt.score}
                        </div>
                        <div style={{
                            color: '#1e40af',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }}>
                            Correct Answers
                        </div>
                    </div>

                    <div style={{
                        backgroundColor: '#f3f4f6',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#374151',
                            marginBottom: '0.5rem'
                        }}>
                            {attempt.totalQuestions}
                        </div>
                        <div style={{
                            color: '#374151',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }}>
                            Total Questions
                        </div>
                    </div>
                </div>

                {/* Percentage Score */}
                <div style={{
                    backgroundColor: isPassed ? '#dcfce7' : '#fef2f2',
                    borderRadius: '12px',
                    padding: '2rem',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        fontSize: '3rem',
                        fontWeight: '700',
                        color: isPassed ? '#065f46' : '#dc2626',
                        marginBottom: '0.5rem'
                    }}>
                        {percentage.toFixed(1)}%
                    </div>
                    <div style={{
                        color: isPassed ? '#065f46' : '#dc2626',
                        fontSize: '1.125rem',
                        fontWeight: '600'
                    }}>
                        {isPassed ? 'Congratulations! You Passed!' : 'Keep Learning!'}
                    </div>
                </div>

                {/* Return Button */}
                <button 
                    onClick={onReturnHome}
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '1rem 2rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                >
                    Return to Dashboard
                </button>
            </div>
        </div>
    );
};

export default QuizResults;