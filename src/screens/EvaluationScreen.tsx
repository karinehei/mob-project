import React, { useMemo, useState } from 'react';
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
import { saveEvaluation } from '../services/evaluationService';
import { colors, shadows } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  validateEvaluation,
  ValidationError,
} from '../validation/validateEvaluation';
import type { EvaluationAnswer } from '../types/evaluation';
import { buildEvaluationPayload } from '../utils/buildEvaluationPayload';
import type { QuestionnaireQuestion } from '../types/questionnaire';

type Props = NativeStackScreenProps<RootStackParamList, 'Evaluation'>;

type ScaleQuestionProps = {
  question: QuestionnaireQuestion;
  value: number | undefined;
  onChange: (nextValue: number) => void;
};

type MultiSelectQuestionProps = {
  question: QuestionnaireQuestion;
  values: string[];
  onToggle: (option: string) => void;
};

function ScaleQuestion({
  question,
  value,
  onChange,
}: ScaleQuestionProps): React.JSX.Element {
  const { t } = useTranslation();
  const minScore = question.minScore ?? 0;
  const maxScore = question.maxScore ?? 10;
  const values = useMemo(
    () =>
      Array.from(
        { length: maxScore - minScore + 1 },
        (_, index) => minScore + index,
      ),
    [maxScore, minScore],
  );

  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionTitle}>{question.label}</Text>
      <Text style={styles.scaleLegend}>
        {minScore} = {t('eval_screen.min_val')}, {maxScore} ={' '}
        {t('eval_screen.max_val')}
      </Text>
      <View style={styles.scaleGrid}>
        {values.map((optionValue) => {
          const selected = value === optionValue;
          return (
            <Pressable
              key={optionValue}
              onPress={() => onChange(optionValue)}
              style={({ pressed }) => [
                styles.scaleChip,
                selected && styles.scaleChipSelected,
                pressed && !selected && styles.scaleChipPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={t('eval_screen.scale_value_aria', {
                question: question.label,
                value: optionValue,
              })}
            >
              <Text
                style={[
                  styles.scaleChipText,
                  selected && styles.scaleChipTextSelected,
                ]}
              >
                {optionValue}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MultiSelectQuestion({
  question,
  values,
  onToggle,
}: MultiSelectQuestionProps): React.JSX.Element {
  const { t } = useTranslation();
  const options = question.options ?? [];

  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionTitle}>{question.label}</Text>
      <Text style={styles.helpText}>{t('eval_screen.multi_help')}</Text>
      <View style={styles.optionsWrap}>
        {options.map((option) => {
          const selected = values.includes(option);
          return (
            <Pressable
              key={option}
              onPress={() => onToggle(option)}
              style={({ pressed }) => [
                styles.optionChip,
                selected && styles.optionChipSelected,
                pressed && !selected && styles.optionChipPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={t('eval_screen.option_aria', {
                question: question.label,
                option,
              })}
            >
              <View
                style={[styles.checkbox, selected && styles.checkboxSelected]}
              >
                {selected && <View style={styles.checkmark} />}
              </View>
              <Text
                style={[
                  styles.optionChipText,
                  selected && styles.optionChipTextSelected,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function EvaluationScreen({
  navigation,
}: Props): React.JSX.Element {
  const { t } = useTranslation();
  const {
    currentSample,
    currentIndex,
    samples,
    sessionId,
    responseSessionId,
    questionnaireTitle,
    questionnaireQuestions,
    samplePresentationOrder,
    isLoading,
    error,
    retryLoadSession,
  } = useSampleContext();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, EvaluationAnswer>>({});

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );

  const canSave =
    Boolean(currentSample) && questionnaireQuestions.length > 0 && !saving;

  if (isLoading) {
    return (
      <ScreenContainer testID="screen-evaluation">
        <StudyAppBar />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.infoText}>{t('eval_screen.loading')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer testID="screen-evaluation">
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
      <ScreenContainer testID="screen-evaluation">
        <StudyAppBar />
        <View style={styles.centerContainer}>
          <Text style={styles.infoText}>{t('eval_screen.no_sample')}</Text>
          <Pressable
            onPress={() => navigation.navigate('Home')}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('eval_screen.back_home')}
          >
            <Text style={styles.retryButtonLabel}>
              {t('eval_screen.back_home')}
            </Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const setScaleAnswer = (questionId: string, nextValue: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: nextValue,
    }));
  };

  const toggleMultiSelectAnswer = (questionId: string, option: string) => {
    setAnswers((prev) => {
      const currentValue = Array.isArray(prev[questionId])
        ? prev[questionId]
        : [];
      const nextValues = currentValue.includes(option)
        ? currentValue.filter((item) => item !== option)
        : [...currentValue, option];

      return {
        ...prev,
        [questionId]: nextValues,
      };
    });
  };

  const onSave = async () => {
    if (!currentSample) {
      setSaveError(t('evaluation_screen.sample_not_found'));
      return;
    }

    const payload = buildEvaluationPayload(currentSample, answers);
    const errors = validateEvaluation(payload, questionnaireQuestions);

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSaving(true);
    setSaveError(null);
    setValidationErrors([]);

    try {
      await saveEvaluation({
        sampleCode: currentSample,
        sessionId,
        responseSessionId,
        questionnaireTitle,
        answers: payload.answers,
        samplePresentationOrder,
        samplePresentationIndex: currentIndex,
      });

      const isLastSample = currentIndex >= samples.length - 1;

      if (isLastSample) {
        navigation.navigate('BackgroundInfo');
      } else {
        navigation.navigate('Result', {
          saveSucceeded: true,
          flowCompleted: false,
        });
      }
    } catch (e) {
      if (e instanceof Error && e.message) {
        setSaveError(e.message);
      } else {
        setSaveError(t('eval_screen.save_failed'));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer testID="screen-evaluation">
      <View style={styles.root}>
        <StudyAppBar />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>{t('eval_screen.title')}</Text>

          <View style={styles.progressPill}>
            <Text style={styles.progressText}>
              {t('eval_screen.progress', {
                current: currentIndex + 1,
                total: samples.length,
              })}
            </Text>
          </View>

          {questionnaireQuestions.map((question) =>
            question.type === 'scale' ? (
              <ScaleQuestion
                key={question.id}
                question={question}
                value={
                  typeof answers[question.id] === 'number'
                    ? (answers[question.id] as number)
                    : undefined
                }
                onChange={(nextValue) => {
                  setScaleAnswer(question.id, nextValue);
                }}
              />
            ) : (
              <MultiSelectQuestion
                key={question.id}
                question={question}
                values={
                  Array.isArray(answers[question.id])
                    ? (answers[question.id] as string[])
                    : []
                }
                onToggle={(option) => {
                  toggleMultiSelectAnswer(question.id, option);
                }}
              />
            ),
          )}

          {saveError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{saveError}</Text>
            </View>
          ) : null}

          {validationErrors.length > 0 && (
            <View style={styles.errorBanner}>
              {validationErrors.map((err, idx) => (
                <Text key={idx} style={styles.errorText}>
                  {err.message}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.cta,
              !canSave && styles.ctaDisabled,
              pressed && canSave && styles.ctaPressed,
            ]}
            onPress={onSave}
            disabled={!canSave}
            accessibilityRole="button"
            accessibilityLabel={t('eval_screen.save_aria')}
          >
            {saving ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.ctaLabel}>
                {t('eval_screen.save_and_continue')}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  pageTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  progressPill: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs + 4,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  progressText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  questionCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 20,
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  questionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  scaleLegend: {
    marginTop: spacing.xs,
    ...typography.caption,
    color: colors.textSecondary,
  },
  helpText: {
    marginTop: spacing.xs,
    ...typography.caption,
    color: colors.textSecondary,
  },
  scaleGrid: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  scaleChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderMuted,
  },
  scaleChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.button,
  },
  scaleChipPressed: { opacity: 0.8 },
  scaleChipText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  scaleChipTextSelected: {
    color: colors.onPrimary,
  },
  optionsWrap: {
    marginTop: spacing.md,
    flexDirection: 'column',
    gap: spacing.md,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderMuted,
  },
  optionChipSelected: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primary,
    borderWidth: 2.5,
    ...shadows.button,
  },
  optionChipPressed: { opacity: 0.9 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderMuted,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderWidth: 0,
  },
  checkmark: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.onPrimary,
  },
  optionChipText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  optionChipTextSelected: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  errorBanner: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
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
  ctaDisabled: { opacity: 0.5 },
  ctaPressed: { opacity: 0.9 },
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
  retryButtonPressed: { opacity: 0.9 },
  retryButtonLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.onPrimary,
  },
});
