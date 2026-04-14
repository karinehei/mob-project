import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
} from 'firebase/firestore';

import { FIRESTORE_COLLECTIONS } from '../constants/firestore';
import { getFirestoreDb } from '../firebase/firestore';

export type SaveEvaluationInput = {
  sampleCode: string;
  rating: number;
  sessionId: string | null;
};

export interface SampleRecord {
  id: string;
  [key: string]: unknown;
}

/**
 * Tallentaa yhden arvioinnin kokoelmaan `evaluations`.
 * Kentät: sampleCode, rating (0–10), sessionId, createdAt (palvelimen aika).
 */
export async function saveEvaluation(
  input: SaveEvaluationInput,
): Promise<void> {
  const code = input.sampleCode.trim();
  if (!code) {
    throw new Error('Näytekoodi puuttuu.');
  }
  if (!Number.isFinite(input.rating) || input.rating < 0 || input.rating > 10) {
    throw new Error('Pistemäärän tulee olla välillä 0–10.');
  }

  try {
    const db = getFirestoreDb();
    await addDoc(collection(db, FIRESTORE_COLLECTIONS.evaluations), {
      sampleCode: code,
      rating: input.rating,
      sessionId: input.sessionId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving evaluation:', error);
    throw new Error(
      'Arvioinnin tallentaminen epäonnistui. Tarkista verkko ja yritä uudelleen.',
    );
  }
}

/**
 * Hakee näytteet Firestoresta.
 */
export async function getSamples(
  _studyId?: string,
): Promise<readonly SampleRecord[]> {
  try {
    const db = getFirestoreDb();
    const samplesRef = collection(db, FIRESTORE_COLLECTIONS.samples);
    const q = query(samplesRef);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching samples:', error);
    throw new Error(
      'Näytteiden hakeminen epäonnistui. Tarkista verkko ja yritä uudelleen.',
    );
  }
}
