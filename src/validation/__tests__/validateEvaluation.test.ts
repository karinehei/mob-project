import { validateEvaluation } from '../validateEvaluation';

import {
  EvaluationCriterion,
  EvaluationPayload,
} from '../../types/evaluation';

describe('validateEvaluation', () => {
  const criteria: EvaluationCriterion[] = [
    {
      id: 'taste',
      label: 'Maku',
      minScore: 1,
      maxScore: 5,
    },
    {
      id: 'texture',
      label: 'Rakenne',
      minScore: 1,
      maxScore: 5,
    },
  ];

  const validPayload: EvaluationPayload = {
    sampleId: 'sample-1',
    scores: {
      taste: 4,
      texture: 5,
    },
  };

  // VALID CASE
  it('palauttaa tyhjän listan validilla datalla', () => {
    const result = validateEvaluation(validPayload, criteria);

    expect(result).toEqual([]);
  });

  // sampleId
  it('antaa virheen jos sampleId puuttuu', () => {
    const payload = {
      ...validPayload,
      sampleId: '',
    };

    const result = validateEvaluation(payload, criteria);

    expect(result).toContainEqual({
      field: 'sampleId',
      message: 'Sample puuttuu',
    });
  });

  // scores object puuttuu
  it('antaa virheen jos scores puuttuu', () => {
    const payload = {
      sampleId: 'sample-1',
      scores: undefined,
    } as any;

    const result = validateEvaluation(payload, criteria);

    expect(result).toContainEqual({
      field: 'scores',
      message: 'Pisteet puuttuvat',
    });
  });

  // score puuttuu kriteeriltä
  it('antaa virheen jos yksittäinen score puuttuu', () => {
    const payload: EvaluationPayload = {
      sampleId: 'sample-1',
      scores: {
        taste: 4,
        // texture puuttuu
      } as any,
    };

    const result = validateEvaluation(payload, criteria);

    expect(result).toContainEqual({
      field: 'scores.texture',
      message: 'Rakenne puuttuu',
    });
  });

  // ei numero
  it('antaa virheen jos score ei ole numero', () => {
    const payload: EvaluationPayload = {
      sampleId: 'sample-1',
      scores: {
        taste: 'bad' as any,
        texture: 3,
      },
    };

    const result = validateEvaluation(payload, criteria);

    expect(result).toContainEqual({
      field: 'scores.taste',
      message: 'Maku ei ole numero',
    });
  });

  // NaN
  it('antaa virheen jos score on NaN', () => {
    const payload: EvaluationPayload = {
      sampleId: 'sample-1',
      scores: {
        taste: NaN,
        texture: 3,
      },
    };

    const result = validateEvaluation(payload, criteria);

    expect(result).toContainEqual({
      field: 'scores.taste',
      message: 'Maku ei ole numero',
    });
  });

  // alle min
  it('antaa virheen jos score on liian pieni', () => {
    const payload: EvaluationPayload = {
      sampleId: 'sample-1',
      scores: {
        taste: 0,
        texture: 3,
      },
    };

    const result = validateEvaluation(payload, criteria);

    expect(result).toContainEqual({
      field: 'scores.taste',
      message: 'Maku oltava välillä 1-5',
    });
  });

  // yli max
  it('antaa virheen jos score on liian suuri', () => {
    const payload: EvaluationPayload = {
      sampleId: 'sample-1',
      scores: {
        taste: 6,
        texture: 3,
      },
    };

    const result = validateEvaluation(payload, criteria);

    expect(result).toContainEqual({
      field: 'scores.taste',
      message: 'Maku oltava välillä 1-5',
    });
  });
});
