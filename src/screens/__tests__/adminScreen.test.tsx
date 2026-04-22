import React from 'react';
import { Linking, Share } from 'react-native';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import AdminScreen from '../../screens/AdminScreen';
import { useSampleContext } from '../../context/SampleContext';
import { saveQuestionnaire } from '../../services/questionnaireService';
import {
  exportResults,
  getResultExportOptions,
} from '../../services/resultsExportService';

jest.mock('../../context/SampleContext', () => ({
  useSampleContext: jest.fn(),
}));

jest.mock('../../services/questionnaireService', () => ({
  saveQuestionnaire: jest.fn(),
}));

jest.mock('../../services/resultsExportService', () => ({
  getResultExportOptions: jest.fn(),
  exportResults: jest.fn(),
}));

describe('AdminScreen', () => {
  const mockUseSampleContext = useSampleContext as jest.MockedFunction<
    typeof useSampleContext
  >;
  const mockSaveQuestionnaire = saveQuestionnaire as jest.MockedFunction<
    typeof saveQuestionnaire
  >;
  const mockGetResultExportOptions =
    getResultExportOptions as jest.MockedFunction<typeof getResultExportOptions>;
  const mockExportResults = exportResults as jest.MockedFunction<
    typeof exportResults
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSampleContext.mockReturnValue({
      sessionId: 'sess-1',
      responseSessionId: 'resp-1',
      questionnaireTitle: 'Aistinvarainen arviointi',
      questionnaireQuestions: [],
      samples: [],
      samplePresentationOrder: [],
      currentIndex: 0,
      currentSample: null,
      isLoading: false,
      error: null,
      updateStatusMessage: null,
      nextSample: jest.fn(),
      retryLoadSession: jest.fn(async () => {}),
      resetSession: jest.fn(async () => {}),
    });
    mockSaveQuestionnaire.mockResolvedValue('q-1');
    mockGetResultExportOptions.mockResolvedValue({
      questionnaireOptions: [{ value: 'Jogurttitesti', label: 'Jogurttitesti', count: 2 }],
      sessionOptions: [{ value: 'sess-1', label: 'sess-1', count: 2 }],
    });
    mockExportResults.mockResolvedValue({
      filename: 'results-questionnaire-Jogurttitesti.csv',
      mimeType: 'text/csv',
      content: 'a;b\n1;2',
    });
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' } as any);
  });

  it('starts export for selected questionnaire without manual DB query', async () => {
    const { getByLabelText } = render(
      <AdminScreen
        navigation={{ navigate: jest.fn() } as any}
        route={{ key: 'Admin-1', name: 'Admin' } as any}
      />,
    );

    await waitFor(() => {
      expect(mockGetResultExportOptions).toHaveBeenCalledTimes(1);
    });

    fireEvent.press(getByLabelText('Käynnistä tulosten vienti'));

    await waitFor(() => {
      expect(mockExportResults).toHaveBeenCalledWith(
        'questionnaire',
        'Jogurttitesti',
        'csv',
      );
    });
    expect(Linking.openURL).toHaveBeenCalled();
  }, 20000);
});
