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

  it('writes document with sampleCode, rating, sessionId and createdAt', async () => {
    await saveEvaluation({
      sampleCode: ' 451 ',
      rating: 8,
      sessionId: 'sess-1',
    });

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const [, data] = mockAddDoc.mock.calls[0];
    expect(data).toMatchObject({
      sampleCode: '451',
      rating: 8,
      sessionId: 'sess-1',
      createdAt: { __serverTimestamp: true },
    });
  });

  it('rejects empty sample code', async () => {
    await expect(
      saveEvaluation({ sampleCode: '   ', rating: 5, sessionId: null }),
    ).rejects.toThrow('Näytekoodi');
  });

  it('rejects rating out of range', async () => {
    await expect(
      saveEvaluation({ sampleCode: '1', rating: 11, sessionId: null }),
    ).rejects.toThrow('0–10');
  });
});

describe('getSamples', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
  });
});
