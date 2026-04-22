import { EvaluationAnswer, EvaluationPayload, EntityId } from '../types/evaluation';

export const buildEvaluationPayload = (
  sampleId: EntityId,
  answers: Record<EntityId, EvaluationAnswer>
): EvaluationPayload => {
  return {
    sampleId,
    answers,
  };
};
