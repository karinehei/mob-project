import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  limit,
  query,
} from 'firebase/firestore';
import { firebaseConfig } from '../firebase/firebaseConfig';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export interface StudySession {
  id: string;
  samples: string[];
}

/**
 * Fetches the active study session from Firestore.
 */
export async function fetchActiveStudySession(): Promise<StudySession | null> {
  try {
    const sessionsRef = collection(db, 'sessions');
    // fetch 1 active session for the MVP
    const q = query(sessionsRef, limit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      samples: data.samples || [],
    };
  } catch (error) {
    console.error('Error fetching study session:', error);
    throw error;
  }
}
