import { addDoc } from 'firebase/firestore';
import { saveRespondentProfile } from '../respondentProfileService';

jest.mock('../../firebase/firestore', () => ({
  getFirestoreDb: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: jest.fn((db, name) => ({ _db: db, _name: name })),
  serverTimestamp: jest.fn(() => ({ __serverTimestamp: true })),
}));

describe('respondentProfileService', () => {
  const mockAddDoc = addDoc as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddDoc.mockResolvedValue(undefined);
  });

  it('saves profile linked to session and response session', async () => {
    await saveRespondentProfile({
      sessionId: 'sess-1',
      responseSessionId: 'resp-1',
      questionnaireTitle: 'Aistinvarainen arviointi',
      age: 34,
      gender: 'Nainen',
    });

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const [, payload] = mockAddDoc.mock.calls[0];
    expect(payload).toMatchObject({
      sessionId: 'sess-1',
      responseSessionId: 'resp-1',
      questionnaireTitle: 'Aistinvarainen arviointi',
      age: 34,
      gender: 'Nainen',
      createdAt: { __serverTimestamp: true },
    });
  });

  it('rejects invalid age', async () => {
    await expect(
      saveRespondentProfile({
        sessionId: 'sess-1',
        responseSessionId: 'resp-1',
        age: 5,
        gender: 'Mies',
      }),
    ).rejects.toThrow('Iän');
  });
});
