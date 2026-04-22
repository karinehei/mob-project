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
