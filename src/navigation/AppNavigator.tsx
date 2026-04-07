import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import React from 'react';

import HomeScreen from '../screens/HomeScreen';
import EvaluationScreen from '../screens/EvaluationScreen';
import ResultScreen from '../screens/ResultScreen';
import SampleScreen from '../screens/SampleScreen';

export type RootStackParamList = {
  Home: undefined;
  Sample: undefined;
  Evaluation: undefined;
  Result: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Sample" component={SampleScreen} />
        <Stack.Screen name="Evaluation" component={EvaluationScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
