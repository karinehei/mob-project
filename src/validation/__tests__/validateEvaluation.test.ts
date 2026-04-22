import { validateEvaluation } from '../validateEvaluation';

import {
  EvaluationPayload,
} from '../../types/evaluation';
import { QuestionnaireQuestion } from '../../types/questionnaire';

describe('validateEvaluation', () => {
  const questions: QuestionnaireQuestion[] = [
    {
      id: 'taste',
      label: 'Maku',
      type: 'scale',
      minScore: 1,
      maxScore: 5,
    },
    {
      id: 'attributes',
      label: 'Ominaisuudet',
      type: 'multiSelect',
      options: ['makea', 'hapan'],
    },
  ];

  const validPayload: EvaluationPayload = {
    sampleId: 'sample-1',
    answers: {
      taste: 4,
      attributes: ['makea'],
    },
  };

  // VALID CASE
  it('palauttaa tyhjän listan validilla datalla', () => {
    const result = validateEvaluation(validPayload, questions);

    expect(result).toEqual([]);
  });

  // sampleId
  it('antaa virheen jos sampleId puuttuu', () => {
    const payload = {
      ...validPayload,
      sampleId: '',
    };

    const result = validateEvaluation(payload, questions);

    expect(result).toContainEqual({
      field: 'sampleId',
      message: 'Sample puuttuu',
    });
  });

  // scores object puuttuu
  it('antaa virheen jos scores puuttuu', () => {
    const payload = {
      sampleId: 'sample-1',
      answers: undefined,
    } as any;

    const result = validateEvaluation(payload, questions);

    expect(result).toContainEqual({
      field: 'answers',
      message: 'Vastaukset puuttuvat',
    });
  });

  // puuttuva monivalinta
  it('antaa virheen jos yksittäinen score puuttuu', () => {
    const payload: EvaluationPayload = {
      sampleId: 'sample-1',
      answers: {
        taste: 4,
        // attributes puuttuu
      } as any,
    };

    const result = validateEvaluation(payload, questions);

    expect(result).toContainEqual({
      field: 'answers.attributes',
      message: 'Ominaisuudet puuttuu',
    });
  });

  // ei numero
  it('antaa virheen jos score ei ole numero', () => {
    const payload: EvaluationPayload = {
      sampleId: 'sample-1',
      answers: {
        taste: 'bad' as any,
        attributes: ['makea'],
      },
    };

    const result = validateEvaluation(payload, questions);

    expect(result).toContainEqual({
      field: 'answers.taste',
      message: 'Maku ei ole numero',
    });
  });

  // NaN
  it('antaa virheen jos score on NaN', () => {
    const payload: EvaluationPayload = {
      sampleId: 'sample-1',
      answers: {
        taste: NaN,
        attributes: ['makea'],
      },
    };

    const result = validateEvaluation(payload, questions);

    expect(result).toContainEqual({
      field: 'answers.taste',
      message: 'Maku ei ole numero',
    });
  });

  // alle min
  it('antaa virheen jos score on liian pieni', () => {
    const payload: EvaluationPayload = {
      sampleId: 'sample-1',
      answers: {
        taste: 0,
        attributes: ['makea'],
      },
    };

    const result = validateEvaluation(payload, questions);

    expect(result).toContainEqual({
      field: 'answers.taste',
      message: 'Maku oltava välillä 1-5',
    });
  });

  // yli max
  it('antaa virheen jos score on liian suuri', () => {
    const payload: EvaluationPayload = {
      sampleId: 'sample-1',
      answers: {
        taste: 6,
        attributes: ['makea'],
      },
    };

    const result = validateEvaluation(payload, questions);

    expect(result).toContainEqual({
      field: 'answers.taste',
      message: 'Maku oltava välillä 1-5',
    });
  });

  it('antaa virheen jos monivalinta ei ole lista', () => {
    const payload: EvaluationPayload = {
      sampleId: 'sample-1',
      answers: {
        taste: 4,
        attributes: 'makea' as any,
      },
    };

    const result = validateEvaluation(payload, questions);

    expect(result).toContainEqual({
      field: 'answers.attributes',
      message: 'Ominaisuudet ei ole valintalista',
    });
  });

  it('antaa virheen jos monivalinnassa on tuntematon vaihtoehto', () => {
    const payload: EvaluationPayload = {
      sampleId: 'sample-1',
      answers: {
        taste: 4,
        attributes: ['karvas'],
      },
    };

    const result = validateEvaluation(payload, questions);

    expect(result).toContainEqual({
      field: 'answers.attributes',
      message: 'Ominaisuudet sisältää tuntemattoman vaihtoehdon',
    });
  });
});
