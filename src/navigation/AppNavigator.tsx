import { createNativeStackNavigator } from '@react-navigation/native-stack';

const stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
    Home: undefined;
    Sample: undefined;
    Evaluation: Undefined;
    Result: undefined;
};