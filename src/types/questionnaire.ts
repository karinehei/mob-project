export type QuestionnaireQuestionType = 'scale' | 'multiSelect';

export interface QuestionnaireQuestion {
  id: string;
  label: string;
  type: QuestionnaireQuestionType;
  minScore?: number;
  maxScore?: number;
  options?: string[];
}

export interface Questionnaire {
  id: string;
  title: string;
  samples: string[];
  questions: QuestionnaireQuestion[];
  isActive: boolean;
}

export interface QuestionnaireDraft {
  title: string;
  samples: string[];
  questions: QuestionnaireQuestion[];
  isActive?: boolean;
}
