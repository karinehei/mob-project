import i18next from 'i18next';
import type {
  QuestionnaireDraft,
  QuestionnaireQuestion,
} from '../types/questionnaire';

type ManualQuestionnaireInput = {
  title: string;
  samplesText: string;
  scaleQuestionsText: string;
  cataQuestionLabel?: string;
  cataOptionsText?: string;
};

function tWithFallback(key: string, fallback: string): string {
  const translated = i18next.t(key);
  return translated === key ? fallback : translated;
}

export function parseTokenList(input: string): string[] {
  return input
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildScaleQuestions(lines: string[]): QuestionnaireQuestion[] {
  return lines.map((label, index) => ({
    id: `scale-${index + 1}`,
    label,
    type: 'scale',
    minScore: 0,
    maxScore: 10,
  }));
}

function countScaleQuestions(questions: QuestionnaireQuestion[]): number {
  return questions.filter((question) => question.type === 'scale').length;
}

function buildMultiSelectQuestion(
  label: string,
  options: string[],
): QuestionnaireQuestion {
  return {
    id: 'multi-select-1',
    label,
    type: 'multiSelect',
    options,
  };
}

export function buildQuestionnaireDraftFromManualInput(
  input: ManualQuestionnaireInput,
): QuestionnaireDraft {
  const title = input.title.trim();
  const samples = parseTokenList(input.samplesText);
  const scaleQuestions = parseTokenList(input.scaleQuestionsText);
  const cataLabel = input.cataQuestionLabel?.trim() ?? '';
  const cataOptions = parseTokenList(input.cataOptionsText ?? '');

  if (!title) {
    throw new Error('Kyselyn nimi puuttuu.');
  }
  if (samples.length === 0) {
    throw new Error('Lisää vähintään yksi näytekoodi.');
  }
  if (scaleQuestions.length === 0) {
    throw new Error('Lisää vähintään yksi arviointikysymys.');
  }
  if (scaleQuestions.length < 4) {
    throw new Error(
      tWithFallback(
        'admin_screen.error_minimum_scale_questions',
        'Lisää vähintään neljä asteikkokysymystä (ulkonäkö, tuoksu, maku, rakenne).',
      ),
    );
  }
  if ((cataLabel && cataOptions.length === 0) || (!cataLabel && cataOptions.length > 0)) {
    throw new Error('CATA-kysymys tarvitsee sekä otsikon että vaihtoehdot.');
  }

  const questions = buildScaleQuestions(scaleQuestions);
  if (cataLabel && cataOptions.length > 0) {
    questions.push(buildMultiSelectQuestion(cataLabel, cataOptions));
  }

  return {
    title,
    samples,
    questions,
    isActive: true,
  };
}

function normalizeQuestion(
  rawQuestion: Record<string, unknown>,
  index: number,
): QuestionnaireQuestion {
  const type = rawQuestion.type === 'multiSelect' ? 'multiSelect' : 'scale';
  const label =
    typeof rawQuestion.label === 'string' ? rawQuestion.label.trim() : '';

  if (!label) {
    throw new Error(`Tuodun kysymyksen ${index + 1} otsikko puuttuu.`);
  }

  if (type === 'multiSelect') {
    const options = Array.isArray(rawQuestion.options)
      ? rawQuestion.options.map(String).map((item) => item.trim()).filter(Boolean)
      : [];

    if (options.length === 0) {
      throw new Error(
        `Tuodun monivalintakysymyksen "${label}" vaihtoehdot puuttuvat.`,
      );
    }

    return {
      id:
        typeof rawQuestion.id === 'string' && rawQuestion.id.trim()
          ? rawQuestion.id.trim()
          : `multi-select-${index + 1}`,
      label,
      type,
      options,
    };
  }

  const minScore =
    typeof rawQuestion.minScore === 'number' ? rawQuestion.minScore : 0;
  const maxScore =
    typeof rawQuestion.maxScore === 'number' ? rawQuestion.maxScore : 10;

  return {
    id:
      typeof rawQuestion.id === 'string' && rawQuestion.id.trim()
        ? rawQuestion.id.trim()
        : `scale-${index + 1}`,
    label,
    type,
    minScore,
    maxScore,
  };
}

export function parseQuestionnaireImport(input: string): QuestionnaireDraft {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    throw new Error('JSON-tuonti ei ole kelvollista JSON-muotoa.');
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Tuodun kyselyn tulee olla JSON-objekti.');
  }

  const record = data as Record<string, unknown>;
  const title = typeof record.title === 'string' ? record.title.trim() : '';
  const samples = Array.isArray(record.samples)
    ? record.samples.map(String).map((item) => item.trim()).filter(Boolean)
    : [];
  const rawQuestions = Array.isArray(record.questions) ? record.questions : [];

  if (!title) {
    throw new Error('Tuodun kyselyn nimi puuttuu.');
  }
  if (samples.length === 0) {
    throw new Error('Tuodusta kyselystä puuttuvat näytekoodit.');
  }
  if (rawQuestions.length === 0) {
    throw new Error('Tuodusta kyselystä puuttuvat kysymykset.');
  }

  const questions = rawQuestions.map((question, index) => {
    if (!question || typeof question !== 'object' || Array.isArray(question)) {
      throw new Error(`Kysymys ${index + 1} ei ole kelvollinen objekti.`);
    }
    return normalizeQuestion(question as Record<string, unknown>, index);
  });

  if (countScaleQuestions(questions) < 4) {
    throw new Error(
      tWithFallback(
        'admin_screen.error_import_minimum_scale_questions',
        'Tuodussa kyselyssä pitää olla vähintään neljä asteikkokysymystä.',
      ),
    );
  }

  return {
    title,
    samples,
    questions,
    isActive: record.isActive !== false,
  };
}
