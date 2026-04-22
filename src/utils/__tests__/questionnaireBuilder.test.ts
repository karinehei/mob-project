import {
  buildQuestionnaireDraftFromManualInput,
  parseQuestionnaireImport,
  parseTokenList,
} from '../questionnaireBuilder';

describe('questionnaireBuilder', () => {
  describe('parseTokenList', () => {
    it('splits comma and newline separated values', () => {
      expect(parseTokenList('451, 926\n780')).toEqual(['451', '926', '780']);
    });
  });

  describe('buildQuestionnaireDraftFromManualInput', () => {
    it('builds a manual questionnaire draft', () => {
      const result = buildQuestionnaireDraftFromManualInput({
        title: 'Jogurttitesti',
        samplesText: '451, 926',
        scaleQuestionsText: 'Ulkonäkö\nMaku',
        cataQuestionLabel: 'Mitkä ominaisuudet tunnistit?',
        cataOptionsText: 'makea, hapan',
      });

      expect(result.title).toBe('Jogurttitesti');
      expect(result.samples).toEqual(['451', '926']);
      expect(result.questions).toEqual([
        {
          id: 'scale-1',
          label: 'Ulkonäkö',
          type: 'scale',
          minScore: 0,
          maxScore: 10,
        },
        {
          id: 'scale-2',
          label: 'Maku',
          type: 'scale',
          minScore: 0,
          maxScore: 10,
        },
        {
          id: 'multi-select-1',
          label: 'Mitkä ominaisuudet tunnistit?',
          type: 'multiSelect',
          options: ['makea', 'hapan'],
        },
      ]);
    });

    it('rejects empty sample list', () => {
      expect(() =>
        buildQuestionnaireDraftFromManualInput({
          title: 'Jogurttitesti',
          samplesText: '',
          scaleQuestionsText: 'Ulkonäkö',
          cataQuestionLabel: '',
          cataOptionsText: '',
        }),
      ).toThrow('näytekoodi');
    });
  });

  describe('parseQuestionnaireImport', () => {
    it('parses imported JSON questionnaire', () => {
      const result = parseQuestionnaireImport(`{
        "title": "Tuotu kysely",
        "samples": ["111", "222"],
        "questions": [
          { "label": "Tuoksu", "type": "scale", "minScore": 0, "maxScore": 10 },
          { "label": "Havaitut ominaisuudet", "type": "multiSelect", "options": ["pehmeä", "raikas"] }
        ]
      }`);

      expect(result).toEqual({
        title: 'Tuotu kysely',
        samples: ['111', '222'],
        questions: [
          {
            id: 'scale-1',
            label: 'Tuoksu',
            type: 'scale',
            minScore: 0,
            maxScore: 10,
          },
          {
            id: 'multi-select-2',
            label: 'Havaitut ominaisuudet',
            type: 'multiSelect',
            options: ['pehmeä', 'raikas'],
          },
        ],
        isActive: true,
      });
    });

    it('rejects invalid json', () => {
      expect(() => parseQuestionnaireImport('{bad json')).toThrow('JSON');
    });
  });
});
