/**
 * Semantic color tokens. Tune with final brand / design system.
 */
export const colors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceMuted: '#F3F4F6',
  textPrimary: '#111111',
  textSecondary: '#666666',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  /** Primary actions / accents (study shell, Figma-aligned) */
  primary: '#5D5CFF',
  onPrimary: '#FFFFFF',
  appBar: '#1A2332',
  onAppBar: '#FFFFFF',
  sampleCardBg: '#E8EDFF',
  sampleAccent: '#1E3A5F',
  ratingSelectedBg: '#EEF2FF',
  ratingSelectedBorder: '#5D5CFF',
} as const;

export type ColorName = keyof typeof colors;
