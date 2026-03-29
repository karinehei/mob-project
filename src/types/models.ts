/**
 * Domain-shaped types — stubs only until persistence and rules exist.
 */

export type EntityId = string;

/** TODO: align with real study session model */
export interface StudySessionPlaceholder {
  id: EntityId;
}

/** TODO: align with food / evaluation domain */
export interface FoodItemPlaceholder {
  id: EntityId;
  label: string;
}
