export const ROUTES = {
  HOME: 'Home',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
