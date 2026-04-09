import type {FirebaseOptions} from 'firebase/app';

import {
  FIREBASE_API_KEY,
  FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_MEASUREMENT_ID,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
} from '@env';

function envString(value: string | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Firebase web app options from `.env` (see `.env.example`).
 * Arvot injektoidaan bundlerin aikana — älä commitoi `.env`-tiedostoa.
 */
export const firebaseConfig: FirebaseOptions = {
  apiKey: envString(FIREBASE_API_KEY),
  authDomain: envString(FIREBASE_AUTH_DOMAIN),
  projectId: envString(FIREBASE_PROJECT_ID),
  storageBucket: envString(FIREBASE_STORAGE_BUCKET),
  messagingSenderId: envString(FIREBASE_MESSAGING_SENDER_ID),
  appId: envString(FIREBASE_APP_ID),
  ...(envString(FIREBASE_MEASUREMENT_ID)
    ? {measurementId: envString(FIREBASE_MEASUREMENT_ID)}
    : {}),
};
