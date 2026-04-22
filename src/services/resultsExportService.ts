import { collection, getDocs, query, where } from 'firebase/firestore';

import { FIRESTORE_COLLECTIONS } from '../constants/firestore';
import { getFirestoreDb } from '../firebase/firestore';
import {
  buildResponseCsvContent,
  type CsvExportRow,
} from '../utils/responseCsv';

type ExportFormat = 'csv' | 'xls';
type ExportScope = 'questionnaire' | 'session';

type ResponseSessionDoc = {
  sessionId?: string | null;
  responseSessionId?: string;
  questionnaireTitle?: string | null;
  backgroundInfo?: {
    age?: number;
    gender?: string;
  };
  evaluations?: Array<{
    sampleCode?: string;
    samplePresentationIndex?: number;
    samplePresentationOrder?: string[];
    answers?: Record<string, unknown>;
    createdAt?: unknown;
  }>;
  createdAt?: unknown;
};

export type ExportOption = {
  value: string;
  label: string;
  count: number;
};

export type ExportOptions = {
  questionnaireOptions: ExportOption[];
  sessionOptions: ExportOption[];
};

export type ExportResult = {
  filename: string;
  mimeType: string;
  content: string;
};

function formatTimestamp(value: unknown): string {
  if (!value) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }

  const maybeToDate = value as { toDate?: () => Date };
  if (typeof maybeToDate.toDate === 'function') {
    return maybeToDate.toDate().toISOString();
  }

  const maybeSeconds = value as { seconds?: number };
  if (typeof maybeSeconds.seconds === 'number') {
    return new Date(maybeSeconds.seconds * 1000).toISOString();
  }

  return String(value);
}

function sanitizeAnswers(raw: Record<string, unknown> | undefined) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const out: Record<string, number | string[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      out[key] = value;
      continue;
    }
    if (Array.isArray(value)) {
      out[key] = value.map(String);
    }
  }
  return out;
}

function mapDocToRows(doc: ResponseSessionDoc): CsvExportRow[] {
  const responseSessionId =
    typeof doc.responseSessionId === 'string' ? doc.responseSessionId : '';
  const sessionId =
    typeof doc.sessionId === 'string' ? doc.sessionId : doc.sessionId ?? '';
  const questionnaireTitle =
    typeof doc.questionnaireTitle === 'string' ? doc.questionnaireTitle : '';
  const responseCreatedAt = formatTimestamp(doc.createdAt);
  const respondentAge =
    typeof doc.backgroundInfo?.age === 'number'
      ? String(doc.backgroundInfo.age)
      : '';
  const respondentGender =
    typeof doc.backgroundInfo?.gender === 'string' ? doc.backgroundInfo.gender : '';

  const evaluations = Array.isArray(doc.evaluations) ? doc.evaluations : [];
  return evaluations
    .map((evaluation) => {
      const sampleCode =
        typeof evaluation.sampleCode === 'string' ? evaluation.sampleCode : '';
      if (!sampleCode) {
        return null;
      }
      const samplePresentationIndex =
        typeof evaluation.samplePresentationIndex === 'number'
          ? String(evaluation.samplePresentationIndex)
          : '';
      const samplePresentationOrder = Array.isArray(evaluation.samplePresentationOrder)
        ? evaluation.samplePresentationOrder.map(String).join('|')
        : '';
      return {
        responseSessionId,
        sessionId: String(sessionId),
        questionnaireTitle,
        responseCreatedAt,
        respondentAge,
        respondentGender,
        sampleCode,
        samplePresentationIndex,
        samplePresentationOrder,
        evaluationCreatedAt: formatTimestamp(evaluation.createdAt),
        answers: sanitizeAnswers(evaluation.answers),
      } satisfies CsvExportRow;
    })
    .filter((row): row is CsvExportRow => Boolean(row));
}

function toExportOptions(counter: Map<string, number>): ExportOption[] {
  return Array.from(counter.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'fi'));
}

export async function getResultExportOptions(): Promise<ExportOptions> {
  const db = getFirestoreDb();
  const snapshot = await getDocs(
    query(collection(db, FIRESTORE_COLLECTIONS.responseSessions)),
  );

  const questionnaireCounter = new Map<string, number>();
  const sessionCounter = new Map<string, number>();

  snapshot.docs.forEach((doc) => {
    const data = doc.data() as ResponseSessionDoc;
    const questionnaireTitle =
      typeof data.questionnaireTitle === 'string' ? data.questionnaireTitle.trim() : '';
    if (questionnaireTitle) {
      questionnaireCounter.set(
        questionnaireTitle,
        (questionnaireCounter.get(questionnaireTitle) ?? 0) + 1,
      );
    }

    const sessionId = typeof data.sessionId === 'string' ? data.sessionId.trim() : '';
    if (sessionId) {
      sessionCounter.set(sessionId, (sessionCounter.get(sessionId) ?? 0) + 1);
    }
  });

  return {
    questionnaireOptions: toExportOptions(questionnaireCounter),
    sessionOptions: toExportOptions(sessionCounter),
  };
}

export async function exportResults(
  scope: ExportScope,
  value: string,
  format: ExportFormat,
): Promise<ExportResult> {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error('Valitse ensin vietävä kysely tai sessio.');
  }

  const field = scope === 'questionnaire' ? 'questionnaireTitle' : 'sessionId';
  const db = getFirestoreDb();
  const snapshot = await getDocs(
    query(
      collection(db, FIRESTORE_COLLECTIONS.responseSessions),
      where(field, '==', normalized),
    ),
  );

  const rows = snapshot.docs.flatMap((doc) =>
    mapDocToRows(doc.data() as ResponseSessionDoc),
  );
  if (rows.length === 0) {
    throw new Error('Valitulle kohteelle ei löytynyt vietäviä vastauksia.');
  }

  if (format === 'xls') {
    return {
      filename: `results-${scope}-${normalized}.xls`,
      mimeType: 'application/vnd.ms-excel',
      content: buildResponseCsvContent(rows, '\t'),
    };
  }

  return {
    filename: `results-${scope}-${normalized}.csv`,
    mimeType: 'text/csv',
    content: buildResponseCsvContent(rows, ';'),
  };
}
