import { buildResponseCsvContent } from '../responseCsv';

describe('buildResponseCsvContent', () => {
  it('builds spreadsheet-friendly CSV with dynamic question columns', () => {
    const csv = buildResponseCsvContent([
      {
        responseSessionId: 'resp-1',
        sessionId: 'sess-1',
        questionnaireTitle: 'Jogurttitesti',
        responseCreatedAt: '2026-04-22T10:00:00.000Z',
        respondentAge: '34',
        respondentGender: 'Nainen',
        sampleCode: '451',
        samplePresentationIndex: '0',
        samplePresentationOrder: '451|926',
        evaluationCreatedAt: '2026-04-22T09:58:00.000Z',
        answers: {
          appearance: 8,
          attributes: ['makea', 'hapan'],
        },
      },
    ]);

    const lines = csv.split('\n');
    expect(lines[0]).toBe(
      'responseSessionId;sessionId;questionnaireTitle;responseCreatedAt;respondentAge;respondentGender;sampleCode;samplePresentationIndex;samplePresentationOrder;evaluationCreatedAt;q_appearance;q_attributes',
    );
    expect(lines[1]).toBe(
      'resp-1;sess-1;Jogurttitesti;2026-04-22T10:00:00.000Z;34;Nainen;451;0;451|926;2026-04-22T09:58:00.000Z;8;makea|hapan',
    );
  });

  it('escapes quoted and delimited values correctly', () => {
    const csv = buildResponseCsvContent([
      {
        responseSessionId: 'resp-1',
        sessionId: 'sess-1',
        questionnaireTitle: 'Testi; "A"',
        responseCreatedAt: '',
        respondentAge: '',
        respondentGender: '',
        sampleCode: '451',
        samplePresentationIndex: '0',
        samplePresentationOrder: '451|926',
        evaluationCreatedAt: '',
        answers: {
          notes: ['hyvä;pehmeä', 'tuore'],
        },
      },
    ]);

    const [, row] = csv.split('\n');
    expect(row).toContain('"Testi; ""A"""');
    expect(row).toContain('"hyvä;pehmeä|tuore"');
  });
});
