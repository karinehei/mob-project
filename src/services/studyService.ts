import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
} from 'firebase/firestore';

import {FIRESTORE_COLLECTIONS} from '../constants/firestore';
import {getFirestoreDb} from '../firebase/firestore';

export interface StudySession {
  id: string;
  samples: string[];
}

const SEEDED_SESSION_DOC_ID = 'seed-dev-session';

export function mapSession(
  id: string,
  data: Record<string, unknown> | undefined,
): StudySession {
  return {
    id,
    samples: Array.isArray(data?.samples)
      ? data.samples.map(String)
      : [],
  };
}

/**
 * Hakee yhden istuntodokumentin kokoelmasta `sessions` (MVP: ensimmäinen dokumentti).
 */
export async function fetchActiveStudySession(): Promise<StudySession | null> {
  try {
    const db = getFirestoreDb();
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
