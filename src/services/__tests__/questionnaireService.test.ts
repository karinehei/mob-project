import { saveQuestionnaire } from '../questionnaireService';

const mockAddDoc = jest.fn();
const mockGetDocs = jest.fn();
const mockUpdateDoc = jest.fn();
const mockQuery = jest.fn();
const mockCollection = jest.fn((db, name) => ({ _db: db, _name: name }));
const mockServerTimestamp = jest.fn(() => ({ __serverTimestamp: true }));
const mockWhere = jest.fn(() => ({ _where: true }));

jest.mock('../../firebase/firestore', () => ({
  getFirestoreDb: jest.fn(() => ({})),
}));

jest.mock('firebase/firestore', () => ({
  addDoc: mockAddDoc,
  collection: mockCollection,
  getDocs: mockGetDocs,
  query: mockQuery,
  serverTimestamp: mockServerTimestamp,
  updateDoc: mockUpdateDoc,
  where: mockWhere,
}));

describe('questionnaireService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddDoc.mockResolvedValue({ id: 'questionnaire-1' });
    mockGetDocs.mockResolvedValue({ docs: [] });
    mockUpdateDoc.mockResolvedValue(undefined);
    mockQuery.mockImplementation((...parts: unknown[]) => ({ parts }));
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
