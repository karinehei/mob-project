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
        samples: ['a', 'b'],
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

    it('palauttaa seeded sessionin jos löytyy', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        id: 'seed-dev-session',
        data: () => ({ samples: ['a', 'b'] }),
      });

      const result = await fetchActiveStudySession();

      expect(result).toEqual({
        id: 'seed-dev-session',
        samples: ['a', 'b'],
      });
    });

    it('fallback queryyn jos seeded ei löydy', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      (getDocs as jest.Mock).mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'doc1',
            data: () => ({ samples: ['x'] }),
          },
        ],
      });

      const result = await fetchActiveStudySession();

      expect(result).toEqual({
        id: 'doc1',
        samples: ['x'],
      });
    });

    it('palauttaa null jos ei sessioita', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      (getDocs as jest.Mock).mockResolvedValue({
        empty: true,
        docs: [],
      });

      const result = await fetchActiveStudySession();

      expect(result).toBeNull();
    });

    it('heitää virheen jos Firestore epäonnistuu', async () => {
      (getDoc as jest.Mock).mockRejectedValue(
        new Error('Firestore error'),
      );

      await expect(fetchActiveStudySession()).rejects.toThrow(
        'Firestore error',
      );
    });
  });
});
