import {type FirebaseApp, getApp, getApps, initializeApp} from 'firebase/app';

import {firebaseConfig} from './firebaseConfig';

function isConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

/**
 * Returns the singleton Firebase app instance.
 * Throws if {@link firebaseConfig} is still empty — intentional until you add real config.
 */
export function getFirebaseApp(): FirebaseApp {
  if (!isConfigured()) {
    throw new Error(
      'Firebase not configured: copy .env.example to .env and set FIREBASE_API_KEY and FIREBASE_PROJECT_ID (see README).',
    );
  }
  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }
  return getApp();
}
