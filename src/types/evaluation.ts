import type { EntityId } from './models';

export interface EvaluationCriterion {
  id: EntityId;
  label: string;
  minScore: number;
  maxScore: number;
}

/**
 * Yksi tallennettu tai laskettu arviointi näytteelle.
 * TODO: timestamp-tyyppi (ISO string vs Firestore Timestamp) kun persistenssi on tiedossa.
 */
export interface Evaluation {
  sampleId: EntityId;
  timestamp: string;
  /** Avain = EvaluationCriterion.id */
  scores: Record<EntityId, number>;
}

/**
 * Kevyt rakenne arvioinnin lähettämiseen / tallennukseen.
 * TODO: täydennä kun backend-sopimus on valmis (esim. evaluatorId, sessionId).
 */
export interface EvaluationPayload {
  sampleId: EntityId;
  scores: Record<EntityId, number>;
}
