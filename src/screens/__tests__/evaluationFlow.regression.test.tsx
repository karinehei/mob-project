import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import EvaluationScreen from '../../screens/EvaluationScreen';
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
  const resetSession = jest.fn(() => {
    state.currentIndex = 0;
    state.pendingAppearanceRating = null;
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
    resetSession,
    retryLoadSession: jest.fn(async () => {}),
    pendingAppearanceRating: state.pendingAppearanceRating,
    setPendingAppearanceRating: jest.fn(),
    clearPendingAppearanceRating,
  });

  return { nextSample, resetSession, clearPendingAppearanceRating, makeValue };
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

  it('onnistunut save -> Result ei-viimeisellä näytteellä', async () => {
    const state: SampleState = {
      samples: ['451', '926'],
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
        route={{ key: 'Eval', name: 'Evaluation' } as any}
      />,
    );

    fireEvent.press(getByLabelText('Tallenna arvio'));

    await waitFor(() => expect(mockSaveEvaluation).toHaveBeenCalledTimes(1));

    expect(nextSample).not.toHaveBeenCalled();
    expect(evaluationNavigation.navigate).toHaveBeenCalledWith('Result', {
      saveSucceeded: true,
      flowCompleted: false,
    });
  });

  it('Result -> seuraava näyte -> Home', () => {
    const state: SampleState = {
      samples: ['451', '926'],
      currentIndex: 0,
      pendingAppearanceRating: null,
    };
    const { nextSample, resetSession, makeValue } = buildContext(state);
    mockUseSampleContext.mockImplementation(() => makeValue());

    const resultNavigation = { reset: jest.fn() } as any;

    const { getByLabelText } = render(
      <ResultScreen
        navigation={resultNavigation}
        route={{ params: { saveSucceeded: true, flowCompleted: false } } as any}
      />,
    );

    fireEvent.press(getByLabelText('Arvioi seuraava näyte'));

    expect(nextSample).toHaveBeenCalledTimes(1);
    expect(resetSession).not.toHaveBeenCalled();
    expect(resultNavigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  });

  it('viimeinen näyte -> Result -> uusi kierros -> Home', () => {
    const state: SampleState = {
      samples: ['451'],
      currentIndex: 0,
      pendingAppearanceRating: null,
    };
    const { nextSample, resetSession, makeValue } = buildContext(state);
    mockUseSampleContext.mockImplementation(() => makeValue());

    const resultNavigation = { reset: jest.fn() } as any;

    const { getByLabelText } = render(
      <ResultScreen
        navigation={resultNavigation}
        route={{ params: { saveSucceeded: true, flowCompleted: true } } as any}
      />,
    );

    fireEvent.press(getByLabelText('Aloita uusi kierros'));

    expect(nextSample).not.toHaveBeenCalled();
    expect(resetSession).toHaveBeenCalledTimes(1);
    expect(resultNavigation.reset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  });
});
