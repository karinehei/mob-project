import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { PlaceholderBlock } from '../components/PlaceholderBlock';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

/**
 * Placeholder for the study / task flow screen. Wire into navigator when flows exist.
 */
export function StudyScreen(): React.JSX.Element {
  return (
    <ScreenContainer testID="screen-study">
      <Text style={styles.title}>Study</Text>
      <PlaceholderBlock
        title="Opiskelunäkymä"
        body="TODO: pisteytys ja tehtävät — ei vielä toteutettu."
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    color: colors.textPrimary,
    padding: spacing.md,
  },
});
