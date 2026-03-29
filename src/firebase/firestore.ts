import {type Firestore, getFirestore} from 'firebase/firestore';

import {getFirebaseApp} from './firebaseApp';

let firestoreInstance: Firestore | undefined;

/**
 * Lazily returns the default Firestore instance for the Firebase app.
 * Relies on {@link getFirebaseApp}; no auth or persistence options yet.
 */
export function getFirestoreDb(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getFirebaseApp());
  }
  return firestoreInstance;
}
