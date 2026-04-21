export const ROUTES = {
  HOME: 'Home',
  STUDY: 'Study',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
