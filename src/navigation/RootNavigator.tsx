import React from 'react';

import { HomeScreen } from '../screens/HomeScreen';

/**
 * Top-level navigation shell. Currently mounts a single screen — swap for a real navigator later.
 */
export function RootNavigator(): React.JSX.Element {
  // TODO: integrate Stack / Tab navigator when dependency is added
  return <HomeScreen />;
}
