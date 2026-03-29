/**
 * Evaluation persistence — placeholder service layer over Firestore.
 * TODO: define payload types; use getFirestoreDb() from ../firebase/firestore when implementing.
 */

/** TODO: replace with real evaluation / session shape */
export type EvaluationPayloadPlaceholder = Record<string, unknown>;

/** TODO: replace with real sample / food item shape from Firestore */
export type SampleRecordPlaceholder = Record<string, unknown>;

/**
 * Persists an evaluation (e.g. study session outcome) to Firestore.
 */
export async function saveEvaluation(
  _payload: EvaluationPayloadPlaceholder,
): Promise<void> {
  throw new Error('Not implemented');
}

/**
 * Fetches sample rows (e.g. food items) for a study context.
 */
export async function getSamples(
  _studyId?: string,
): Promise<readonly SampleRecordPlaceholder[]> {
  throw new Error('Not implemented');
}
