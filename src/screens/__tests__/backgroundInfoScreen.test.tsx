import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import BackgroundInfoScreen from '../../screens/BackgroundInfoScreen';
import { useSampleContext } from '../../context/SampleContext';
import { saveRespondentProfile } from '../../services/respondentProfileService';

jest.mock('../../context/SampleContext', () => ({
  useSampleContext: jest.fn(),
}));

jest.mock('../../services/respondentProfileService', () => ({
  saveRespondentProfile: jest.fn(),
}));

describe('BackgroundInfoScreen', () => {
  const mockUseSampleContext = useSampleContext as jest.MockedFunction<
    typeof useSampleContext
  >;
  const mockSaveRespondentProfile =
    saveRespondentProfile as jest.MockedFunction<typeof saveRespondentProfile>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSampleContext.mockImplementation(() => ({
      sessionId: 'sess-1',
      responseSessionId: 'resp-1',
      questionnaireTitle: 'Aistinvarainen arviointi',
      questionnaireQuestions: [],
      samples: [],
      currentIndex: 0,
      currentSample: null,
      isLoading: false,
      error: null,
      nextSample: jest.fn(),
      retryLoadSession: jest.fn(async () => {}),
      resetSession: jest.fn(),
    }));
  });

  it('validates required fields', async () => {
    const { getByLabelText, findByText } = render(
      <BackgroundInfoScreen
        navigation={{ navigate: jest.fn() } as any}
        route={{ key: 'BackgroundInfo-1', name: 'BackgroundInfo' } as any}
      />,
    );

    fireEvent.press(getByLabelText('Tallenna taustatiedot'));
    expect(await findByText('Anna ika kokonaislukuna valilta 10-120.')).toBeTruthy();
  });

  it('saves and navigates to result', async () => {
    mockSaveRespondentProfile.mockResolvedValue(undefined);
    const navigate = jest.fn();

    const { getByLabelText } = render(
      <BackgroundInfoScreen
        navigation={{ navigate } as any}
        route={{ key: 'BackgroundInfo-1', name: 'BackgroundInfo' } as any}
      />,
    );

    fireEvent.changeText(getByLabelText('Ika'), '35');
    fireEvent.press(getByLabelText('Sukupuoli: Nainen'));
    fireEvent.press(getByLabelText('Tallenna taustatiedot'));

    await waitFor(() => {
      expect(mockSaveRespondentProfile).toHaveBeenCalledWith({
        sessionId: 'sess-1',
        responseSessionId: 'resp-1',
        questionnaireTitle: 'Aistinvarainen arviointi',
        age: 35,
        gender: 'Nainen',
      });
    });

    expect(navigate).toHaveBeenCalledWith('Result', {
      saveSucceeded: true,
      flowCompleted: true,
    });
  });
});
