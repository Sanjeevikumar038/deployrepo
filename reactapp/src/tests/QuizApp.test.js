import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from '../App';
import QuizList from '../components/QuizList';
import QuizForm from '../components/QuizForm';
import QuestionForm from '../components/QuestionForm';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock data
const mockQuizzes = [
  {
    id: 1,
    title: 'JavaScript Basics',
    description: 'Test your JavaScript knowledge',
    timeLimit: 30
  },
  {
    id: 2,
    title: 'React Fundamentals', 
    description: 'Learn React concepts',
    timeLimit: 45
  }
];

const mockQuizResponse = {
  id: 3,
  title: 'New Quiz',
  description: 'A new test quiz',
  timeLimit: 60
};

describe('Quiz Application Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: mockQuizzes });
  });

  // Test 1: App renders without crashing
  test('App renders without crashing', () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    render(<App />);
    expect(screen.getByText('Create New Quiz')).toBeInTheDocument();
  });

  // Test 2: QuizList shows loading state initially
  test('QuizList shows loading state initially', () => {
    render(<QuizList />);
    expect(screen.getByText(/Loading quizzes/)).toBeInTheDocument();
  });

  // Test 3: QuizList displays quizzes after loading
  test('QuizList displays quizzes after successful API call', async () => {
    render(<QuizList />);
    
    await waitFor(() => {
      expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
    });
  });

  // Test 4: QuizList handles API error
  test('QuizList handles API error gracefully', async () => {
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    render(<QuizList />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch quizzes')).toBeInTheDocument();
    });
  });

  // Test 5: QuizList shows empty state
  test('QuizList shows empty state when no quizzes available', async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    render(<QuizList />);
    
    await waitFor(() => {
      expect(screen.getByText('No quizzes available')).toBeInTheDocument();
    });
  });

  // Test 6: QuizList calls onSelectQuiz callback
  test('QuizList calls onSelectQuiz callback when quiz is clicked', async () => {
    const mockSelectQuiz = jest.fn();
    render(<QuizList onSelectQuiz={mockSelectQuiz} />);
    
    await waitFor(() => {
      expect(screen.getByText('JavaScript Basics')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('JavaScript Basics'));
    expect(mockSelectQuiz).toHaveBeenCalledWith(1);
  });

  // Test 7: QuizForm renders correctly
  test('QuizForm renders all required form elements', () => {
    render(<QuizForm />);
    
    expect(screen.getByText('Create New Quiz')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Time Limit (minutes)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Quiz' })).toBeInTheDocument();
  });

  // Test 8: QuizForm shows validation errors
  test('QuizForm shows validation errors for invalid input', async () => {
    render(<QuizForm />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Create Quiz' }));
    
    await waitFor(() => {
      expect(screen.getByText(/Quiz title must be between 3 and 100 characters/)).toBeInTheDocument();
    });
  });

  // Test 9: QuizForm submits successfully
  test('QuizForm submits valid data successfully', async () => {
    const mockOnQuizCreated = jest.fn();
    mockedAxios.post.mockResolvedValue({ data: mockQuizResponse });
    
    render(<QuizForm onQuizCreated={mockOnQuizCreated} />);
    
    // Get form inputs by their IDs
    const titleInput = document.getElementById('title-input');
    const descriptionInput = document.getElementById('description-input');
    const timeLimitInput = document.getElementById('timeLimit');
    
    fireEvent.change(titleInput, { target: { value: 'Test Quiz' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.change(timeLimitInput, { target: { value: '30' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Create Quiz' }));
    
    await waitFor(() => {
      expect(screen.getByText('Quiz created successfully!')).toBeInTheDocument();
    });
    
    expect(mockOnQuizCreated).toHaveBeenCalled();
  });

  // Test 10: QuizForm handles API errors
  test('QuizForm handles API error during submission', async () => {
    mockedAxios.post.mockRejectedValue({
      response: {
        data: {
          errors: ['Server error occurred']
        }
      }
    });
    
    render(<QuizForm />);
    
    const titleInput = document.getElementById('title-input');
    const timeLimitInput = document.getElementById('timeLimit');
    
    fireEvent.change(titleInput, { target: { value: 'Test Quiz' } });
    fireEvent.change(timeLimitInput, { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Quiz' }));
    
    await waitFor(() => {
      expect(screen.getByText('Server error occurred')).toBeInTheDocument();
    });
  });

  // Test 11: QuestionForm renders correctly
  test('QuestionForm renders with default options', () => {
    render(<QuestionForm quizId={1} />);
    
    expect(screen.getByText('Add Question to Quiz')).toBeInTheDocument();
    expect(screen.getByText('Question Text')).toBeInTheDocument();
    expect(screen.getByText('Question Type')).toBeInTheDocument();
    expect(screen.getByText('Options')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Question' })).toBeInTheDocument();
  });

  // Test 12: QuestionForm switches to True/False mode
  test('QuestionForm switches to True/False mode correctly', async () => {
    render(<QuestionForm quizId={1} />);
    
    const selectElement = document.getElementById('questionType');
    fireEvent.change(selectElement, { target: { value: 'TRUE_FALSE' } });
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('True')).toBeInTheDocument();
      expect(screen.getByDisplayValue('False')).toBeInTheDocument();
    });
  });

  // // Test 13: QuestionForm can add options
  // test('QuestionForm can add and remove options', async () => {
  //   render(<QuestionForm quizId={1} />);
    
  //   // Initially should have Add Option button
  //   expect(screen.getByText('Add Option')).toBeInTheDocument();
    
  //   // Add an option
  //   fireEvent.click(screen.getByText('Add Option'));
    
  //   // Should now have Remove buttons
  //   await waitFor(() => {
  //     expect(screen.getByText('Remove')).toBeInTheDocument();
  //   });
  // });

  // Test 14: QuestionForm validates input
  test('QuestionForm validates question data before submission', async () => {
    render(<QuestionForm quizId={1} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Question' }));
    
    await waitFor(() => {
      expect(screen.getByText(/Question text must be between 5 and 500 characters/)).toBeInTheDocument();
    });
  });

  // Test 15: QuestionForm submits successfully
  test('QuestionForm submits valid question successfully', async () => {
    const mockOnQuestionAdded = jest.fn();
    mockedAxios.post.mockResolvedValue({ data: { id: 1, questionText: 'Test Question' } });
    
    render(<QuestionForm quizId={1} onQuestionAdded={mockOnQuestionAdded} />);
    
    // Fill in form using IDs
    const questionTextInput = document.getElementById('questionText');
    fireEvent.change(questionTextInput, { target: { value: 'What is JavaScript?' } });
    
    // Fill in first option input
    const optionInputs = document.querySelectorAll('input[maxlength="200"]');
    fireEvent.change(optionInputs[0], { target: { value: 'A programming language' } });
    fireEvent.change(optionInputs[1], { target: { value: 'A markup language' } });
    
    // Select first option as correct
    const radioButtons = screen.getAllByRole('radio');
    fireEvent.click(radioButtons[0]);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add Question' }));
    
    await waitFor(() => {
      expect(screen.getByText('Question added!')).toBeInTheDocument();
    });
    
    expect(mockOnQuestionAdded).toHaveBeenCalled();
  });
});