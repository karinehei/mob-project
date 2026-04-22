import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { FIRESTORE_COLLECTIONS } from '../constants/firestore';
import { getFirestoreDb } from '../firebase/firestore';
import type { QuestionnaireDraft } from '../types/questionnaire';

function sanitizeDraft(input: QuestionnaireDraft): QuestionnaireDraft {
  const title = input.title.trim();
  const samples = input.samples.map((item) => item.trim()).filter(Boolean);
  const questions = input.questions.map((question) => ({
    ...question,
    id: question.id.trim(),
    label: question.label.trim(),
    options: question.options?.map((item) => item.trim()).filter(Boolean),
  }));

  if (!title) {
    throw new Error('Kyselyn nimi puuttuu.');
  }
  if (samples.length === 0) {
    throw new Error('Kyselyllä pitää olla vähintään yksi näyte.');
  }
  if (questions.length === 0) {
    throw new Error('Kyselyllä pitää olla vähintään yksi kysymys.');
  }

  return {
    title,
    samples,
    questions,
    isActive: input.isActive !== false,
  };
}

export async function saveQuestionnaire(
  input: QuestionnaireDraft,
): Promise<string> {
  const questionnaire = sanitizeDraft(input);
  const db = getFirestoreDb();

  if (questionnaire.isActive) {
    const activeSnapshot = await getDocs(
      query(
        collection(db, FIRESTORE_COLLECTIONS.questionnaires),
        where('isActive', '==', true),
      ),
    );

    await Promise.all(
      activeSnapshot.docs.map((docSnap) =>
        updateDoc(docSnap.ref, {
          isActive: false,
          updatedAt: serverTimestamp(),
        }),
      ),
    );
  }

  const docRef = await addDoc(
    collection(db, FIRESTORE_COLLECTIONS.questionnaires),
    {
      title: questionnaire.title,
      samples: questionnaire.samples,
      questions: questionnaire.questions,
      isActive: questionnaire.isActive,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  );

  return docRef.id;
}
