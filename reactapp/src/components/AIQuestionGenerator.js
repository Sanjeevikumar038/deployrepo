import React, { useState, useEffect } from 'react';
import { buttonStyles } from './buttonStyles';
import { useToast, ToastContainer } from './Toast';

const AIQuestionGenerator = ({ quizId, onQuestionsGenerated, availableQuizzes = [] }) => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
  const [generating, setGenerating] = useState(false);
  const [createNewQuiz, setCreateNewQuiz] = useState(true);
  const [selectedExistingQuiz, setSelectedExistingQuiz] = useState('');
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizDescription, setNewQuizDescription] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const { toasts, addToast, removeToast } = useToast();

  // Auto-fill topic when existing quiz is selected
  useEffect(() => {
    if (!createNewQuiz && selectedExistingQuiz && availableQuizzes.length > 0) {
      const selectedQuiz = availableQuizzes.find(q => q.id.toString() === selectedExistingQuiz);
      if (selectedQuiz) {
        // Extract topic from quiz title (first word usually)
        const extractedTopic = selectedQuiz.title.split(' ')[0];
        setTopic(extractedTopic);
      }
    }
  }, [selectedExistingQuiz, createNewQuiz, availableQuizzes]);

  const generateQuestions = async () => {
    if (!topic.trim()) {
      addToast('Please enter a topic', 'error');
      return;
    }
    
    if (createNewQuiz && (!newQuizTitle.trim() || !newQuizDescription.trim())) {
      addToast('Please fill in quiz title and description', 'error');
      return;
    }
    
    if (!createNewQuiz && !selectedExistingQuiz) {
      addToast('Please select an existing quiz', 'error');
      return;
    }

    setGenerating(true);
    
    try {
      let targetQuizId = createNewQuiz ? null : selectedExistingQuiz;
      
      // Create new quiz if needed
      if (createNewQuiz) {
        const newQuiz = {
          id: Date.now(),
          title: newQuizTitle,
          description: newQuizDescription,
          timeLimit: timeLimit
        };
        
        try {
          // Try API first
          const response = await fetch('http://localhost:8080/api/quizzes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newQuiz)
          });
          
          if (response.ok) {
            const savedQuiz = await response.json();
            targetQuizId = savedQuiz.id;
          } else {
            targetQuizId = newQuiz.id;
          }
        } catch (apiError) {
          // Fallback to localStorage ID
          targetQuizId = newQuiz.id;
        }
        
        // Always save to localStorage for immediate visibility
        const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        existingQuizzes.push({ ...newQuiz, id: targetQuizId });
        localStorage.setItem('quizzes', JSON.stringify(existingQuizzes));
        
        addToast(`Created new quiz: ${newQuizTitle}`, 'success');
      }
      
      // Generate questions with real AI
      let generatedQuestions;
      let usedOpenAI = false;
      try {
        console.log('🎯 Attempting OpenAI generation...');
        generatedQuestions = await generateWithOpenAI(topic, difficulty, questionCount, questionType);
        usedOpenAI = true;
        console.log('✅ OpenAI generation successful!');
      } catch (error) {
        console.error('❌ OpenAI generation failed:', error.message);
        console.log('🔄 Falling back to template questions...');
        generatedQuestions = generateTemplateQuestions(topic, difficulty, questionCount, questionType);
        usedOpenAI = false;
      }
      
      console.log(`📊 Generated ${generatedQuestions.length} questions using ${usedOpenAI ? 'OpenAI' : 'templates'}`);
      
      // Save questions to the main quiz system
      try {
        // Try API first
        for (const question of generatedQuestions) {
          const questionData = {
            ...question,
            id: Date.now() + Math.random(),
            quizId: targetQuizId
          };
          
          try {
            await fetch(`http://localhost:8080/api/quizzes/${targetQuizId}/questions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(questionData)
            });
          } catch (apiError) {
            // Fallback to localStorage if API fails
            const existingQuestions = JSON.parse(localStorage.getItem('aiGeneratedQuestions') || '{}');
            if (!existingQuestions[targetQuizId]) {
              existingQuestions[targetQuizId] = [];
            }
            existingQuestions[targetQuizId].push(questionData);
            localStorage.setItem('aiGeneratedQuestions', JSON.stringify(existingQuestions));
          }
        }
        
        // Also update the quiz in localStorage for immediate visibility
        const quizzes = JSON.parse(localStorage.getItem('quizzes') || '[]');
        const quizIndex = quizzes.findIndex(q => q.id.toString() === targetQuizId.toString());
        if (quizIndex !== -1) {
          if (!quizzes[quizIndex].questions) {
            quizzes[quizIndex].questions = [];
          }
          generatedQuestions.forEach(question => {
            quizzes[quizIndex].questions.push({
              ...question,
              id: Date.now() + Math.random(),
              quizId: targetQuizId
            });
          });
          localStorage.setItem('quizzes', JSON.stringify(quizzes));
        }
        
      } catch (error) {
        console.error('Error saving questions:', error);
      }
      
      addToast(`Generated ${questionCount} questions successfully using ${usedOpenAI ? 'OpenAI' : 'templates'}!`, 'success');
      
      // Trigger dashboard refresh to show new quiz and questions
      window.dispatchEvent(new Event('questionsUpdated'));
      window.dispatchEvent(new Event('quizCreated'));
      
      onQuestionsGenerated(generatedQuestions);
      
      // Reset form
      setTopic('');
      setQuestionCount(5);
      setNewQuizTitle('');
      setNewQuizDescription('');
      
    } catch (error) {
      addToast('Failed to generate questions. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const generateWithOpenAI = async (topic, difficulty, count, type) => {
    const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
    
    console.log('=== OpenAI Debug Info ===');
    console.log('API Key present:', !!API_KEY);
    console.log('API Key length:', API_KEY ? API_KEY.length : 0);
    console.log('API Key starts with sk-:', API_KEY ? API_KEY.startsWith('sk-') : false);
    
    if (!API_KEY || API_KEY === 'your-openai-api-key-here' || API_KEY.length < 20) {
      console.log('❌ Invalid API key, using templates');
      addToast('OpenAI API key invalid. Using template questions.', 'warning');
      throw new Error('Invalid API key');
    }

    console.log(`🤖 Generating ${count} questions about ${topic} with OpenAI`);
    addToast('Generating questions with OpenAI...', 'info');

    const prompt = createPrompt(topic, difficulty, count, type);
    console.log('📝 OpenAI Prompt:', prompt);
    
    try {
      console.log('🚀 Making OpenAI API request...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: prompt
          }],
          temperature: 0.3,
          max_tokens: 3000
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API Error Response:', errorText);
        
        let errorMessage = 'OpenAI API failed';
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error.message || errorData.error.type || 'Unknown error';
            if (errorData.error.code === 'insufficient_quota') {
              errorMessage = 'OpenAI quota exceeded';
            } else if (errorData.error.code === 'invalid_api_key') {
              errorMessage = 'Invalid OpenAI API key';
            }
          }
        } catch (parseError) {
          console.log('Could not parse error response');
        }
        
        addToast(`OpenAI Error: ${errorMessage}`, 'error');
        throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      console.log('✅ OpenAI Response received:', data);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Invalid response structure from OpenAI');
      }
      
      const generatedContent = data.choices[0].message.content;
      console.log('📄 Generated Content:', generatedContent);
      
      addToast('Successfully generated questions with OpenAI!', 'success');
      return parseAIResponse(generatedContent, topic, difficulty, type);
    } catch (error) {
      console.error('❌ OpenAI API failed:', error.message);
      if (error.message.includes('quota')) {
        addToast('OpenAI quota exceeded. Using template questions.', 'error');
      } else if (error.message.includes('api_key')) {
        addToast('Invalid OpenAI API key. Using template questions.', 'error');
      } else {
        addToast(`OpenAI failed: ${error.message}. Using template questions.`, 'error');
      }
      throw error;
    }
  };

  const createPrompt = (topic, difficulty, count, type) => {
    const topicExamples = {
      'app development': 'mobile app development, React Native, Flutter, iOS, Android',
      'dbms': 'database management systems, SQL, normalization, ACID properties, indexing',
      'cloud computing': 'AWS, Azure, virtualization, containers, microservices',
      'machine learning': 'algorithms, neural networks, supervised learning, data science',
      'web development': 'HTML, CSS, JavaScript, frameworks, responsive design'
    };
    
    const context = topicExamples[topic.toLowerCase()] || topic;
    
    return `Generate ${count} ${difficulty} level multiple choice questions about ${topic}.

Context: Focus on ${context}

Return only this JSON format:
[
  {
    "questionText": "Specific question about ${topic}?",
    "questionType": "${type}",
    "options": [
      {"optionText": "Correct answer", "isCorrect": true},
      {"optionText": "Wrong option 1", "isCorrect": false},
      {"optionText": "Wrong option 2", "isCorrect": false},
      {"optionText": "Wrong option 3", "isCorrect": false}
    ]
  }
]`;
  };

  const parseAIResponse = (content, topic, difficulty, type) => {
    try {
      // Clean the response - remove any markdown formatting
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      const questions = JSON.parse(cleanContent);
      
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
      
      return questions.map((q, index) => ({
        ...q,
        id: Date.now() + index,
        difficulty: difficulty,
        topic: topic,
        options: q.options.map((opt, idx) => ({
          ...opt,
          id: Date.now() + index * 100 + idx
        }))
      }));
    } catch (error) {
      console.error('Failed to parse AI response:', error, 'Content:', content);
      addToast('Failed to parse AI response. Using template questions.', 'warning');
      return generateTemplateQuestions(topic, difficulty, questionCount, type);
    }
  };

  const generateTemplateQuestions = (topic, difficulty, count, type) => {
    const questions = [];
    for (let i = 0; i < count; i++) {
      if (type === 'MULTIPLE_CHOICE') {
        questions.push(generateMCQ(topic, difficulty, i + 1));
      } else {
        questions.push(generateTrueFalse(topic, difficulty, i + 1));
      }
    }
    return questions;
  };

  const generateMCQ = (topic, difficulty, index) => {
    const templates = {
      java: {
        easy: [
          {
            question: `What is the correct way to declare a variable in ${topic}?`,
            options: [
              { optionText: 'int x = 5;', isCorrect: true },
              { optionText: 'integer x = 5;', isCorrect: false },
              { optionText: 'var x = 5;', isCorrect: false },
              { optionText: 'x = 5;', isCorrect: false }
            ]
          },
          {
            question: `Which keyword is used to create a class in ${topic}?`,
            options: [
              { optionText: 'class', isCorrect: true },
              { optionText: 'Class', isCorrect: false },
              { optionText: 'new', isCorrect: false },
              { optionText: 'create', isCorrect: false }
            ]
          },
          {
            question: `What is the main method signature in ${topic}?`,
            options: [
              { optionText: 'public static void main(String[] args)', isCorrect: true },
              { optionText: 'public void main(String[] args)', isCorrect: false },
              { optionText: 'static void main(String[] args)', isCorrect: false },
              { optionText: 'public main(String[] args)', isCorrect: false }
            ]
          }
        ],
        medium: [
          {
            question: `What is the output of System.out.println("Hello".length()) in ${topic}?`,
            options: [
              { optionText: '5', isCorrect: true },
              { optionText: '4', isCorrect: false },
              { optionText: '6', isCorrect: false },
              { optionText: 'Error', isCorrect: false }
            ]
          },
          {
            question: `Which collection class allows duplicate elements in ${topic}?`,
            options: [
              { optionText: 'ArrayList', isCorrect: true },
              { optionText: 'HashSet', isCorrect: false },
              { optionText: 'TreeSet', isCorrect: false },
              { optionText: 'LinkedHashSet', isCorrect: false }
            ]
          },
          {
            question: `What is inheritance in ${topic}?`,
            options: [
              { optionText: 'A class acquiring properties of another class', isCorrect: true },
              { optionText: 'Creating multiple objects', isCorrect: false },
              { optionText: 'Hiding implementation details', isCorrect: false },
              { optionText: 'Method overloading', isCorrect: false }
            ]
          }
        ],
        hard: [
          {
            question: `What is the time complexity of HashMap get() operation in ${topic}?`,
            options: [
              { optionText: 'O(1) average case', isCorrect: true },
              { optionText: 'O(log n)', isCorrect: false },
              { optionText: 'O(n)', isCorrect: false },
              { optionText: 'O(n²)', isCorrect: false }
            ]
          }
        ]
      },
      react: {
        easy: [
          {
            question: `How do you create a functional component in ${topic}?`,
            options: [
              { optionText: 'function MyComponent() { return <div></div>; }', isCorrect: true },
              { optionText: 'class MyComponent() { return <div></div>; }', isCorrect: false },
              { optionText: 'component MyComponent() { return <div></div>; }', isCorrect: false },
              { optionText: 'const MyComponent = <div></div>;', isCorrect: false }
            ]
          },
          {
            question: `What is JSX in ${topic}?`,
            options: [
              { optionText: 'JavaScript XML syntax extension', isCorrect: true },
              { optionText: 'A CSS framework', isCorrect: false },
              { optionText: 'A database query language', isCorrect: false },
              { optionText: 'A testing library', isCorrect: false }
            ]
          },
          {
            question: `Which hook is used for state management in ${topic}?`,
            options: [
              { optionText: 'useState', isCorrect: true },
              { optionText: 'useEffect', isCorrect: false },
              { optionText: 'useContext', isCorrect: false },
              { optionText: 'useReducer', isCorrect: false }
            ]
          }
        ],
        medium: [
          {
            question: `What is the purpose of useEffect in ${topic}?`,
            options: [
              { optionText: 'Handle side effects and lifecycle events', isCorrect: true },
              { optionText: 'Manage component state', isCorrect: false },
              { optionText: 'Create new components', isCorrect: false },
              { optionText: 'Style components', isCorrect: false }
            ]
          },
          {
            question: `How do you pass data from parent to child in ${topic}?`,
            options: [
              { optionText: 'Through props', isCorrect: true },
              { optionText: 'Through state', isCorrect: false },
              { optionText: 'Through context only', isCorrect: false },
              { optionText: 'Through refs', isCorrect: false }
            ]
          },
          {
            question: `What is the Virtual DOM in ${topic}?`,
            options: [
              { optionText: 'A JavaScript representation of the real DOM', isCorrect: true },
              { optionText: 'A CSS framework', isCorrect: false },
              { optionText: 'A database', isCorrect: false },
              { optionText: 'A testing tool', isCorrect: false }
            ]
          }
        ],
        hard: [
          {
            question: `What is the difference between useMemo and useCallback in ${topic}?`,
            options: [
              { optionText: 'useMemo memoizes values, useCallback memoizes functions', isCorrect: true },
              { optionText: 'They are the same', isCorrect: false },
              { optionText: 'useMemo is for state, useCallback is for effects', isCorrect: false },
              { optionText: 'useCallback is deprecated', isCorrect: false }
            ]
          }
        ]
      },
      python: {
        easy: [
          {
            question: `How do you create a list in ${topic}?`,
            options: [
              { optionText: 'my_list = []', isCorrect: true },
              { optionText: 'my_list = ()', isCorrect: false },
              { optionText: 'my_list = {}', isCorrect: false },
              { optionText: 'list my_list', isCorrect: false }
            ]
          },
          {
            question: `What is the correct way to define a function in ${topic}?`,
            options: [
              { optionText: 'def my_function():', isCorrect: true },
              { optionText: 'function my_function():', isCorrect: false },
              { optionText: 'func my_function():', isCorrect: false },
              { optionText: 'define my_function():', isCorrect: false }
            ]
          }
        ],
        medium: [
          {
            question: `What is the output of len("Python") in ${topic}?`,
            options: [
              { optionText: '6', isCorrect: true },
              { optionText: '5', isCorrect: false },
              { optionText: '7', isCorrect: false },
              { optionText: 'Error', isCorrect: false }
            ]
          },
          {
            question: `What is list comprehension in ${topic}?`,
            options: [
              { optionText: 'A concise way to create lists', isCorrect: true },
              { optionText: 'A type of loop', isCorrect: false },
              { optionText: 'A function', isCorrect: false },
              { optionText: 'A class method', isCorrect: false }
            ]
          }
        ],
        hard: [
          {
            question: `What is a decorator in ${topic}?`,
            options: [
              { optionText: 'A function that modifies another function', isCorrect: true },
              { optionText: 'A type of variable', isCorrect: false },
              { optionText: 'A loop construct', isCorrect: false },
              { optionText: 'An error handler', isCorrect: false }
            ]
          }
        ]
      }
    };

    const topicKey = topic.toLowerCase();
    const difficultyQuestions = templates[topicKey]?.[difficulty] || templates.java[difficulty];
    
    // Use a more varied selection to avoid repetition
    const questionIndex = (index * 3 + Math.floor(index / 2)) % difficultyQuestions.length;
    const template = difficultyQuestions[questionIndex];
    
    return {
      questionText: template.question,
      questionType: 'MULTIPLE_CHOICE',
      options: template.options.map((opt, idx) => ({
        ...opt,
        id: Date.now() + idx + index * 100
      })),
      difficulty: difficulty,
      topic: topic
    };
  };

  const generateTrueFalse = (topic, difficulty, index) => {
    const statements = {
      easy: [
        { text: `${topic} is a programming language`, correct: true },
        { text: `Variables in ${topic} must be declared before use`, correct: true },
        { text: `${topic} supports object-oriented programming`, correct: true }
      ],
      medium: [
        { text: `${topic} is compiled to bytecode`, correct: topic.toLowerCase() === 'java' },
        { text: `${topic} uses garbage collection for memory management`, correct: true }
      ],
      hard: [
        { text: `${topic} supports multiple inheritance of classes`, correct: topic.toLowerCase() === 'python' }
      ]
    };

    const difficultyStatements = statements[difficulty];
    const statement = difficultyStatements[index % difficultyStatements.length];
    
    return {
      questionText: statement.text,
      questionType: 'TRUE_FALSE',
      options: [
        { optionText: 'True', isCorrect: statement.correct, id: Date.now() + 1 },
        { optionText: 'False', isCorrect: !statement.correct, id: Date.now() + 2 }
      ],
      difficulty: difficulty,
      topic: topic
    };
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '2px solid #e5e7eb'
    }}>
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        🤖 AI Question Generator
      </h3>
      
      {(!process.env.REACT_APP_OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY === 'your-openai-api-key-here') && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: '#92400e' }}>
            ⚠️ OpenAI API Key Required
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
            Add REACT_APP_OPENAI_API_KEY to your .env file for real AI generation. Currently using template questions.
          </p>
        </div>
      )}
      
      {/* Quiz Creation Toggle */}
      <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={createNewQuiz}
            onChange={(e) => setCreateNewQuiz(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <span style={{ fontWeight: '600', color: '#374151' }}>
            Create new quiz with AI questions
          </span>
        </label>
      </div>
      
      {/* New Quiz Form */}
      {createNewQuiz && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#1e40af', fontSize: '1.1rem' }}>New Quiz Details</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Quiz Title
              </label>
              <input
                type="text"
                value={newQuizTitle}
                onChange={(e) => setNewQuizTitle(e.target.value)}
                placeholder="e.g., Java Fundamentals Quiz"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Time Limit (minutes)
              </label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(Math.max(1, parseInt(e.target.value) || 30))}
                min="1"
                max="180"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Quiz Description
            </label>
            <textarea
              value={newQuizDescription}
              onChange={(e) => setNewQuizDescription(e.target.value)}
              placeholder="Brief description of the quiz content and objectives"
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      )}
      
      {/* Existing Quiz Selector */}
      {!createNewQuiz && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#92400e', fontSize: '1.1rem' }}>Select Existing Quiz</h4>
          <select
            value={selectedExistingQuiz}
            onChange={(e) => setSelectedExistingQuiz(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem',
              backgroundColor: 'white'
            }}
          >
            <option value="">Choose a quiz to add questions to...</option>
            {availableQuizzes.map(quiz => (
              <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Topic/Subject
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={!createNewQuiz ? "Auto-filled from selected quiz" : "e.g., Java, Python, React, JavaScript"}
            readOnly={!createNewQuiz && selectedExistingQuiz}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem',
              backgroundColor: (!createNewQuiz && selectedExistingQuiz) ? '#f9fafb' : 'white',
              cursor: (!createNewQuiz && selectedExistingQuiz) ? 'not-allowed' : 'text'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Difficulty Level
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem',
              backgroundColor: 'white'
            }}
          >
            <option value="easy">🟢 Easy</option>
            <option value="medium">🟡 Medium</option>
            <option value="hard">🔴 Hard</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Number of Questions
          </label>
          <input
            type="number"
            value={questionCount}
            onChange={(e) => setQuestionCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
            min="1"
            max="20"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
            Question Type
          </label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem',
              backgroundColor: 'white'
            }}
          >
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
            <option value="TRUE_FALSE">True/False</option>
          </select>
        </div>
      </div>

      <button
        onClick={generateQuestions}
        disabled={generating}
        style={{
          ...buttonStyles.primary,
          width: '100%',
          backgroundColor: generating ? '#9ca3af' : '#8b5cf6',
          cursor: generating ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        {generating ? (
          <>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #ffffff40',
              borderTop: '2px solid #ffffff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Generating Questions...
          </>
        ) : (
          <>
            ✨ Generate {questionCount} Questions
          </>
        )}
      </button>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AIQuestionGenerator;