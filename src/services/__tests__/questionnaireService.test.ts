import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { saveQuestionnaire } from '../questionnaireService';

jest.mock('../../firebase/firestore', () => ({
  getFirestoreDb: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  addDoc: jest.fn(),
  collection: jest.fn((db, name) => ({ _db: db, _name: name })),
  getDocs: jest.fn(),
  query: jest.fn(),
  serverTimestamp: jest.fn(() => ({ __serverTimestamp: true })),
  updateDoc: jest.fn(),
  where: jest.fn(() => ({ _where: true })),
}));

describe('questionnaireService', () => {
  const mockAddDoc = addDoc as unknown as jest.Mock;
  const mockCollection = collection as unknown as jest.Mock;
  const mockGetDocs = getDocs as unknown as jest.Mock;
  const mockQuery = query as unknown as jest.Mock;
  const mockServerTimestamp = serverTimestamp as unknown as jest.Mock;
  const mockUpdateDoc = updateDoc as unknown as jest.Mock;
  const mockWhere = where as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddDoc.mockResolvedValue({ id: 'questionnaire-1' });
    mockGetDocs.mockResolvedValue({ docs: [] });
    mockUpdateDoc.mockResolvedValue(undefined);
    mockQuery.mockImplementation((...parts: unknown[]) => ({ parts }));
    mockCollection.mockImplementation((db, name) => ({ _db: db, _name: name }));
    mockWhere.mockReturnValue({ _where: true });
    mockServerTimestamp.mockReturnValue({ __serverTimestamp: true });
  });

  it('deactivates previous active questionnaires and stores new active questionnaire', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [{ ref: { id: 'old-active' } }],
    });

    const result = await saveQuestionnaire({
      title: 'Jogurttitesti',
      samples: ['451', '926'],
      questions: [
        { id: 'scale-1', label: 'Ulkonäkö', type: 'scale', minScore: 0, maxScore: 10 },
      ],
      isActive: true,
    });

    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(mockAddDoc.mock.calls[0][1]).toMatchObject({
      title: 'Jogurttitesti',
      samples: ['451', '926'],
      isActive: true,
      createdAt: { __serverTimestamp: true },
      updatedAt: { __serverTimestamp: true },
    });
    expect(result).toBe('questionnaire-1');
  });

  it('rejects invalid questionnaire draft', async () => {
    await expect(
      saveQuestionnaire({
        title: ' ',
        samples: [],
        questions: [],
      }),
    ).rejects.toThrow('Kyselyn nimi');
  });
});
