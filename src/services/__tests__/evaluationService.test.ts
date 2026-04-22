import { saveEvaluation, getSamples } from '../evaluationService';

const mockAddDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockQuery = jest.fn();

jest.mock('../../firebase/firestore', () => ({
  getFirestoreDb: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  query: (...args: unknown[]) => mockQuery(...args),
  collection: jest.fn((db, name) => ({ _db: db, _name: name })),
  serverTimestamp: jest.fn(() => ({ __serverTimestamp: true })),
}));

describe('saveEvaluation', () => {
  beforeEach(() => {
    mockAddDoc.mockResolvedValue(undefined);
  });

  it('writes document with answers, ratingSummary, sessionId and createdAt', async () => {
    await saveEvaluation({
      sampleCode: ' 451 ',
      sessionId: 'sess-1',
      responseSessionId: 'resp-1',
      questionnaireTitle: 'Jogurttitesti',
      answers: {
        appearance: 8,
        attributes: ['makea', 'hapan'],
      },
    });

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const [, data] = mockAddDoc.mock.calls[0];
    expect(data).toMatchObject({
      sampleCode: '451',
      answers: {
        appearance: 8,
        attributes: ['makea', 'hapan'],
      },
      ratingSummary: 8,
      sessionId: 'sess-1',
      responseSessionId: 'resp-1',
      questionnaireTitle: 'Jogurttitesti',
      createdAt: { __serverTimestamp: true },
    });
  });

  it('rejects empty sample code', async () => {
    await expect(
      saveEvaluation({
        sampleCode: '   ',
        sessionId: null,
        responseSessionId: 'resp-1',
        answers: { a: 5 },
      }),
    ).rejects.toThrow('Näytekoodi');
  });

  it('rejects missing answers', async () => {
    await expect(
      saveEvaluation({
        sampleCode: '1',
        sessionId: null,
        responseSessionId: 'resp-1',
        answers: {},
      }),
    ).rejects.toThrow('Vastaukset');
  });

  it('rejects missing response session id', async () => {
    await expect(
      saveEvaluation({
        sampleCode: '1',
        sessionId: null,
        responseSessionId: ' ',
        answers: { a: 3 },
      }),
    ).rejects.toThrow('Vastaussession');
  });
});

describe('getSamples', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('returns an empty array if snapshot is empty', async () => {
    mockGetDocs.mockResolvedValueOnce({ empty: true });

    const result = await getSamples();
    expect(result).toEqual([]);
  });

  it('returns mapped sample records from firestore', async () => {
    mockGetDocs.mockResolvedValueOnce({
      empty: false,
      docs: [
        { id: 'sample_1', data: () => ({ code: '451', name: 'Test A' }) },
        { id: 'sample_2', data: () => ({ code: '926', name: 'Test B' }) },
      ],
    });

    const result = await getSamples();
    expect(result).toEqual([
      { id: 'sample_1', code: '451', name: 'Test A' },
      { id: 'sample_2', code: '926', name: 'Test B' },
    ]);
  });

  it('throws an error if fetching samples fails', async () => {
    mockGetDocs.mockRejectedValueOnce(new Error('Firestore error'));

    await expect(getSamples()).rejects.toThrow(
      'Näytteiden hakeminen epäonnistui. Tarkista verkko ja yritä uudelleen.',
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching samples:',
      expect.any(Error),
    );
  });
});
