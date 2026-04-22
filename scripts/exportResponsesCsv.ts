/**
 * Vie responseSessions-datan CSV-muotoon.
 * Käyttö:
 *   npm run export:csv
 *   npm run export:csv -- --out exports/vastaukset.csv
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import {
  FirebaseError,
  getApp,
  getApps,
  initializeApp,
  type FirebaseOptions,
} from 'firebase/app';
import { collection, getDocs, getFirestore, query } from 'firebase/firestore';

import { FIRESTORE_COLLECTIONS } from '../src/constants/firestore';
import {
  buildResponseCsvContent,
  type CsvExportRow,
} from '../src/utils/responseCsv';

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

function loadEnvFile(envPath: string): Record<string, string> {
  const text = readFileSync(envPath, 'utf8');
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) {
      continue;
    }
    const eq = t.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function envString(env: Record<string, string>, key: string): string {
  return typeof env[key] === 'string' ? env[key].trim() : '';
}

function firebaseOptionsFromEnv(env: Record<string, string>): FirebaseOptions {
  const apiKey = envString(env, 'FIREBASE_API_KEY');
  const projectId = envString(env, 'FIREBASE_PROJECT_ID');
  if (!apiKey || !projectId) {
    throw new Error(
      'Puuttuvat FIREBASE_API_KEY tai FIREBASE_PROJECT_ID (.env juuresta).',
    );
  }
  const opts: FirebaseOptions = {
    apiKey,
    projectId,
    authDomain: envString(env, 'FIREBASE_AUTH_DOMAIN') || undefined,
    storageBucket: envString(env, 'FIREBASE_STORAGE_BUCKET') || undefined,
    messagingSenderId:
      envString(env, 'FIREBASE_MESSAGING_SENDER_ID') || undefined,
    appId: envString(env, 'FIREBASE_APP_ID') || undefined,
  };
  const mid = envString(env, 'FIREBASE_MEASUREMENT_ID');
  if (mid) {
    opts.measurementId = mid;
  }
  return opts;
}

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

function parseOutPath(args: string[]): string {
  const outFlagIndex = args.findIndex((arg) => arg === '--out');
  if (outFlagIndex >= 0 && args[outFlagIndex + 1]) {
    return args[outFlagIndex + 1];
  }
  const timestamp = new Date().toISOString().replaceAll(':', '-');
  return join('exports', `responses-${timestamp}.csv`);
}

function formatFirebaseError(err: unknown): string {
  if (err instanceof FirebaseError) {
    return `${err.code}: ${err.message}`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return String(err);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const outPath = parseOutPath(argv);

  const root = process.cwd();
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) {
    throw new Error(
      `Ei löydy ${envPath}. Kopioi .env.example -> .env ja täytä Firebase-arvot.`,
    );
  }

  const fileEnv = loadEnvFile(envPath);
  const env: Record<string, string> = { ...fileEnv };
  for (const [k, v] of Object.entries(process.env)) {
    if (typeof v === 'string' && v !== '') {
      env[k] = v;
    }
  }

  const options = firebaseOptionsFromEnv(env);
  const app = getApps().length === 0 ? initializeApp(options) : getApp();
  const db = getFirestore(app);

  const snapshot = await getDocs(
    query(collection(db, FIRESTORE_COLLECTIONS.responseSessions)),
  );
  const rows = snapshot.docs.flatMap((doc) =>
    mapDocToRows(doc.data() as ResponseSessionDoc),
  );

  if (rows.length === 0) {
    throw new Error(
      'responseSessions-kokoelmasta ei löytynyt vietäviä rivejä. Tallenna ensin vastauksia.',
    );
  }

  const csv = buildResponseCsvContent(rows, ';');
  const outputDir = dirname(outPath);
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outPath, `\uFEFF${csv}`, 'utf8');

  console.log(
    `CSV-vienti valmis: ${outPath} (${rows.length} riviä, ${snapshot.size} vastaussessiota)`,
  );
}

main().catch((error) => {
  console.error('CSV-vienti epäonnistui:', formatFirebaseError(error));
  process.exitCode = 1;
});
