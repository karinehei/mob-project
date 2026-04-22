import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ScreenContainer } from '../components/ScreenContainer';
import { StudyAppBar } from '../components/StudyAppBar';
import { useSampleContext } from '../context/SampleContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { saveRespondentProfile } from '../services/respondentProfileService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'BackgroundInfo'>;

const GENDER_OPTIONS = ['Nainen', 'Mies', 'Muu', 'En halua kertoa'] as const;

function saveErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Taustatietojen tallennus epäonnistui.';
}

export default function BackgroundInfoScreen({
  navigation,
}: Props): React.JSX.Element {
  const { sessionId, responseSessionId, questionnaireTitle } = useSampleContext();
  const [ageText, setAgeText] = useState('');
  const [gender, setGender] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const onSubmit = async () => {
    const age = Number(ageText.trim());
    if (!Number.isInteger(age) || age < 10 || age > 120) {
      setSaveError('Anna ika kokonaislukuna valilta 10-120.');
      return;
    }
    if (!gender) {
      setSaveError('Valitse sukupuoli.');
      return;
    }

    setSaveError(null);
    setSaving(true);
    try {
      await saveRespondentProfile({
        sessionId,
        responseSessionId,
        questionnaireTitle,
        age,
        gender,
      });

      navigation.navigate('Result', {
        saveSucceeded: true,
        flowCompleted: true,
      });
    } catch (error) {
      setSaveError(saveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer testID="screen-background-info">
      <View style={styles.root}>
        <StudyAppBar />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Taustatiedot</Text>
          <Text style={styles.lead}>
            Vastaa lopuksi pakollisiin taustatietoihin.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Ika (pakollinen)</Text>
            <TextInput
              value={ageText}
              onChangeText={setAgeText}
              keyboardType="number-pad"
              placeholder="esim. 34"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              accessibilityLabel="Ika"
            />

            <Text style={styles.label}>Sukupuoli (pakollinen)</Text>
            <View style={styles.optionsWrap}>
              {GENDER_OPTIONS.map((option) => {
                const selected = gender === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setGender(option)}
                    style={({ pressed }) => [
                      styles.optionChip,
                      selected && styles.optionChipSelected,
                      pressed && !selected && styles.optionChipPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Sukupuoli: ${option}`}
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

          {saveError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{saveError}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.cta,
              pressed && !saving && styles.ctaPressed,
            ]}
            onPress={onSubmit}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Tallenna taustatiedot"
          >
            {saving ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.ctaLabel}>Tallenna taustatiedot</Text>
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
  card: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  input: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  optionsWrap: {
    marginTop: spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  optionChipPressed: { opacity: 0.92 },
  optionChipText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  optionChipTextSelected: {
    fontWeight: '700',
    color: colors.sampleAccent,
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaPressed: { opacity: 0.9 },
  ctaLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.onPrimary,
    letterSpacing: 0.3,
  },
});
