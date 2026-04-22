import {
  fetchActiveStudySession,
  mapSession,
} from '../studyService';

import {
  getDoc,
  getDocs,
} from 'firebase/firestore';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  limit: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
}));

// Mock DB getter
jest.mock('../../firebase/firestore', () => ({
  getFirestoreDb: jest.fn(() => ({})),
}));

describe('studyService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // mapSession (utils-logiikka)
  describe('mapSession', () => {
    it('mapittaa samples oikein', () => {
      const result = mapSession('id1', { samples: ['a', 'b'] });

      expect(result).toEqual({
        id: 'id1',
        title: 'Aistinvarainen arviointi',
        samples: ['a', 'b'],
        questions: [
          {
            id: 'appearance',
            label: 'Ulkonäkö',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
          {
            id: 'smell',
            label: 'Tuoksu',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
          {
            id: 'taste',
            label: 'Maku',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
          {
            id: 'texture',
            label: 'Rakenne',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
        ],
      });
    });

    it('pakottaa arvot stringiksi', () => {
      const result = mapSession('id1', { samples: [1, 2] });

      expect(result.samples).toEqual(['1', '2']);
    });

    it('palauttaa tyhjän listan jos samples puuttuu', () => {
      const result = mapSession('id1', {});

      expect(result.samples).toEqual([]);
    });

    it('palauttaa tyhjän listan jos samples ei ole array', () => {
      const result = mapSession('id1', { samples: null });

      expect(result.samples).toEqual([]);
    });
  });

  // fetchActiveStudySession
  describe('fetchActiveStudySession', () => {
    it('palauttaa aktiivisen kyselyn jos löytyy', async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: 'questionnaire-1',
            data: () => ({
              title: 'Jogurttitesti',
              samples: ['451', '926'],
              questions: [
                { id: 'appearance', label: 'Ulkonäkö', type: 'scale' },
                { id: 'smell', label: 'Tuoksu', type: 'scale' },
                { id: 'taste', label: 'Maku', type: 'scale' },
                { id: 'texture', label: 'Rakenne', type: 'scale' },
              ],
              isActive: true,
            }),
          },
        ],
      });

      const result = await fetchActiveStudySession();

      expect(result).toEqual({
        id: 'questionnaire-1',
        title: 'Jogurttitesti',
        samples: ['451', '926'],
        questions: [
          {
            id: 'appearance',
            label: 'Ulkonäkö',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
          {
            id: 'smell',
            label: 'Tuoksu',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
          {
            id: 'taste',
            label: 'Maku',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
          {
            id: 'texture',
            label: 'Rakenne',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
        ],
      });
    });

    it('palauttaa seeded sessionin jos aktiivista kyselyä ei löydy', async () => {
      (getDocs as jest.Mock).mockResolvedValueOnce({
        empty: true,
        docs: [],
      });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'seed-dev-session',
        data: () => ({ samples: ['a', 'b'] }),
      });

      const result = await fetchActiveStudySession();

      expect(result).toEqual({
        id: 'seed-dev-session',
        title: 'Aistinvarainen arviointi',
        samples: ['a', 'b'],
        questions: [
          {
            id: 'appearance',
            label: 'Ulkonäkö',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
          {
            id: 'smell',
            label: 'Tuoksu',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
          {
            id: 'taste',
            label: 'Maku',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
          {
            id: 'texture',
            label: 'Rakenne',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
        ],
      });
    });

    it('fallback queryyn jos seeded ei löydy', async () => {
      (getDocs as jest.Mock)
        .mockResolvedValueOnce({
          empty: true,
          docs: [],
        })
        .mockResolvedValueOnce({
          empty: false,
          docs: [
            {
              id: 'doc1',
              data: () => ({ samples: ['x'] }),
            },
          ],
        });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await fetchActiveStudySession();

      expect(result).toEqual({
        id: 'doc1',
        title: 'Aistinvarainen arviointi',
        samples: ['x'],
        questions: [
          {
            id: 'appearance',
            label: 'Ulkonäkö',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
          {
            id: 'smell',
            label: 'Tuoksu',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
          {
            id: 'taste',
            label: 'Maku',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
          {
            id: 'texture',
            label: 'Rakenne',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
        ],
      });
    });

    it('palauttaa null jos ei sessioita', async () => {
      (getDocs as jest.Mock)
        .mockResolvedValueOnce({
          empty: true,
          docs: [],
        })
        .mockResolvedValueOnce({
          empty: true,
          docs: [],
        });
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await fetchActiveStudySession();

      expect(result).toBeNull();
    });

    it('heitää virheen jos Firestore epäonnistuu', async () => {
      (getDocs as jest.Mock).mockRejectedValue(
        new Error('Firestore error'),
      );

      await expect(fetchActiveStudySession()).rejects.toThrow(
        'Firestore error',
      );
    });
  });
});
