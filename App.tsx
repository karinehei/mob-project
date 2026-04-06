import React from 'react';
import { SampleProvider } from './src/context/SampleContext';
import { StatusBar } from 'react-native';

import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';

import { NavigationContainer } from '@react-navigation/native';

import { AppNavigator } from './src/navigation/AppNavigator'

/**
 * Application root. Wires status bar and navigation shell only; no business logic here.
 */
function App(): React.JSX.Element {
  return (
    <SampleProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <AppNavigator />
    </SampleProvider>
  );
}

export default App;
