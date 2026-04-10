import {addDoc, collection, serverTimestamp} from 'firebase/firestore';

import {FIRESTORE_COLLECTIONS} from '../constants/firestore';
import {getFirestoreDb} from '../firebase/firestore';

export type SaveEvaluationInput = {
  sampleCode: string;
  rating: number;
  sessionId: string | null;
};

/** TODO: korvaa oikealla näyte-/katalogimuodolla kun `getSamples` toteutetaan */
export type SampleRecordPlaceholder = Record<string, unknown>;

/**
 * Tallentaa yhden arvioinnin kokoelmaan `evaluations`.
 * Kentät: sampleCode, rating (0–10), sessionId, createdAt (palvelimen aika).
 */
export async function saveEvaluation(input: SaveEvaluationInput): Promise<void> {
  const code = input.sampleCode.trim();
  if (!code) {
    throw new Error('Näytekoodi puuttuu.');
  }
  if (!Number.isFinite(input.rating) || input.rating < 0 || input.rating > 10) {
    throw new Error('Pistemäärän tulee olla välillä 0–10.');
  }

  const db = getFirestoreDb();
  await addDoc(collection(db, FIRESTORE_COLLECTIONS.evaluations), {
    sampleCode: code,
    rating: input.rating,
    sessionId: input.sessionId,
    createdAt: serverTimestamp(),
  });
}

/** TODO: hae näytteet Firestoresta (erillinen tiketti) */
export async function getSamples(
  _studyId?: string,
): Promise<readonly SampleRecordPlaceholder[]> {
  throw new Error('Not implemented');
}
