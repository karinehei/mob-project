import type { StudySessionPlaceholder } from '../types';

/**
 * Study-related data access. No Firestore or API — stub for future implementation.
 */
export async function getStudySessionPlaceholder(): Promise<StudySessionPlaceholder | null> {
  // TODO: load from persistence / API
  return null;
}
