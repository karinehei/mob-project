import {
  EvaluationPayload,
} from '../types/evaluation';
import type { QuestionnaireQuestion } from '../types/questionnaire';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateEvaluation = (
  payload: EvaluationPayload,
  questions: QuestionnaireQuestion[]
): ValidationError[] => {
  const errors: ValidationError[] = [];

  // sampleId
  if (!payload.sampleId || payload.sampleId.trim() === '') {
    errors.push({
      field: 'sampleId',
      message: 'Sample puuttuu',
    });
  }

  // answers object
  if (!payload.answers || typeof payload.answers !== 'object') {
    errors.push({
      field: 'answers',
      message: 'Vastaukset puuttuvat',
    });
    return errors;
  }

  for (const question of questions) {
    const value = payload.answers[question.id];

    if (value === undefined || value === null) {
      errors.push({
        field: `answers.${question.id}`,
        message: `${question.label} puuttuu`,
      });
      continue;
    }

    if (question.type === 'scale') {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        errors.push({
          field: `answers.${question.id}`,
          message: `${question.label} ei ole numero`,
        });
        continue;
      }

      const minScore = question.minScore ?? 0;
      const maxScore = question.maxScore ?? 10;
      if (value < minScore || value > maxScore) {
        errors.push({
          field: `answers.${question.id}`,
          message: `${question.label} oltava välillä ${minScore}-${maxScore}`,
        });
      }
      continue;
    }

    if (!Array.isArray(value)) {
      errors.push({
        field: `answers.${question.id}`,
        message: `${question.label} ei ole valintalista`,
      });
      continue;
    }

    const allowedOptions = question.options ?? [];
    if (value.length === 0) {
      errors.push({
        field: `answers.${question.id}`,
        message: `${question.label} puuttuu`,
      });
      continue;
    }

    const invalidOption = value.find((option) => !allowedOptions.includes(option));
    if (invalidOption) {
      errors.push({
        field: `answers.${question.id}`,
        message: `${question.label} sisältää tuntemattoman vaihtoehdon`,
      });
    }
  }

  return errors;
};
