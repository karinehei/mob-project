import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import EvaluationScreen from '../../screens/EvaluationScreen';
import HomeScreen from '../../screens/HomeScreen';
import ResultScreen from '../../screens/ResultScreen';
import { useSampleContext } from '../../context/SampleContext';
import { saveEvaluation } from '../../services/evaluationService';

jest.mock('../../context/SampleContext', () => ({
  useSampleContext: jest.fn(),
}));

jest.mock('../../services/evaluationService', () => ({
  saveEvaluation: jest.fn(),
}));

type SampleState = {
  samples: string[];
  currentIndex: number;
  pendingAppearanceRating: number | null;
};

function buildContext(state: SampleState) {
  const nextSample = jest.fn(() => {
    state.currentIndex += 1;
  });
  const clearPendingAppearanceRating = jest.fn(() => {
    state.pendingAppearanceRating = null;
  });

  const makeValue = () => ({
    sessionId: 'sess-1',
    samples: state.samples,
    currentIndex: state.currentIndex,
    currentSample:
      state.currentIndex < state.samples.length
        ? state.samples[state.currentIndex]
        : null,
    isLoading: false,
    error: null,
    nextSample,
    retryLoadSession: jest.fn(async () => {}),
    pendingAppearanceRating: state.pendingAppearanceRating,
    setPendingAppearanceRating: jest.fn(),
    clearPendingAppearanceRating,
  });

  return { nextSample, clearPendingAppearanceRating, makeValue };
}

describe('evaluation flow regressions', () => {
  const mockUseSampleContext = useSampleContext as jest.MockedFunction<
    typeof useSampleContext
  >;
  const mockSaveEvaluation = saveEvaluation as jest.MockedFunction<
    typeof saveEvaluation
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows next sample after successful save', async () => {
    const state: SampleState = {
      samples: ['451', '926'],
      currentIndex: 0,
      pendingAppearanceRating: 8,
    };
    const { nextSample, makeValue } = buildContext(state);
    mockUseSampleContext.mockImplementation(() => makeValue());
    mockSaveEvaluation.mockResolvedValue(undefined);

    const evaluationNavigation = { navigate: jest.fn() } as any;
    const homeNavigation = { navigate: jest.fn() } as any;

    const { getByLabelText } = render(
      <EvaluationScreen
        navigation={evaluationNavigation}
        route={{ key: 'Evaluation-1', name: 'Evaluation' } as any}
      />,
    );

    fireEvent.press(getByLabelText('Tallenna arvio'));

    await waitFor(() => {
      expect(mockSaveEvaluation).toHaveBeenCalledTimes(1);
    });

    expect(nextSample).toHaveBeenCalledTimes(1);
    expect(evaluationNavigation.navigate).toHaveBeenCalledWith('Home');

    const { getByText } = render(
      <HomeScreen
        navigation={homeNavigation}
        route={{ key: 'Home-1', name: 'Home' } as any}
      />,
    );

    expect(getByText('926')).toBeTruthy();
  });

  it('shows completion state after last sample save', async () => {
    const state: SampleState = {
      samples: ['451'],
      currentIndex: 0,
      pendingAppearanceRating: 8,
    };
    const { nextSample, makeValue } = buildContext(state);
    mockUseSampleContext.mockImplementation(() => makeValue());
    mockSaveEvaluation.mockResolvedValue(undefined);

    const evaluationNavigation = { navigate: jest.fn() } as any;

    const { getByLabelText } = render(
      <EvaluationScreen
        navigation={evaluationNavigation}
        route={{ key: 'Evaluation-1', name: 'Evaluation' } as any}
      />,
    );

    fireEvent.press(getByLabelText('Tallenna arvio'));

    await waitFor(() => {
      expect(mockSaveEvaluation).toHaveBeenCalledTimes(1);
    });

    expect(nextSample).not.toHaveBeenCalled();
    expect(evaluationNavigation.navigate).toHaveBeenCalledWith('Result', {
      saveSucceeded: true,
      flowCompleted: true,
    });

    const { getByText } = render(
      <ResultScreen
        navigation={{ navigate: jest.fn() } as any}
        route={
          {
            key: 'Result-1',
            name: 'Result',
            params: { saveSucceeded: true, flowCompleted: true },
          } as any
        }
      />,
    );

    expect(getByText('Kaikki arvioitu')).toBeTruthy();
    expect(getByText('Paluu etusivulle')).toBeTruthy();
  });

  it('keeps current sample and shows save error on failure', async () => {
    const state: SampleState = {
      samples: ['451', '926'],
      currentIndex: 0,
      pendingAppearanceRating: 8,
    };
    const { nextSample, makeValue } = buildContext(state);
    mockUseSampleContext.mockImplementation(() => makeValue());
    mockSaveEvaluation.mockRejectedValue(new Error('Tallennus epäonnistui'));

    const evaluationNavigation = { navigate: jest.fn() } as any;
    const homeNavigation = { navigate: jest.fn() } as any;

    const { getByLabelText, findByText } = render(
      <EvaluationScreen
        navigation={evaluationNavigation}
        route={{ key: 'Evaluation-1', name: 'Evaluation' } as any}
      />,
    );

    fireEvent.press(getByLabelText('Tallenna arvio'));

    expect(await findByText('Tallennus epäonnistui')).toBeTruthy();
    expect(nextSample).not.toHaveBeenCalled();
    expect(evaluationNavigation.navigate).not.toHaveBeenCalled();

    const { getByText } = render(
      <HomeScreen
        navigation={homeNavigation}
        route={{ key: 'Home-1', name: 'Home' } as any}
      />,
    );

    expect(getByText('451')).toBeTruthy();
  });
});
