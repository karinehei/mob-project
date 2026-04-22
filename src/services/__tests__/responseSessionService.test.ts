import { addDoc, getDocs } from 'firebase/firestore';
import { saveResponseSession } from '../responseSessionService';

jest.mock('../../firebase/firestore', () => ({
  getFirestoreDb: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn((...args) => args),
  where: jest.fn((...args) => args),
  collection: jest.fn((db, name) => ({ _db: db, _name: name })),
  serverTimestamp: jest.fn(() => ({ __serverTimestamp: true })),
}));

describe('responseSessionService', () => {
  const mockAddDoc = addDoc as unknown as jest.Mock;
  const mockGetDocs = getDocs as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddDoc.mockResolvedValue(undefined);
  });

  it('saves aggregated response session with profile and all answers', async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          data: () => ({
            sampleCode: '926',
            answers: { appearance: 7, attributes: ['makea', 'hapan'] },
            samplePresentationOrder: ['451', '926'],
            samplePresentationIndex: 1,
            createdAt: { seconds: 100 },
          }),
        },
        {
          data: () => ({
            sampleCode: '451',
            answers: { appearance: 8, attributes: ['raikas'] },
            samplePresentationOrder: ['451', '926'],
            samplePresentationIndex: 0,
            createdAt: { seconds: 90 },
          }),
        },
      ],
    });

    await saveResponseSession({
      sessionId: 'sess-1',
      responseSessionId: 'resp-1',
      questionnaireTitle: 'Aistinvarainen arviointi',
      age: 34,
      gender: 'Nainen',
    });

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const [target, payload] = mockAddDoc.mock.calls[0];
    expect(target).toMatchObject({ _name: 'responseSessions' });
    expect(payload).toMatchObject({
      sessionId: 'sess-1',
      responseSessionId: 'resp-1',
      questionnaireTitle: 'Aistinvarainen arviointi',
      backgroundInfo: {
        age: 34,
        gender: 'Nainen',
      },
      createdAt: { __serverTimestamp: true },
      evaluations: [
        {
          sampleCode: '451',
          answers: { appearance: 8, attributes: ['raikas'] },
          samplePresentationOrder: ['451', '926'],
          samplePresentationIndex: 0,
        },
        {
          sampleCode: '926',
          answers: { appearance: 7, attributes: ['makea', 'hapan'] },
          samplePresentationOrder: ['451', '926'],
          samplePresentationIndex: 1,
        },
      ],
    });
  });

  it('rejects when no evaluations are found for response session', async () => {
    mockGetDocs.mockResolvedValue({ docs: [] });

    await expect(
      saveResponseSession({
        sessionId: 'sess-1',
        responseSessionId: 'resp-1',
        questionnaireTitle: 'Aistinvarainen arviointi',
        age: 34,
        gender: 'Nainen',
      }),
    ).rejects.toThrow('Arviointeja ei löytynyt');
  });

  it('rejects invalid age', async () => {
    await expect(
      saveResponseSession({
        sessionId: 'sess-1',
        responseSessionId: 'resp-1',
        questionnaireTitle: 'Aistinvarainen arviointi',
        age: 5,
        gender: 'Nainen',
      }),
    ).rejects.toThrow('Iän');
  });
});
