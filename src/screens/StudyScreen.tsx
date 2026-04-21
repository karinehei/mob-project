import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import HomeScreen from './HomeScreen';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Study'>;

/**
 * Erillinen Study-reitti pidetään navigaatiossa tuotevaatimusten vuoksi.
 * Toistaiseksi se käyttää tarkoituksella samaa tuotantovalmiin UI:n flowita kuin Home.
 */
export default function StudyScreen(props: Props): React.JSX.Element {
  return <HomeScreen {...props} />;
}
