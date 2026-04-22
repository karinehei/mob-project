import type { EvaluationAnswer } from '../types/evaluation';

export type CsvExportRow = {
  responseSessionId: string;
  sessionId: string;
  questionnaireTitle: string;
  responseCreatedAt: string;
  respondentAge: string;
  respondentGender: string;
  sampleCode: string;
  samplePresentationIndex: string;
  samplePresentationOrder: string;
  evaluationCreatedAt: string;
  answers: Record<string, EvaluationAnswer>;
};

function toCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

function escapeCsvCell(input: string, delimiter: string): string {
  const mustQuote =
    input.includes('"') ||
    input.includes('\n') ||
    input.includes('\r') ||
    input.includes(delimiter);
  if (!mustQuote) {
    return input;
  }
  return `"${input.replace(/"/g, '""')}"`;
}

function normalizeAnswer(value: EvaluationAnswer | undefined): string {
  if (typeof value === 'number') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.join('|');
  }
  return '';
}

export function buildResponseCsvContent(
  rows: CsvExportRow[],
  delimiter = ';',
): string {
  const questionIds = Array.from(
    new Set(rows.flatMap((row) => Object.keys(row.answers))),
  ).sort();

  const headers = [
    'responseSessionId',
    'sessionId',
    'questionnaireTitle',
    'responseCreatedAt',
    'respondentAge',
    'respondentGender',
    'sampleCode',
    'samplePresentationIndex',
    'samplePresentationOrder',
    'evaluationCreatedAt',
    ...questionIds.map((id) => `q_${id}`),
  ];

  const csvRows = rows.map((row) => {
    const values = [
      row.responseSessionId,
      row.sessionId,
      row.questionnaireTitle,
      row.responseCreatedAt,
      row.respondentAge,
      row.respondentGender,
      row.sampleCode,
      row.samplePresentationIndex,
      row.samplePresentationOrder,
      row.evaluationCreatedAt,
      ...questionIds.map((id) => normalizeAnswer(row.answers[id])),
    ];
    return values
      .map((value) => escapeCsvCell(toCellValue(value), delimiter))
      .join(delimiter);
  });

  return [headers.join(delimiter), ...csvRows].join('\n');
}
