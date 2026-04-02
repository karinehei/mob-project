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
  /** Primary actions / accents (study shell) */
  primary: '#5850EC',
  onPrimary: '#FFFFFF',
  appBar: '#1F2937',
  onAppBar: '#FFFFFF',
  sampleCardBg: '#EBF0FF',
  sampleAccent: '#3730A3',
  ratingSelectedBg: '#EEF2FF',
  ratingSelectedBorder: '#5850EC',
} as const;

export type ColorName = keyof typeof colors;
