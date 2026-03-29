/**
 * Semantic color tokens. Placeholder values — replace when visual design is defined.
 */
export const colors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  textPrimary: '#111111',
  textSecondary: '#666666',
  border: '#E0E0E0',
} as const;

export type ColorName = keyof typeof colors;
