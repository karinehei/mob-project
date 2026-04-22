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
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Sample'>;

/**
 * Välinäkymä ennen arviointia - sama rakenne ja visuaalinen kieli kuin etusivulla.
 */
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
            onPress={async () => await retryLoadSession()}
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
            onPress={async () => await retryLoadSession()}
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
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sampleCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.sampleCardBg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  sampleLabel: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.sampleAccent,
  },
  sampleCode: {
    marginTop: spacing.sm,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '700',
    color: colors.sampleAccent,
  },
  instruction: {
    marginTop: spacing.lg,
    ...typography.body,
    color: colors.textSecondary,
  },
  infoCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  infoTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoBody: {
    marginTop: spacing.sm,
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  cta: {
    borderRadius: 999,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.onPrimary,
    letterSpacing: 0.3,
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
