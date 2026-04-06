import { View, Text, Button } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Sample'>;

export default function SampleScreen({ navigation }: Props) {
  return (
    <View>
      <Text>Sample Screen</Text>
      <Button
        title="Go to Evaluation"
        onPress={() => navigation.navigate('Evaluation')}
      />
    </View>
  );
}