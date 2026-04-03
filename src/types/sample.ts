import type { EntityId } from './models';
import type { EvaluationCriterion } from './evaluation';

/**
 * Arvioitava näyte ja siihen liittyvät kriteerit.
 * TODO: laajenna kentillä (kuva, erä, päivämäärä) kun tuotevaatimukset tarkentuvat.
 */
export interface Sample {
  id: EntityId;
  code: string;
  name: string;
  criteria: EvaluationCriterion[];
}
