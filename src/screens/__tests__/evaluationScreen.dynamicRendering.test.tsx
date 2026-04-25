jest.mock('../../services/studyService', () => ({
  fetchActiveStudySession: jest.fn(),
}));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      resolvedLanguage: 'fi',
      language: 'fi',
      changeLanguage: jest.fn(() => Promise.resolve()),
    },
  }),
}));

// Mock context
jest.mock('../../context/SampleContext');

jest.mock('../../services/evaluationService', () => ({
  __esModule: true,
  saveEvaluation: jest.fn(() => Promise.resolve()),
  getSamples: jest.fn(() => Promise.resolve([])),
}));

import React from 'react';
import { render } from '@testing-library/react-native';
import EvaluationScreen from '../EvaluationScreen';
import { useSampleContext } from '../../context/SampleContext';

// Mock navigation types
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
const mockSetOptions = jest.fn();
const mockDispatch = jest.fn();

const mockNavigation = {
  navigate: mockNavigate,
  goBack: mockGoBack,
  setOptions: mockSetOptions,
  dispatch: mockDispatch,
};

const mockRoute = {
  key: 'Evaluation',
  name: 'Evaluation',
  params: undefined,
};

const mockedUseSampleContext = useSampleContext as jest.Mock;

// Base context state
const baseContext = {
  currentSample: 'SAMPLE_1',
  currentIndex: 0,
  samples: ['SAMPLE_1'],
  sessionId: 'SESSION_1',
  responseSessionId: 'RESP_1',
  questionnaireTitle: 'Test Questionnaire',
  samplePresentationOrder: [],
  isLoading: false,
  error: null,
  retryLoadSession: jest.fn(),
};

// Helper render function
const renderScreen = () =>
  render(
    <EvaluationScreen
      navigation={mockNavigation as any}
      route={mockRoute as any}
    />
  );

// Tests
describe('EvaluationScreen - dynamic rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders scale questions dynamically', () => {
    mockedUseSampleContext.mockReturnValue({
      ...baseContext,
      questionnaireQuestions: [
        {
          id: 'q1',
          type: 'scale',
          label: 'Taste',
          minScore: 0,
          maxScore: 5,
        },
      ],
    });

    const { getByText } = renderScreen();

    expect(getByText('Taste')).toBeTruthy();
  });

  it('renders multi-select questions dynamically', () => {
    mockedUseSampleContext.mockReturnValue({
      ...baseContext,
      questionnaireQuestions: [
        {
          id: 'q1',
          type: 'multiSelect',
          label: 'Flavors',
          options: ['Sweet', 'Sour'],
        },
      ],
    });

    const { getByText } = renderScreen();

    expect(getByText('Flavors')).toBeTruthy();
    expect(getByText('Sweet')).toBeTruthy();
    expect(getByText('Sour')).toBeTruthy();
  });

  it('renders mixed question types correctly', () => {
    mockedUseSampleContext.mockReturnValue({
      ...baseContext,
      questionnaireQuestions: [
        {
          id: 'q1',
          type: 'scale',
          label: 'Taste',
          minScore: 0,
          maxScore: 5,
        },
        {
          id: 'q2',
          type: 'multiSelect',
          label: 'Attributes',
          options: ['A', 'B'],
        },
      ],
    });

    const { getByText } = renderScreen();

    expect(getByText('Taste')).toBeTruthy();
    expect(getByText('Attributes')).toBeTruthy();
    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
  });

  it('renders all question labels (mapping test)', () => {
    mockedUseSampleContext.mockReturnValue({
      ...baseContext,
      questionnaireQuestions: [
        { id: 'q1', type: 'scale', label: 'Q1' },
        { id: 'q2', type: 'scale', label: 'Q2' },
        { id: 'q3', type: 'multiSelect', label: 'Q3', options: ['X'] },
      ],
    });

    const { getByText } = renderScreen();

    expect(getByText('Q1')).toBeTruthy();
    expect(getByText('Q2')).toBeTruthy();
    expect(getByText('Q3')).toBeTruthy();
  });

  it('handles empty questionnaire safely', () => {
    mockedUseSampleContext.mockReturnValue({
      ...baseContext,
      questionnaireQuestions: [],
    });

    const { getByText } = renderScreen();

    expect(getByText(/eval_screen\.title/)).toBeTruthy();
  });
});
