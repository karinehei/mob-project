import '../locales';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerBackVisible: false }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: t('navigation.home') }}
        />
        <Stack.Screen
          name="Study"
          component={StudyScreen}
          options={{ title: t('navigation.study') }}
        />
        <Stack.Screen
          name="Sample"
          component={SampleScreen}
          options={{ title: t('navigation.sample') }}
        />
        <Stack.Screen
          name="Evaluation"
          component={EvaluationScreen}
          options={{ title: t('navigation.evaluation') }}
        />
        <Stack.Screen
          name="BackgroundInfo"
          component={BackgroundInfoScreen}
          options={{ title: t('navigation.background_info') }}
        />
        <Stack.Screen
          name="Admin"
          component={AdminScreen}
          options={{ title: t('navigation.admin') }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: t('navigation.result') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
