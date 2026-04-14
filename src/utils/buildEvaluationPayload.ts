import { EvaluationPayload, EntityId } from '../types/evaluation';

export const buildEvaluationPayload = (
  sampleId: EntityId,
  scores: Record<EntityId, number>
): EvaluationPayload => {
  return {
    sampleId,
    scores,
  };
};
