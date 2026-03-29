import React from 'react';
import { StatusBar } from 'react-native';

import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';

/**
 * Application root. Wires status bar and navigation shell only; no business logic here.
 */
function App(): React.JSX.Element {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <RootNavigator />
    </>
  );
}

export default App;
