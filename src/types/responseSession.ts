import type { EvaluationAnswer } from './evaluation';

export type AggregatedEvaluationAnswer = {
  sampleCode: string;
  answers: Record<string, EvaluationAnswer>;
  samplePresentationOrder: string[];
  samplePresentationIndex: number;
  createdAt: unknown;
};

export type ResponseSessionRecord = {
  sessionId: string | null;
  responseSessionId: string;
  questionnaireTitle: string | null;
  backgroundInfo: {
    age: number;
    gender: string;
  };
  evaluations: AggregatedEvaluationAnswer[];
  createdAt: unknown;
};
