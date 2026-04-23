/**
 * Semantic color tokens for Enhanced Cream Harmony.
 */
export const colors = {
  // Backgrounds
  background: '#FAF3E0',
  surface: '#FFFFFF',
  surfaceMuted: '#F4EFE6',

  // Text & Interactions
  primary: '#1C2520',
  onPrimary: '#FFFFFF',
  textPrimary: '#1C2520',
  textSecondary: '#3A4540',
  textMuted: '#6B7280',

  // Borders
  border: '#DED9CE',
  borderMuted: '#D3DCD8',

  // Custom Overrides
  appBar: '#F4EFE6',
  onAppBar: '#1C2520',
  sampleCardBg: '#FFFFFF',
  sampleAccent: '#1C2520',
  ratingSelectedBg: '#1C2520',
  ratingSelectedBorder: '#1C2520',

  // Status
  success: '#10B981',
  error: '#EF4444',
} as const;

export type ColorName = keyof typeof colors;

export const shadows = {
  card: {
    shadowColor: '#1C2520',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  button: {
    shadowColor: '#1C2520',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
};
