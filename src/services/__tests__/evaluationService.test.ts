import { saveEvaluation } from '../evaluationService';

const mockAddDoc = jest.fn();

jest.mock('../../firebase/firestore', () => ({
  getFirestoreDb: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
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
