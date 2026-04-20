import { buildEvaluationPayload } from '../buildEvaluationPayload';

describe('buildEvaluationPayload', () => {
  it('returns correct payload shape', () => {
    const sampleId = 'sample-1';
    const scores = {
      a: 1,
      b: 2,
    };

    const result = buildEvaluationPayload(sampleId, scores);

    expect(result).toEqual({
      sampleId,
      scores,
    });
  });

  it('preserves original references (no cloning)', () => {
    const sampleId = 'sample-1';
    const scores = { a: 5 };

    const result = buildEvaluationPayload(sampleId, scores);

    expect(result.sampleId).toBe(sampleId);
    expect(result.scores).toBe(scores);
  });

  it('works with empty scores object', () => {
    const result = buildEvaluationPayload('id', {});

    expect(result).toEqual({
      sampleId: 'id',
      scores: {},
    });
  });

  it('does not mutate input scores object', () => {
    const scores = { a: 1 };

    buildEvaluationPayload('id', scores);

    expect(scores).toEqual({ a: 1 });
  });

  it('contains only expected keys', () => {
    const result = buildEvaluationPayload('id', { a: 1 });

    expect(Object.keys(result)).toEqual(['sampleId', 'scores']);
  });
});
