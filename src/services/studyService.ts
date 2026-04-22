import {
  collection,
  doc,
  type DocumentData,
  type QueryDocumentSnapshot,
  getDoc,
  getDocs,
  limit,
  orderBy,
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
const MIN_SENSORY_SCALE_QUESTIONS = 4;
const DEFAULT_SENSORY_SCALE_QUESTIONS: QuestionnaireQuestion[] = [
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
];

type FirestoreTimestampLike = {
  toMillis?: () => number;
  seconds?: number;
  nanoseconds?: number;
};

function updatedAtToMillis(value: unknown): number {
  if (!value) {
    return 0;
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as FirestoreTimestampLike).toMillis === 'function'
  ) {
    return (value as FirestoreTimestampLike).toMillis!();
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as FirestoreTimestampLike).seconds === 'number'
  ) {
    return (
      (value as FirestoreTimestampLike).seconds! * 1000 +
      Math.floor(((value as FirestoreTimestampLike).nanoseconds ?? 0) / 1_000_000)
    );
  }
  return 0;
}

function pickLatestByUpdatedAt(
  docs: QueryDocumentSnapshot<DocumentData>[],
): QueryDocumentSnapshot<DocumentData> | null {
  if (docs.length === 0) {
    return null;
  }

  return docs.reduce((latest, current) => {
    const latestMillis = updatedAtToMillis(latest.data()?.updatedAt);
    const currentMillis = updatedAtToMillis(current.data()?.updatedAt);
    return currentMillis > latestMillis ? current : latest;
  });
}

function isMissingIndexError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return (
    message.includes('query requires an index') ||
    message.includes('failed-precondition')
  );
}

function normalizeQuestion(
  question: Record<string, unknown>,
  index: number,
): QuestionnaireQuestion {
  const type = question.type === 'multiSelect' ? 'multiSelect' : 'scale';
  if (type === 'multiSelect') {
    return {
      id:
        typeof question.id === 'string' && question.id.trim()
          ? question.id
          : `multi-select-${index + 1}`,
      label:
        typeof question.label === 'string' && question.label.trim()
          ? question.label
          : `Monivalinta ${index + 1}`,
      type,
      options: Array.isArray(question.options)
        ? question.options
            .map(String)
            .map((option) => option.trim())
            .filter(Boolean)
        : [],
    };
  }

  const minScore = typeof question.minScore === 'number' ? question.minScore : 0;
  const maxScore = typeof question.maxScore === 'number' ? question.maxScore : 10;
  return {
    id:
      typeof question.id === 'string' && question.id.trim()
        ? question.id
        : `scale-${index + 1}`,
    label:
      typeof question.label === 'string' && question.label.trim()
        ? question.label
        : `Asteikko ${index + 1}`,
    type: 'scale',
    minScore,
    maxScore,
  };
}

function ensureMinimumSensoryScaleQuestions(
  questions: QuestionnaireQuestion[],
): QuestionnaireQuestion[] {
  const existingScaleQuestions = questions.filter(
    (question) => question.type === 'scale',
  );

  if (existingScaleQuestions.length >= MIN_SENSORY_SCALE_QUESTIONS) {
    return questions;
  }

  const existingIds = new Set(questions.map((question) => question.id));
  const missingDefaults = DEFAULT_SENSORY_SCALE_QUESTIONS.filter(
    (question) => !existingIds.has(question.id),
  );

  const needCount = MIN_SENSORY_SCALE_QUESTIONS - existingScaleQuestions.length;
  return [...questions, ...missingDefaults.slice(0, needCount)];
}

export function mapSession(
  id: string,
  data: Record<string, unknown> | undefined,
): StudySession {
  const rawQuestions = Array.isArray(data?.questions)
    ? data.questions
        .filter((question): question is Record<string, unknown> =>
          Boolean(question && typeof question === 'object' && !Array.isArray(question)),
        )
        .map((question, index) => normalizeQuestion(question, index))
    : [];

  return {
    id,
    title: typeof data?.title === 'string' ? data.title : 'Aistinvarainen arviointi',
    samples: Array.isArray(data?.samples)
      ? data.samples.map(String)
      : [],
    questions: ensureMinimumSensoryScaleQuestions(rawQuestions),
  };
}

/**
 * Hakee yhden istuntodokumentin kokoelmasta `sessions` (MVP: ensimmäinen dokumentti).
 */
export async function fetchActiveStudySession(): Promise<StudySession | null> {
  try {
    const db = getFirestoreDb();
    let questionnaireDoc: QueryDocumentSnapshot<DocumentData> | null = null;

    try {
      const questionnaireSnapshot = await getDocs(
        query(
          collection(db, FIRESTORE_COLLECTIONS.questionnaires),
          where('isActive', '==', true),
          orderBy('updatedAt', 'desc'),
          limit(1),
        ),
      );
      questionnaireDoc = questionnaireSnapshot.empty
        ? null
        : questionnaireSnapshot.docs[0];
    } catch (error) {
      if (!isMissingIndexError(error)) {
        throw error;
      }

      // Fallback for dev/prototype projects without composite index:
      // fetch active questionnaires and sort by updatedAt client-side.
      const fallbackSnapshot = await getDocs(
        query(
          collection(db, FIRESTORE_COLLECTIONS.questionnaires),
          where('isActive', '==', true),
        ),
      );
      questionnaireDoc = pickLatestByUpdatedAt(fallbackSnapshot.docs);
    }

    if (questionnaireDoc) {
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
