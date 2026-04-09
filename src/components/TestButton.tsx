import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
};

const TestButton = ({ title, onPress }: Props) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};

export default TestButton;
