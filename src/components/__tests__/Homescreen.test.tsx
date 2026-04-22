import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../../screens/HomeScreen';

jest.mock('../../context/SampleContext', () => ({
  useSampleContext: () => ({
    currentSample: '420',
    isLoading: false,
    error: null,
    sessionId: 'test-session',
    responseSessionId: 'resp-1',
    questionnaireTitle: 'Aistinvarainen arviointi',
    questionnaireQuestions: [
      { id: 'q1', label: 'Ulkonäkö', type: 'scale', minScore: 0, maxScore: 10 },
    ],
    samples: ['420'],
    currentIndex: 0,
    nextSample: jest.fn(),
    retryLoadSession: jest.fn(async () => {}),
    resetSession: jest.fn(),
  }),
}));

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <HomeScreen
        navigation={{ navigate: jest.fn() } as any}
        route={{ key: 'Home-1', name: 'Home' } as any}
      />,
    );

    expect(getByText('Aistinvarainen arviointi')).toBeTruthy();
  });
});
