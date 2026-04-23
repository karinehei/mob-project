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

import { ScreenContainer } from '../components/ScreenContainer';
import { StudyAppBar } from '../components/StudyAppBar';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useSampleContext } from '../context/SampleContext';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Home' | 'Study'>;

export default function HomeScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();

  const {
    currentSample,
    isLoading,
    error,
    retryLoadSession,
    questionnaireTitle,
    questionnaireQuestions,
    samples,
    updateStatusMessage,
  } = useSampleContext();

  // loading state
  if (isLoading) {
    return (
      <ScreenContainer testID="screen-home">
        <StudyAppBar />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.infoText}>{t('common.loading_session')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  // error state
  if (error) {
    return (
      <ScreenContainer testID="screen-home">
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
          <Pressable
            onPress={() => navigation.navigate('Admin')}
            style={({ pressed }) => [
              styles.ghostButton,
              pressed && styles.ghostButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('home.open_admin')}
          >
            <Text style={styles.ghostButtonLabel}>{t('home.open_admin')}</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  // empty state
  if (!currentSample) {
    return (
      <ScreenContainer testID="screen-home">
        <StudyAppBar />
        <View style={styles.centerContainer}>
          <Text style={styles.infoText}>{t('home.no_samples')}</Text>
          <Pressable
            onPress={async () => {
              await retryLoadSession();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('common.refresh')}
          >
            <Text style={styles.retryButtonLabel}>{t('common.refresh')}</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Admin')}
            style={({ pressed }) => [
              styles.ghostButton,
              pressed && styles.ghostButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('home.open_admin')}
          >
            <Text style={styles.ghostButtonLabel}>{t('home.open_admin')}</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer testID="screen-home">
      <View style={styles.root}>
        <StudyAppBar />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>
            {questionnaireTitle || t('home.active_questionnaire')}
          </Text>

          {updateStatusMessage ? (
            <View style={styles.noticeBanner}>
              <Text style={styles.noticeText}>{updateStatusMessage}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => navigation.navigate('Admin')}
            style={({ pressed }) => [
              styles.secondaryCta,
              pressed && styles.secondaryCtaPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('home.manage_questionnaire')}
          >
            <Text style={styles.secondaryCtaLabel}>
              {t('home.manage_questionnaire')}
            </Text>
          </Pressable>

          <View style={styles.questionnaireCard}>
            <Text style={styles.questionnaireCardTitle}>
              {t('home.active_questionnaire')}
            </Text>
            <Text style={styles.questionnaireCardBody}>
              {t('home.questionnaire_stats', {
                sampleCount: samples.length,
                questionCount: questionnaireQuestions.length,
              })}
            </Text>
            {questionnaireQuestions.length > 0 ? (
              <View style={styles.questionList}>
                {questionnaireQuestions.map((question) => (
                  <Text key={question.id} style={styles.questionListItem}>
                    • {question.label}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.questionnaireCardHint}>
                {t('home.create_questionnaire_hint')}
              </Text>
            )}
          </View>

          <View style={styles.sampleCard}>
            <Text style={styles.sampleLabel}>{t('home.current_sample')}</Text>
            <Text style={styles.sampleCode}>{currentSample}</Text>
          </View>

          <Text style={styles.instruction}>{t('home.instruction_text')}</Text>

          <View style={styles.ratingCard}>
            <Text style={styles.ratingCardTitle}>
              {t('home.question_types')}
            </Text>
            <View style={styles.questionList}>
              {questionnaireQuestions.map((question) => (
                <View key={question.id} style={styles.questionTypeRow}>
                  <Text style={styles.questionListItem}>{question.label}</Text>
                  <Text style={styles.questionTypeTag}>
                    {question.type === 'scale'
                      ? t('home.type_scale')
                      : t('home.type_choice')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={() => navigation.navigate('Sample')}
            accessibilityRole="button"
            accessibilityLabel={t('home.start_evaluation')}
          >
            <Text style={styles.ctaLabel}>{t('home.start_evaluation')}</Text>
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
  ratingCard: {
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
  questionnaireCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeBanner: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  questionnaireCardTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  questionnaireCardBody: {
    marginTop: spacing.sm,
    ...typography.body,
    color: colors.textSecondary,
  },
  questionnaireCardHint: {
    marginTop: spacing.sm,
    ...typography.caption,
    color: colors.textMuted,
  },
  questionList: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  questionListItem: {
    ...typography.body,
    color: colors.textPrimary,
  },
  ratingCardTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scaleLegend: {
    marginTop: spacing.sm,
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  questionTypeRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  questionTypeTag: {
    marginTop: spacing.xs,
    ...typography.caption,
    color: colors.textMuted,
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
  secondaryCta: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryCtaPressed: {
    opacity: 0.9,
  },
  secondaryCtaLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaLabel: {
    ...typography.body,
    fontWeight: '700',
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
  ghostButton: {
    marginTop: spacing.sm,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  ghostButtonPressed: {
    opacity: 0.9,
  },
  ghostButtonLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
