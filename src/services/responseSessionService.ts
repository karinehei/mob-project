import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { FIRESTORE_COLLECTIONS } from '../constants/firestore';
import { getFirestoreDb } from '../firebase/firestore';
import type { EvaluationAnswer } from '../types/evaluation';
import type { AggregatedEvaluationAnswer } from '../types/responseSession';

type AggregatedEvaluation = AggregatedEvaluationAnswer;

export type SaveResponseSessionInput = {
  sessionId: string | null;
  responseSessionId: string;
  questionnaireTitle?: string | null;
  age: number;
  gender: string;
};

function normalizeEvaluation(
  record: Record<string, unknown>,
): AggregatedEvaluation | null {
  const sampleCode =
    typeof record.sampleCode === 'string' ? record.sampleCode.trim() : '';
  if (!sampleCode) {
    return null;
  }

  const answers = record.answers;
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return null;
  }

  const samplePresentationOrder = Array.isArray(record.samplePresentationOrder)
    ? record.samplePresentationOrder.map(String)
    : [];

  const samplePresentationIndex =
    typeof record.samplePresentationIndex === 'number' &&
    Number.isInteger(record.samplePresentationIndex)
      ? record.samplePresentationIndex
      : -1;

  if (
    samplePresentationOrder.length === 0 ||
    samplePresentationIndex < 0 ||
    samplePresentationIndex >= samplePresentationOrder.length
  ) {
    return null;
  }

  return {
    sampleCode,
    answers: answers as Record<string, EvaluationAnswer>,
    samplePresentationOrder,
    samplePresentationIndex,
    createdAt: record.createdAt ?? null,
  };
}

export async function saveResponseSession(
  input: SaveResponseSessionInput,
): Promise<void> {
  if (!Number.isInteger(input.age) || input.age < 10 || input.age > 120) {
    throw new Error('Iän tulee olla kokonaisluku välillä 10-120.');
  }

  const gender = input.gender.trim();
  if (!gender) {
    throw new Error('Sukupuoli on pakollinen.');
  }

  const responseSessionId = input.responseSessionId.trim();
  if (!responseSessionId) {
    throw new Error('Vastaussession tunniste puuttuu.');
  }

  try {
    const db = getFirestoreDb();
    const evaluationsSnapshot = await getDocs(
      query(
        collection(db, FIRESTORE_COLLECTIONS.evaluations),
        where('responseSessionId', '==', responseSessionId),
      ),
    );

    const evaluations = evaluationsSnapshot.docs
      .map((doc) => normalizeEvaluation(doc.data() as Record<string, unknown>))
      .filter((value): value is AggregatedEvaluation => Boolean(value))
      .sort((a, b) => a.samplePresentationIndex - b.samplePresentationIndex);

    if (evaluations.length === 0) {
      throw new Error(
        'Arviointeja ei löytynyt vastaussessiolle. Tallenna ensin vähintään yksi arvio.',
      );
    }

    await addDoc(collection(db, FIRESTORE_COLLECTIONS.responseSessions), {
      sessionId: input.sessionId,
      responseSessionId,
      questionnaireTitle: input.questionnaireTitle ?? null,
      backgroundInfo: {
        age: input.age,
        gender,
      },
      evaluations,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Arviointeja ei löytynyt')) {
      throw error;
    }
    console.error('Error saving response session:', error);
    throw new Error(
      'Koko vastaussession tallentaminen epäonnistui. Tarkista verkko ja yritä uudelleen.',
    );
  }
}
