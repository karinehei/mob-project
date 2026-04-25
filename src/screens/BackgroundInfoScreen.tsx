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
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../components/ScreenContainer';
import { StudyAppBar } from '../components/StudyAppBar';
import { useSampleContext } from '../context/SampleContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { saveResponseSession } from '../services/responseSessionService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'BackgroundInfo'>;

const GENDER_OPTIONS = [
  'female',
  'male',
  'other',
  'prefer_not_to_say',
] as const;

export default function BackgroundInfoScreen({
  navigation,
}: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { sessionId, responseSessionId, questionnaireTitle } =
    useSampleContext();
  const [ageText, setAgeText] = useState('');
  const [genderKey, setGenderKey] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const onBackPress = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  function saveErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return t('background_info.save_error_fallback');
  }

  const onSubmit = async () => {
    const age = Number(ageText.trim());
    if (!Number.isInteger(age) || age < 10 || age > 120) {
      setSaveError(t('background_info.error_age'));
      return;
    }
    if (!genderKey) {
      setSaveError(t('background_info.error_gender'));
      return;
    }

    setSaveError(null);
    setSaving(true);
    try {
      const translatedGender = t(`background_info.gender_${genderKey}`);

      await saveResponseSession({
        sessionId,
        responseSessionId,
        questionnaireTitle,
        age,
        gender: translatedGender,
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
        <StudyAppBar showBackButton onBackPress={onBackPress} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>{t('background_info.title')}</Text>
          <Text style={styles.lead}>{t('background_info.lead')}</Text>

          <View style={styles.card}>
            <Text style={styles.label}>{t('background_info.label_age')}</Text>
            <TextInput
              value={ageText}
              onChangeText={setAgeText}
              keyboardType="number-pad"
              placeholder={t('background_info.placeholder_age')}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              accessibilityLabel={t('background_info.label_age')}
              accessibilityHint={t(
                'background_info.age_hint',
                'Syötä ikäsi numeroina',
              )}
            />

            <Text style={styles.label}>
              {t('background_info.label_gender')}
            </Text>
            <View style={styles.optionsWrap}>
              {GENDER_OPTIONS.map((optionKey) => {
                const selected = genderKey === optionKey;
                const translatedLabel = t(
                  `background_info.gender_${optionKey}`,
                );

                return (
                  <Pressable
                    key={optionKey}
                    onPress={() => setGenderKey(optionKey)}
                    style={({ pressed }) => [
                      styles.optionChip,
                      selected && styles.optionChipSelected,
                      pressed && !selected && styles.optionChipPressed,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={t('background_info.gender_aria', {
                      option: translatedLabel,
                    })}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        selected && styles.radioCircleSelected,
                      ]}
                    >
                      {selected && <View style={styles.radioDot} />}
                    </View>

                    <Text
                      style={[
                        styles.optionChipText,
                        selected && styles.optionChipTextSelected,
                      ]}
                    >
                      {translatedLabel}
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
            accessibilityLabel={t('background_info.save_button')}
          >
            {saving ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.ctaLabel}>
                {t('background_info.save_button')}
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
    minHeight: 48,
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
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
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
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
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
