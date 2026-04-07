import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Evaluation'>;

export default function EvaluationScreen({ navigation }: Props) {
  return (
    <View>
      <Text>Evaluation Screen</Text>
      <Button
        title="Go to Result"
        onPress={() => navigation.navigate('Result')}
      />
    </View>
  );
}