import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
} from 'firebase/firestore';

import { FIRESTORE_COLLECTIONS } from '../constants/firestore';
import { getFirestoreDb } from '../firebase/firestore';
import type { EvaluationAnswer } from '../types/evaluation';

export type SaveEvaluationInput = {
  sampleCode: string;
  sessionId: string | null;
  responseSessionId: string;
  answers: Record<string, EvaluationAnswer>;
  questionnaireTitle?: string | null;
};

export interface SampleRecord {
  id: string;
  [key: string]: unknown;
}

/**
 * Tallentaa yhden arvioinnin kokoelmaan `evaluations`.
 * Kentät: sampleCode, answers, ratingSummary, sessionId, questionnaireTitle, createdAt.
 */
export async function saveEvaluation(
  input: SaveEvaluationInput,
): Promise<void> {
  const code = input.sampleCode.trim();
  if (!code) {
    throw new Error('Näytekoodi puuttuu.');
  }
  const answerKeys = Object.keys(input.answers ?? {});
  if (answerKeys.length === 0) {
    throw new Error('Vastaukset puuttuvat.');
  }
  if (!input.responseSessionId.trim()) {
    throw new Error('Vastaussession tunniste puuttuu.');
  }

  try {
    const db = getFirestoreDb();
    const numericAnswers = Object.values(input.answers).filter(
      (value): value is number => typeof value === 'number' && Number.isFinite(value),
    );
    const ratingSummary =
      numericAnswers.length > 0
        ? Math.round(
            numericAnswers.reduce((sum, value) => sum + value, 0) /
              numericAnswers.length,
          )
        : null;

    await addDoc(collection(db, FIRESTORE_COLLECTIONS.evaluations), {
      sampleCode: code,
      answers: input.answers,
      rating: ratingSummary,
      ratingSummary,
      sessionId: input.sessionId,
      responseSessionId: input.responseSessionId,
      questionnaireTitle: input.questionnaireTitle ?? null,
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
