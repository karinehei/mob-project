/**
 * Route / screen name constants. Use when navigation is implemented.
 */
export const ROUTES = {
  HOME: 'Home',
  STUDY: 'Study',
  // TODO: add routes as screens are added
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];
