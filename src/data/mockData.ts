import type { Evaluation, EvaluationPayload } from '../types/evaluation';
import type { Sample } from '../types/sample';

/**
 * Esimerkkinäytteet kehitystä ja UI-luonnosta varten.
 * TODO: korvaa oikealla datalla (API / Firestore) kun integraatio tehdään.
 */
export const mockSamples: Sample[] = [
  {
    id: 'sample-451',
    code: '451',
    name: 'Sensorinen näyte — erä 12A',
    criteria: [
      {
        id: 'crit-451-color',
        label: 'Värin yhdenmukaisuus',
        minScore: 1,
        maxScore: 5,
      },
      {
        id: 'crit-451-aroma',
        label: 'Tuoksu',
        minScore: 1,
        maxScore: 5,
      },
      {
        id: 'crit-451-texture',
        label: 'Rakenne',
        minScore: 1,
        maxScore: 7,
      },
    ],
  },
  {
    id: 'sample-926',
    code: '926',
    name: 'Laatuvertailu — malli B',
    criteria: [
      {
        id: 'crit-926-overall',
        label: 'Kokonaisvaikutelma',
        minScore: 0,
        maxScore: 10,
      },
      {
        id: 'crit-926-aftertaste',
        label: 'Jälkimaku',
        minScore: 0,
        maxScore: 10,
      },
    ],
  },
  {
    id: 'sample-780',
    code: '780',
    name: 'Pikatesti — kontrolli',
    criteria: [
      {
        id: 'crit-780-accept',
        label: 'Hyväksyttävyys (kyllä/ei-asteikko numeroina)',
        minScore: 0,
        maxScore: 1,
      },
      {
        id: 'crit-780-notes',
        label: 'Havaintojen selkeys',
        minScore: 1,
        maxScore: 3,
      },
    ],
  },
];

/** Esimerkki tallennetusta arvioinnista (tyyppitarkistus / fixture). */
export const mockEvaluationExample: Evaluation = {
  sampleId: 'sample-451',
  timestamp: '2026-04-02T14:30:00.000Z',
  answers: {
    'crit-451-color': 4,
    'crit-451-aroma': 5,
    'crit-451-texture': 6,
  },
};

/** Esimerkki payloadista, joka voisi lähteä lomakkeesta tallennukseen. */
export const mockEvaluationPayloadExample: EvaluationPayload = {
  sampleId: 'sample-926',
  answers: {
    'crit-926-overall': 8,
    'crit-926-aftertaste': 7,
  },
};
