import { ROUTES } from '../constants/routes';

/**
 * Param lists for future navigators. Extend when screens need typed params.
 */
export type RootStackParamList = {
  [ROUTES.HOME]: undefined;
  [ROUTES.STUDY]: undefined;
  // TODO: add params per screen
};
