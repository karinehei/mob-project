import { buildEvaluationPayload } from '../buildEvaluationPayload';

describe('buildEvaluationPayload', () => {
  it('returns correct payload shape', () => {
    const sampleId = 'sample-1';
    const answers = {
      a: 1,
      b: ['x'],
    };

    const result = buildEvaluationPayload(sampleId, answers);

    expect(result).toEqual({
      sampleId,
      answers,
    });
  });

  it('preserves original references (no cloning)', () => {
    const sampleId = 'sample-1';
    const answers = { a: 5 };

    const result = buildEvaluationPayload(sampleId, answers);

    expect(result.sampleId).toBe(sampleId);
    expect(result.answers).toBe(answers);
  });

  it('works with empty answers object', () => {
    const result = buildEvaluationPayload('id', {});

    expect(result).toEqual({
      sampleId: 'id',
      answers: {},
    });
  });

  it('does not mutate input answers object', () => {
    const answers = { a: 1 };

    buildEvaluationPayload('id', answers);

    expect(answers).toEqual({ a: 1 });
  });

  it('contains only expected keys', () => {
    const result = buildEvaluationPayload('id', { a: 1 });

    expect(Object.keys(result)).toEqual(['sampleId', 'answers']);
  });
});
