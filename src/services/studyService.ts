import {
  collection,
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

/**
 * Hakee yhden istuntodokumentin kokoelmasta `sessions` (MVP: ensimmäinen dokumentti).
 */
export async function fetchActiveStudySession(): Promise<StudySession | null> {
  try {
    const db = getFirestoreDb();
    const sessionsRef = collection(db, FIRESTORE_COLLECTIONS.sessions);
    const q = query(sessionsRef, limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const docSnap = snapshot.docs[0];
    const data = docSnap.data();

    return {
      id: docSnap.id,
      samples: Array.isArray(data.samples) ? data.samples.map(String) : [],
    };
  } catch (error) {
    console.error('Error fetching study session:', error);
    throw error;
  }
}
