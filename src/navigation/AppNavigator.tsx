import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import StudyScreen from '../screens/StudyScreen';
import SampleScreen from '../screens/SampleScreen';
import EvaluationScreen from '../screens/EvaluationScreen';
import ResultScreen from '../screens/ResultScreen';
import AdminScreen from '../screens/AdminScreen';
import BackgroundInfoScreen from '../screens/BackgroundInfoScreen';

export type RootStackParamList = {
  Home: undefined;
  Study: undefined;
  Sample: undefined;
  Evaluation: undefined;
  BackgroundInfo: undefined;
  Admin: undefined;
  Result:
    | {
        saveSucceeded?: boolean;
        flowCompleted?: boolean;
      }
    | undefined;
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
          name="Study"
          component={StudyScreen}
          options={{ title: 'Aistinvarainen arviointi' }}
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
          name="BackgroundInfo"
          component={BackgroundInfoScreen}
          options={{ title: 'Taustatiedot' }}
        />
        <Stack.Screen
          name="Admin"
          component={AdminScreen}
          options={{ title: 'Kyselyn hallinta' }}
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

