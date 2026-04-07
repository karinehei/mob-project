import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import SampleScreen from '../screens/SampleScreen';
import EvaluationScreen from '../screens/EvaluationScreen';
import ResultScreen from '../screens/ResultScreen';

export type RootStackParamList = {
  Home: undefined;
  Sample: undefined;
  Evaluation: undefined;
  Result: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Etusivu' }}
        />
        <Stack.Screen
          name="Sample"
          component={SampleScreen}
          options={{ title: 'Näyte' }}
        />
        <Stack.Screen
          name="Evaluation"
          component={EvaluationScreen}
          options={{ title: 'Arviointi' }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: 'Tulos' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

