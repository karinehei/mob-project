import React, { useState } from 'react';
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
import { validateEvaluation, ValidationError } from '../validation/validateEvaluation';
import type { EvaluationPayload } from '../types/evaluation';

type Props = NativeStackScreenProps<RootStackParamList, 'Evaluation'>;

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
    sessionId,
    pendingAppearanceRating,
    clearPendingAppearanceRating,
  } = useSampleContext();

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const canSave =
    Boolean(currentSample) &&
    pendingAppearanceRating !== null &&
    !saving;

const onSave = async () => {
  if (!currentSample || pendingAppearanceRating === null) {
    setSaveError('Valitse pistemäärä etusivulla ja yritä uudelleen.');
    return;
  }

  const payload: EvaluationPayload = {
    sampleId: currentSample,
    scores: {
      appearance: pendingAppearanceRating,
    },
  };

  const errors = validateEvaluation(payload, [
    {
      id: 'appearance',
      label: 'Ulkonäkö',
      minScore: 1,
      maxScore: 10,
    },
  ]);

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
      rating: pendingAppearanceRating,
      sessionId,
    });
    clearPendingAppearanceRating();
    navigation.navigate('Result', { saveSucceeded: true });
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

          <Text style={styles.lead}>Tallenna arvio Firestoreen</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              Istunto: {sessionId ?? '—'}
            </Text>
            <Text style={styles.infoBody}>
              Näyte: {currentSample ?? '—'}
              {'\n'}
              Ulkonäkö / Appearance:{' '}
              {pendingAppearanceRating !== null
                ? `${pendingAppearanceRating} / 10`
                : 'Valitse etusivulla'}
            </Text>
          </View>

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
});
