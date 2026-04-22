import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';

import {FIRESTORE_COLLECTIONS} from '../constants/firestore';
import {getFirestoreDb} from '../firebase/firestore';
import type {QuestionnaireQuestion} from '../types/questionnaire';

export interface StudySession {
  id: string;
  title: string;
  samples: string[];
  questions: QuestionnaireQuestion[];
}

const SEEDED_SESSION_DOC_ID = 'seed-dev-session';

export function mapSession(
  id: string,
  data: Record<string, unknown> | undefined,
): StudySession {
  return {
    id,
    title: typeof data?.title === 'string' ? data.title : 'Aistinvarainen arviointi',
    samples: Array.isArray(data?.samples)
      ? data.samples.map(String)
      : [],
    questions: Array.isArray(data?.questions)
      ? data.questions
          .filter((question): question is Record<string, unknown> =>
            Boolean(question && typeof question === 'object' && !Array.isArray(question)),
          )
          .map((question, index) => ({
            id:
              typeof question.id === 'string' && question.id.trim()
                ? question.id
                : `question-${index + 1}`,
            label:
              typeof question.label === 'string' && question.label.trim()
                ? question.label
                : `Kysymys ${index + 1}`,
            type: question.type === 'multiSelect' ? 'multiSelect' : 'scale',
            ...(typeof question.minScore === 'number'
              ? {minScore: question.minScore}
              : {}),
            ...(typeof question.maxScore === 'number'
              ? {maxScore: question.maxScore}
              : {}),
            ...(Array.isArray(question.options)
              ? {
                  options: question.options
                    .map(String)
                    .map((option) => option.trim())
                    .filter(Boolean),
                }
              : {}),
          }))
      : [],
  };
}

/**
 * Hakee yhden istuntodokumentin kokoelmasta `sessions` (MVP: ensimmäinen dokumentti).
 */
export async function fetchActiveStudySession(): Promise<StudySession | null> {
  try {
    const db = getFirestoreDb();
    const questionnaireSnapshot = await getDocs(
      query(
        collection(db, FIRESTORE_COLLECTIONS.questionnaires),
        where('isActive', '==', true),
        limit(1),
      ),
    );

    if (!questionnaireSnapshot.empty) {
      const questionnaireDoc = questionnaireSnapshot.docs[0];
      return mapSession(questionnaireDoc.id, questionnaireDoc.data());
    }

    const seededRef = doc(
      db,
      FIRESTORE_COLLECTIONS.sessions,
      SEEDED_SESSION_DOC_ID,
    );
    const seededSnapshot = await getDoc(seededRef);

    if (seededSnapshot.exists()) {
      return mapSession(seededSnapshot.id, seededSnapshot.data());
    }

    const sessionsRef = collection(db, FIRESTORE_COLLECTIONS.sessions);
    const q = query(sessionsRef, limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const docSnap = snapshot.docs[0];
    return mapSession(docSnap.id, docSnap.data());
  } catch (error) {
    console.error('Error fetching study session:', error);
    throw error;
  }
}
