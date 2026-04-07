import React from 'react';

import { AppNavigator } from './AppNavigator';

/**
 * Top-level navigation shell — delegates to stack in AppNavigator.
 */
export function RootNavigator(): React.JSX.Element {
  return <AppNavigator />;
}
