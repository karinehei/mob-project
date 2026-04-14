import {
  EvaluationCriterion,
  EvaluationPayload,
} from '../types/evaluation';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEvaluation = (
  payload: EvaluationPayload,
  criteria: EvaluationCriterion[]
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // sampleId
  if (!payload.sampleId || payload.sampleId.trim() === '') {
    errors.push({
      field: 'sampleId',
      message: 'Sample puuttuu',
    });
  }

  // scores object
  if (!payload.scores || typeof payload.scores !== 'object') {
    errors.push({
      field: 'scores',
      message: 'Pisteet puuttuvat',
    });
    return errors;
  }

  // validaatio per kriteeri
  for (const criterion of criteria) {
    const value = payload.scores[criterion.id];

    // puuttuva
    if (value === undefined || value === null) {
      errors.push({
        field: `scores.${criterion.id}`,
        message: `${criterion.label} puuttuu`,
      });
      continue;
    }

    // ei numero
    if (typeof value !== 'number' || Number.isNaN(value)) {
      errors.push({
        field: `scores.${criterion.id}`,
        message: `${criterion.label} ei ole numero`,
      });
      continue;
    }

    // range check
    if (value < criterion.minScore || value > criterion.maxScore) {
      errors.push({
        field: `scores.${criterion.id}`,
        message: `${criterion.label} oltava välillä ${criterion.minScore}-${criterion.maxScore}`,
      });
    }
  }

  return errors;
};
