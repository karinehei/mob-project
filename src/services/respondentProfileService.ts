import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';

import { FIRESTORE_COLLECTIONS } from '../constants/firestore';
import { getFirestoreDb } from '../firebase/firestore';

export type SaveRespondentProfileInput = {
  sessionId: string | null;
  responseSessionId: string;
  questionnaireTitle?: string | null;
  age: number;
  gender: string;
};

export async function saveRespondentProfile(
  input: SaveRespondentProfileInput,
): Promise<void> {
  if (!Number.isInteger(input.age) || input.age < 10 || input.age > 120) {
    throw new Error('Iän tulee olla kokonaisluku välillä 10-120.');
  }

  const gender = input.gender.trim();
  if (!gender) {
    throw new Error('Sukupuoli on pakollinen.');
  }

  if (!input.responseSessionId.trim()) {
    throw new Error('Vastaussession tunniste puuttuu.');
  }

  try {
    const db = getFirestoreDb();
    await addDoc(collection(db, FIRESTORE_COLLECTIONS.respondentProfiles), {
      sessionId: input.sessionId,
      responseSessionId: input.responseSessionId,
      questionnaireTitle: input.questionnaireTitle ?? null,
      age: input.age,
      gender,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving respondent profile:', error);
    throw new Error(
      'Taustatietojen tallentaminen epäonnistui. Tarkista verkko ja yritä uudelleen.',
    );
  }
}
