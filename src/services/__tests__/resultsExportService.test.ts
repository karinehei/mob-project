import { getDocs } from 'firebase/firestore';

import { exportResults, getResultExportOptions } from '../resultsExportService';

jest.mock('../../firebase/firestore', () => ({
  getFirestoreDb: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  getDocs: jest.fn(),
  query: jest.fn((...args) => args),
  where: jest.fn((...args) => args),
  collection: jest.fn((db, name) => ({ _db: db, _name: name })),
}));

describe('resultsExportService', () => {
  const mockGetDocs = getDocs as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists questionnaire and session options', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        { data: () => ({ questionnaireTitle: 'Jogurttitesti', sessionId: 'sess-1' }) },
        { data: () => ({ questionnaireTitle: 'Jogurttitesti', sessionId: 'sess-1' }) },
        { data: () => ({ questionnaireTitle: 'Juustotesti', sessionId: 'sess-2' }) },
      ],
    });

    const options = await getResultExportOptions();

    expect(options.questionnaireOptions).toEqual([
      { value: 'Jogurttitesti', label: 'Jogurttitesti', count: 2 },
      { value: 'Juustotesti', label: 'Juustotesti', count: 1 },
    ]);
    expect(options.sessionOptions).toEqual([
      { value: 'sess-1', label: 'sess-1', count: 2 },
      { value: 'sess-2', label: 'sess-2', count: 1 },
    ]);
  });

  it('exports CSV content for selected questionnaire', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          data: () => ({
            responseSessionId: 'resp-1',
            sessionId: 'sess-1',
            questionnaireTitle: 'Jogurttitesti',
            createdAt: { toDate: () => new Date('2026-04-22T10:00:00.000Z') },
            backgroundInfo: { age: 34, gender: 'Nainen' },
            evaluations: [
              {
                sampleCode: '451',
                samplePresentationIndex: 0,
                samplePresentationOrder: ['451', '926'],
                createdAt: { toDate: () => new Date('2026-04-22T10:01:00.000Z') },
                answers: { appearance: 8, attributes: ['makea', 'hapan'] },
              },
            ],
          }),
        },
      ],
    });

    const result = await exportResults('questionnaire', 'Jogurttitesti', 'csv');

    expect(result.filename).toContain('.csv');
    expect(result.mimeType).toBe('text/csv');
    expect(result.content).toContain('sampleCode');
    expect(result.content).toContain('451');
    expect(result.content).toContain('makea|hapan');
  });

  it('exports XLS-compatible content for selected session', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          data: () => ({
            responseSessionId: 'resp-1',
            sessionId: 'sess-1',
            questionnaireTitle: 'Jogurttitesti',
            createdAt: { seconds: 1713780000 },
            backgroundInfo: { age: 34, gender: 'Nainen' },
            evaluations: [
              {
                sampleCode: '451',
                samplePresentationIndex: 0,
                samplePresentationOrder: ['451', '926'],
                createdAt: { seconds: 1713780060 },
                answers: { appearance: 8 },
              },
            ],
          }),
        },
      ],
    });

    const result = await exportResults('session', 'sess-1', 'xls');

    expect(result.filename).toContain('.xls');
    expect(result.mimeType).toBe('application/vnd.ms-excel');
    expect(result.content).toContain('\t');
  });
});
