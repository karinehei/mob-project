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
};

function buildContext(state: SampleState) {
  const nextSample = jest.fn(() => {
    state.currentIndex += 1;
  });
  const resetSession = jest.fn(async () => {
    state.currentIndex = 0;
  });

  const makeValue = () => ({
    sessionId: 'sess-1',
    responseSessionId: 'resp-1',
    questionnaireTitle: 'Aistinvarainen arviointi',
    questionnaireQuestions: [
      {
        id: 'appearance',
        label: 'Ulkonäkö',
        type: 'scale' as const,
        minScore: 0,
        maxScore: 10,
      },
      {
        id: 'smell',
        label: 'Tuoksu',
        type: 'scale' as const,
        minScore: 0,
        maxScore: 10,
      },
      {
        id: 'taste',
        label: 'Maku',
        type: 'scale' as const,
        minScore: 0,
        maxScore: 10,
      },
      {
        id: 'texture',
        label: 'Rakenne',
        type: 'scale' as const,
        minScore: 0,
        maxScore: 10,
      },
    ],
    samples: state.samples,
    samplePresentationOrder: state.samples,
    currentIndex: state.currentIndex,
    currentSample:
      state.currentIndex < state.samples.length
        ? state.samples[state.currentIndex]
        : null,
    isLoading: false,
    error: null,
    updateStatusMessage: null,
    nextSample,
    resetSession,
    retryLoadSession: jest.fn(async () => {}),
  });

  return { nextSample, resetSession, makeValue };
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

    fireEvent.press(getByLabelText('Ulkonäkö: arvo 8'));
    fireEvent.press(getByLabelText('Tuoksu: arvo 7'));
    fireEvent.press(getByLabelText('Maku: arvo 9'));
    fireEvent.press(getByLabelText('Rakenne: arvo 6'));
    fireEvent.press(getByLabelText('Tallenna arvio'));

    await waitFor(() => expect(mockSaveEvaluation).toHaveBeenCalledTimes(1));
    expect(mockSaveEvaluation).toHaveBeenCalledWith(
      expect.objectContaining({
        samplePresentationOrder: ['451', '926'],
        samplePresentationIndex: 0,
      }),
    );

    expect(nextSample).not.toHaveBeenCalled();
    expect(evaluationNavigation.navigate).toHaveBeenCalledWith('Result', {
      saveSucceeded: true,
      flowCompleted: false,
    });
  }, 20000);

  it('Result -> seuraava näyte -> Home', () => {
    const state: SampleState = {
      samples: ['451', '926'],
      currentIndex: 0,
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
    return waitFor(() => {
      expect(resultNavigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    });
  });

  it('SMOKE: koko flow toimii (Evaluation -> Result -> Home)', async () => {
    const state: SampleState = {
      samples: ['451', '926'],
      currentIndex: 0,
    };

    const {
      nextSample,
      resetSession,
      makeValue,
    } = buildContext(state);

    mockUseSampleContext.mockImplementation(() => makeValue());
    mockSaveEvaluation.mockResolvedValue(undefined);

    // RENDER EVALUATION
    const navigateMock = jest.fn();

    const { getByLabelText, unmount } = render(
      <EvaluationScreen
        navigation={{ navigate: navigateMock } as any}
        route={{ key: 'Eval', name: 'Evaluation' } as any}
      />,
    );

    // USER ACTION
    fireEvent.press(getByLabelText('Ulkonäkö: arvo 8'));
    fireEvent.press(getByLabelText('Tuoksu: arvo 7'));
    fireEvent.press(getByLabelText('Maku: arvo 9'));
    fireEvent.press(getByLabelText('Rakenne: arvo 6'));
    fireEvent.press(getByLabelText('Tallenna arvio'));

    // ASSERT SAVE
    await waitFor(() => {
      expect(mockSaveEvaluation).toHaveBeenCalledTimes(1);
    });

    // ASSERT NAVIGATION
    expect(navigateMock).toHaveBeenCalledWith('Result', {
      saveSucceeded: true,
      flowCompleted: false,
    });

    // simuloi että siirryttiin ResultScreeniin
    unmount();

    // RENDER RESULT
    const resetMock = jest.fn();

    const { getByLabelText: getResultByLabel } = render(
      <ResultScreen
        navigation={{ reset: resetMock } as any}
        route={{
          params: { saveSucceeded: true, flowCompleted: false },
        } as any}
      />,
    );
    // USER ACTION RESULT
    fireEvent.press(getResultByLabel('Arvioi seuraava näyte'));

    // ASSERT NEXT STEP
    expect(nextSample).toHaveBeenCalledTimes(1);
    expect(resetSession).not.toHaveBeenCalled();

    expect(resetMock).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'Home' }],
    });

  });

  it('viimeinen nayte ohjaa taustatietoihin', async () => {
    const state: SampleState = {
      samples: ['451'],
      currentIndex: 0,
    };
    const { makeValue } = buildContext(state);
    mockUseSampleContext.mockImplementation(() => makeValue());
    mockSaveEvaluation.mockResolvedValue(undefined);

    const navigateMock = jest.fn();
    const { getByLabelText } = render(
      <EvaluationScreen
        navigation={{ navigate: navigateMock } as any}
        route={{ key: 'Eval', name: 'Evaluation' } as any}
      />,
    );

    fireEvent.press(getByLabelText('Ulkonäkö: arvo 8'));
    fireEvent.press(getByLabelText('Tuoksu: arvo 7'));
    fireEvent.press(getByLabelText('Maku: arvo 9'));
    fireEvent.press(getByLabelText('Rakenne: arvo 6'));
    fireEvent.press(getByLabelText('Tallenna arvio'));

    await waitFor(() => {
      expect(mockSaveEvaluation).toHaveBeenCalledTimes(1);
    });

    expect(navigateMock).toHaveBeenCalledWith('BackgroundInfo');
  });

  it('CATA: kayttaja voi valita useita vaihtoehtoja ja ne tallentuvat answers-rakenteeseen', async () => {
    const state: SampleState = {
      samples: ['451', '926'],
      currentIndex: 0,
    };

    const nextSample = jest.fn();
    const resetSession = jest.fn(async () => {});

    mockUseSampleContext.mockImplementation(() => ({
      sessionId: 'sess-1',
      responseSessionId: 'resp-1',
      questionnaireTitle: 'Aistinvarainen arviointi',
      questionnaireQuestions: [
        {
          id: 'appearance',
          label: 'Ulkonäkö',
          type: 'scale' as const,
          minScore: 0,
          maxScore: 10,
        },
        {
          id: 'attributes',
          label: 'Havaitut ominaisuudet',
          type: 'multiSelect' as const,
          options: ['makea', 'hapan', 'karvas'],
        },
      ],
      samples: state.samples,
      samplePresentationOrder: state.samples,
      currentIndex: state.currentIndex,
      currentSample: state.samples[state.currentIndex],
      isLoading: false,
      error: null,
      updateStatusMessage: null,
      nextSample,
      resetSession,
      retryLoadSession: jest.fn(async () => {}),
    }));
    mockSaveEvaluation.mockResolvedValue(undefined);

    const navigateMock = jest.fn();
    const { getByLabelText } = render(
      <EvaluationScreen
        navigation={{ navigate: navigateMock } as any}
        route={{ key: 'Eval', name: 'Evaluation' } as any}
      />,
    );

    fireEvent.press(getByLabelText('Ulkonäkö: arvo 8'));
    fireEvent.press(getByLabelText('Havaitut ominaisuudet: makea'));
    fireEvent.press(getByLabelText('Havaitut ominaisuudet: hapan'));
    fireEvent.press(getByLabelText('Tallenna arvio'));

    await waitFor(() => {
      expect(mockSaveEvaluation).toHaveBeenCalledTimes(1);
    });

    expect(mockSaveEvaluation).toHaveBeenCalledWith(
      expect.objectContaining({
        sampleCode: '451',
        sessionId: 'sess-1',
        responseSessionId: 'resp-1',
        questionnaireTitle: 'Aistinvarainen arviointi',
        samplePresentationOrder: ['451', '926'],
        samplePresentationIndex: 0,
        answers: {
          appearance: 8,
          attributes: ['makea', 'hapan'],
        },
      }),
    );
    expect(navigateMock).toHaveBeenCalledWith('Result', {
      saveSucceeded: true,
      flowCompleted: false,
    });
  });
});
