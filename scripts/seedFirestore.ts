/**
 * Kirjoittaa kehitysdatan Firestoreen mockData-lähteestä.
 * Käyttö: npm run seed [-- --dry-run]
 *
 * Turvallisuus: oletuksena vain “dev-tyyppiset” projectId:t tai
 * FIREBASE_SEED_ALLOW_PROJECT / FIREBASE_SEED_CONFIRM_PRODUCTION.
 */
import {readFileSync, existsSync} from 'fs';
import {join} from 'path';
import {
  FirebaseError,
  initializeApp,
  type FirebaseOptions,
  getApps,
  getApp,
} from 'firebase/app';
import {doc, getFirestore, setDoc, Timestamp} from 'firebase/firestore';

import {FIRESTORE_COLLECTIONS} from '../src/constants/firestore';
import {
  mockSamples,
  mockEvaluationExample,
  mockEvaluationPayloadExample,
} from '../src/data/mockData';

const SEED_SESSION_DOC_ID = 'seed-dev-session';
const SEED_EVAL_IDS = {
  fromMockEvaluation: 'seed-evaluation-mock-example',
  fromMockPayload: 'seed-evaluation-mock-payload',
} as const;

const CONFIRM_PRODUCTION = 'I_UNDERSTAND';

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
    messagingSenderId: envString(env, 'FIREBASE_MESSAGING_SENDER_ID') || undefined,
    appId: envString(env, 'FIREBASE_APP_ID') || undefined,
  };
  const mid = envString(env, 'FIREBASE_MEASUREMENT_ID');
  if (mid) {
    opts.measurementId = mid;
  }
  return opts;
}

function looksLikeDevProject(projectId: string): boolean {
  const p = projectId.toLowerCase();
  return (
    p.includes('-dev') ||
    p.includes('dev-') ||
    p.includes('_dev') ||
    p.includes('test') ||
    p.includes('demo') ||
    p.includes('sandbox') ||
    p.includes('staging') ||
    p.includes('local') ||
    p.endsWith('-dev') ||
    /** Esim. mob-project-amk (kurssi / repo-tyylinen nimi) */
    p.includes('-project-') ||
    /** AMK-opinnot / suomenkielinen kurssiprojekti */
    p.includes('amk')
  );
}

function assertSeedAllowed(
  projectId: string,
  env: Record<string, string>,
): void {
  const allowExact = envString(env, 'FIREBASE_SEED_ALLOW_PROJECT');
  if (allowExact && allowExact === projectId) {
    return;
  }
  if (looksLikeDevProject(projectId)) {
    return;
  }
  const confirm = envString(env, 'FIREBASE_SEED_CONFIRM_PRODUCTION');
  if (confirm === CONFIRM_PRODUCTION) {
    console.warn(
      'VAROITUS: FIREBASE_SEED_CONFIRM_PRODUCTION on asetettu — kirjoitetaan Firestoreen ilman dev-tunnistetta.',
    );
    return;
  }
  throw new Error(
    [
      `Seeding estetty: projectId "${projectId}" ei näytä kehitysprojektilta.`,
      'Vaihtoehdot:',
      `  • Käytä erillistä dev-Firebase-projektia, tai`,
      `  • Lisää .env: FIREBASE_SEED_ALLOW_PROJECT=${projectId}`,
      `  • TAI (vaarallinen tuotannossa) FIREBASE_SEED_CONFIRM_PRODUCTION=${CONFIRM_PRODUCTION}`,
    ].join('\n'),
  );
}

function averageScore(scores: Record<string, number>): number {
  const vals = Object.values(scores);
  if (vals.length === 0) {
    return 0;
  }
  const sum = vals.reduce((a, b) => a + b, 0);
  return Math.max(0, Math.min(10, Math.round(sum / vals.length)));
}

function codeForSampleId(sampleId: string): string {
  const row = mockSamples.find((s) => s.id === sampleId);
  if (!row) {
    throw new Error(`mockSamples ei sisällä id:tä "${sampleId}".`);
  }
  return row.code;
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
  const dryRun = argv.includes('--dry-run') || argv.includes('-n');

  const root = process.cwd();
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) {
    throw new Error(
      `Ei löydy ${envPath}. Kopioi .env.example → .env ja täytä Firebase-arvot.`,
    );
  }
  const fileEnv = loadEnvFile(envPath);
  const env: Record<string, string> = {...fileEnv};
  for (const [k, v] of Object.entries(process.env)) {
    if (typeof v === 'string' && v !== '') {
      env[k] = v;
    }
  }
  const options = firebaseOptionsFromEnv(env);
  const projectId = options.projectId as string;

  assertSeedAllowed(projectId, env);

  const samplesCodes = mockSamples.map((s) => s.code);
  const sessionPayload = {
    samples: samplesCodes,
    seedTag: 'mob-project-seed',
    seededAt: Timestamp.now(),
  };

  const evalA = {
    sampleCode: codeForSampleId(mockEvaluationExample.sampleId),
    rating: averageScore(mockEvaluationExample.scores),
    sessionId: SEED_SESSION_DOC_ID,
    createdAt: Timestamp.fromDate(new Date(mockEvaluationExample.timestamp)),
    seedTag: 'mob-project-seed',
  };

  const evalB = {
    sampleCode: codeForSampleId(mockEvaluationPayloadExample.sampleId),
    rating: averageScore(mockEvaluationPayloadExample.scores),
    sessionId: SEED_SESSION_DOC_ID,
    createdAt: Timestamp.now(),
    seedTag: 'mob-project-seed',
  };

  if (dryRun) {
    console.log('[dry-run] projectId:', projectId);
    console.log('[dry-run] sessions/', SEED_SESSION_DOC_ID, sessionPayload);
    console.log(
      '[dry-run] evaluations/',
      SEED_EVAL_IDS.fromMockEvaluation,
      evalA,
    );
    console.log(
      '[dry-run] evaluations/',
      SEED_EVAL_IDS.fromMockPayload,
      evalB,
    );
    console.log('[dry-run] Ei kirjoituksia Firestoreen.');
    return;
  }

  const app = getApps().length === 0 ? initializeApp(options) : getApp();
  const db = getFirestore(app);

  const sessionRef = doc(db, FIRESTORE_COLLECTIONS.sessions, SEED_SESSION_DOC_ID);
  await setDoc(sessionRef, sessionPayload, {merge: true});

  await setDoc(
    doc(db, FIRESTORE_COLLECTIONS.evaluations, SEED_EVAL_IDS.fromMockEvaluation),
    evalA,
    {merge: true},
  );
  await setDoc(
    doc(db, FIRESTORE_COLLECTIONS.evaluations, SEED_EVAL_IDS.fromMockPayload),
    evalB,
    {merge: true},
  );

  console.log('Seed valmis:', {
    projectId,
    session: SEED_SESSION_DOC_ID,
    evaluations: Object.values(SEED_EVAL_IDS),
  });
}

main().catch((err) => {
  console.error('Seed epäonnistui:', formatFirebaseError(err));
  if (err instanceof FirebaseError && err.code === 'permission-denied') {
    console.error(
      [
        '',
        '→ Firestore Rules estävät kirjoituksen (yleistä uudessa / "Production mode" -projektissa).',
        '  Firebase Console → Firestore Database → Rules: julkaise dev-säännöt, jotka sallivat',
        '  lukemisen ja kirjoituksen kokoelmiin `sessions` ja `evaluations` (esimerkki README:ssa,',
        '  kohta Firestore-seed). Älä jätä avointa if true -sääntöä tuotantoon.',
      ].join('\n'),
    );
  }
  process.exitCode = 1;
});
