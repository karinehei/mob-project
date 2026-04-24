import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  button: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
};
