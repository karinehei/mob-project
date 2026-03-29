import React, { type PropsWithChildren } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { colors } from '../theme/colors';

type Props = PropsWithChildren<{
  /** TODO: support edges / variant when requirements are clear */
  testID?: string;
}>;

/**
 * Consistent safe-area wrapper for screens. Minimal styling on purpose.
 */
export function ScreenContainer({ children, testID }: Props): React.JSX.Element {
  return (
    <SafeAreaView style={styles.root} testID={testID}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
