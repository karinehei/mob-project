import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenContainer } from '../components/ScreenContainer';
import { StudyAppBar } from '../components/StudyAppBar';
import { useSampleContext } from '../context/SampleContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors, shadows } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Sample'>;

export default function SampleScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { currentSample, isLoading, error, retryLoadSession } =
    useSampleContext();

  if (isLoading) {
    return (
      <ScreenContainer testID="screen-sample">
        <StudyAppBar />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.infoText}>{t('sample_screen.loading')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer testID="screen-sample">
        <StudyAppBar />
        <View style={styles.centerContainer}>
          <Text style={styles.infoText}>{error}</Text>
          <Pressable
            onPress={async () => {
              await retryLoadSession();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('common.try_again')}
          >
            <Text style={styles.retryButtonLabel}>{t('common.try_again')}</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  if (!currentSample) {
    return (
      <ScreenContainer testID="screen-sample">
        <StudyAppBar />
        <View style={styles.centerContainer}>
          <Text style={styles.infoText}>{t('sample_screen.no_active')}</Text>
          <Pressable
            onPress={async () => {
              await retryLoadSession();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('sample_screen.refresh_view')}
          >
            <Text style={styles.retryButtonLabel}>{t('common.refresh')}</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer testID="screen-sample">
      <View style={styles.root}>
        <StudyAppBar />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>{t('sample_screen.title')}</Text>

          <View style={styles.sampleCard}>
            <Text style={styles.sampleLabel}>
              {t('sample_screen.current_code')}
            </Text>
            <Text style={styles.sampleCode}>{currentSample}</Text>
          </View>

          <Text style={styles.instruction}>
            {t('sample_screen.instruction')}
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              {t('sample_screen.next_title')}
            </Text>
            <Text style={styles.infoBody}>{t('sample_screen.next_body')}</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={() => navigation.navigate('Evaluation')}
            accessibilityRole="button"
            accessibilityLabel={t('sample_screen.go_to_eval')}
          >
            <Text style={styles.ctaLabel}>{t('sample_screen.go_to_eval')}</Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  pageTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  sampleCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
    ...shadows.card,
  },
  sampleLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  sampleCode: {
    marginTop: spacing.sm,
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '700',
    letterSpacing: -1,
    color: colors.textPrimary,
  },
  instruction: {
    marginTop: spacing.xl,
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  infoCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  infoTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  infoBody: {
    marginTop: spacing.sm,
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  cta: {
    borderRadius: 999,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaLabel: {
    ...typography.button,
    color: colors.onPrimary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  infoText: {
    marginTop: spacing.md,
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.md,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
  },
  retryButtonPressed: {
    opacity: 0.9,
  },
  retryButtonLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.onPrimary,
  },
});
