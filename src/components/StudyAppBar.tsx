import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

function MenuIcon(): React.JSX.Element {
  return (
    <View style={styles.menuIcon} accessibilityElementsHidden>
      <View style={styles.menuBar} />
      <View style={styles.menuBar} />
      <View style={styles.menuBar} />
    </View>
  );
}

/**
 * Tummansininen yläpalkki — sama ulkoasu kaikilla tutkimus-/arviointinäkymillä.
 */
export function StudyAppBar(): React.JSX.Element {
  return (
    <View style={styles.appBar}>
      <Pressable
        style={styles.appBarIconHit}
        onPress={() => {}}
        accessibilityRole="button"
        accessibilityLabel="Valikko"
      >
        <MenuIcon />
      </Pressable>
      <Text style={styles.appBarTitle} numberOfLines={1}>
        Food_Study
      </Text>
      <View style={styles.appBarSpacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.appBar,
  },
  appBarIconHit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    justifyContent: 'space-between',
    height: 14,
    width: 20,
  },
  menuBar: {
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.onAppBar,
  },
  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    ...typography.body,
    fontWeight: '700',
    color: colors.onAppBar,
  },
  appBarSpacer: {
    width: 44,
  },
});
