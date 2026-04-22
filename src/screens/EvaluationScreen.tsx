import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenContainer } from '../components/ScreenContainer';
import { StudyAppBar } from '../components/StudyAppBar';
import { useSampleContext } from '../context/SampleContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { saveEvaluation } from '../services/evaluationService';
import { colors } from '../theme/colors';
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
  const minScore = question.minScore ?? 0;
  const maxScore = question.maxScore ?? 10;
  const values = useMemo(
    () => Array.from({ length: maxScore - minScore + 1 }, (_, index) => minScore + index),
    [maxScore, minScore],
  );

  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionTitle}>{question.label}</Text>
      <Text style={styles.scaleLegend}>
        {minScore} = alin arvo{'\n'}
        {maxScore} = ylin arvo
      </Text>
      <View style={styles.optionsWrap}>
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
              accessibilityLabel={`${question.label}: arvo ${optionValue}`}
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
  const options = question.options ?? [];

  return (
    <View style={styles.questionCard}>
      <Text style={styles.questionTitle}>{question.label}</Text>
      <Text style={styles.helpText}>Voit valita yhden tai useamman vaihtoehdon.</Text>
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
              accessibilityLabel={`${question.label}: ${option}`}
            >
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

function saveErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return 'Tallennus epäonnistui. Tarkista verkko ja yritä uudelleen.';
}

export default function EvaluationScreen({
  navigation,
}: Props): React.JSX.Element {
  const {
    currentSample,
    currentIndex,
    samples,
    sessionId,
    questionnaireTitle,
    questionnaireQuestions,
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
          <Text style={styles.infoText}>Ladataan arviointinäkymää...</Text>
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
            onPress={async () => {
              await retryLoadSession();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Yritä uudelleen"
          >
            <Text style={styles.retryButtonLabel}>Yritä uudelleen</Text>
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
          <Text style={styles.infoText}>
            Ei arvioitavaa näytettä tällä hetkellä.
          </Text>
          <Pressable
            onPress={() => navigation.navigate('Home')}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Palaa etusivulle"
          >
            <Text style={styles.retryButtonLabel}>Palaa etusivulle</Text>
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
      const currentValue = Array.isArray(prev[questionId]) ? prev[questionId] : [];
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
      setSaveError('Näytettä ei löytynyt. Palaa etusivulle ja yritä uudelleen.');
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
        questionnaireTitle,
        answers: payload.answers,
      });

      const isLastSample = currentIndex >= samples.length - 1;

      navigation.navigate('Result', {
        saveSucceeded: true,
        flowCompleted: isLastSample,
      });
    } catch (e) {
      setSaveError(saveErrorMessage(e));
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
          <Text style={styles.pageTitle}>Arviointi</Text>

          <Text style={styles.lead}>
            Vastaa aktiivisen kyselyn kysymyksiin. Kysymykset renderoidaan
            backendin skeemasta.
          </Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Istunto: {sessionId ?? '—'}</Text>
            <Text style={styles.infoBody}>
              Näyte: {currentSample ?? '—'}
              {'\n'}
              Kysely: {questionnaireTitle}
              {'\n'}
              Kysymyksiä: {questionnaireQuestions.length}
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
            accessibilityLabel="Tallenna arvio"
          >
            {saving ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.ctaLabel}>Tallenna ja jatka</Text>
            )}
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
  lead: {
    marginTop: spacing.sm,
    ...typography.body,
    color: colors.textSecondary,
  },
  questionCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questionTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoCard: {
    marginTop: spacing.lg,
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
  errorBanner: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  scaleLegend: {
    marginTop: spacing.sm,
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  helpText: {
    marginTop: spacing.sm,
    ...typography.caption,
    color: colors.textMuted,
  },
  optionsWrap: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  scaleChip: {
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  scaleChipSelected: {
    backgroundColor: colors.ratingSelectedBg,
    borderWidth: 2,
    borderColor: colors.ratingSelectedBorder,
  },
  scaleChipPressed: {
    opacity: 0.92,
  },
  scaleChipText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  scaleChipTextSelected: {
    color: colors.sampleAccent,
  },
  optionChip: {
    minHeight: 44,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionChipSelected: {
    backgroundColor: colors.sampleCardBg,
    borderColor: colors.primary,
  },
  optionChipPressed: {
    opacity: 0.92,
  },
  optionChipText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  optionChipTextSelected: {
    fontWeight: '700',
    color: colors.sampleAccent,
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
    minHeight: 48,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaDisabled: {
    opacity: 0.5,
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
