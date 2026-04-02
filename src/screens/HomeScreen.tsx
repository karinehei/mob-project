import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PlaceholderBlock } from '../components/PlaceholderBlock';
import { ScreenContainer } from '../components/ScreenContainer';
import { usePlaceholder } from '../hooks/usePlaceholder';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

/**
 * Entry screen shell. No study flow or scoring — structure only.
 */
export function HomeScreen(): React.JSX.Element {
  const { label } = usePlaceholder();

  return (
    <ScreenContainer testID="screen-home">
      <View style={styles.content}>
        <Text style={styles.heading}>Food_Study</Text>
        <Text style={styles.sub}>{label}</Text>
        <PlaceholderBlock
          title="Sisältö tulossa"
          body="TODO: korvaa varsinaisella etusivun sisällöllä."
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: spacing.md,
  },
  heading: {
    ...typography.title,
    color: colors.textPrimary,
  },
  sub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
