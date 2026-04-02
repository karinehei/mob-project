import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = TouchableOpacityProps & {
  title: string;
};

/**
 * Reusable button component for the application.
 */
export function Button({ title, style, ...rest }: Props): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      activeOpacity={0.8}
      {...rest}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.background || '#4F46E5',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
  },
  text: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.textSecondary || '#FFFFFF',
  },
});
