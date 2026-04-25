import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  Share,
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
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  exportResults,
  getResultExportOptions,
} from '../services/resultsExportService';
import { saveQuestionnaire } from '../services/questionnaireService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import {
  buildQuestionnaireDraftFromManualInput,
  parseQuestionnaireImport,
} from '../utils/questionnaireBuilder';
import { useSampleContext } from '../context/SampleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Admin'>;

export default function AdminScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { retryLoadSession } = useSampleContext();
  const onBackPress = () => {
    if (navigation.canGoBack?.()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  function getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return t('admin_screen.save_error_fallback');
  }

  const [title, setTitle] = useState('');
  const [samplesText, setSamplesText] = useState('');
  const [scaleQuestionsText, setScaleQuestionsText] = useState(
    t('admin_screen.default_scale_questions'),
  );
  const [cataQuestionLabel, setCataQuestionLabel] = useState(
    t('admin_screen.default_cata_label'),
  );
  const [cataOptionsText, setCataOptionsText] = useState(
    t('admin_screen.default_cata_options'),
  );
  const [importText, setImportText] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingExportOptions, setLoadingExportOptions] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questionnaireOptions, setQuestionnaireOptions] = useState<string[]>(
    [],
  );
  const [sessionOptions, setSessionOptions] = useState<string[]>([]);
  const [exportScope, setExportScope] = useState<'questionnaire' | 'session'>(
    'questionnaire',
  );
  const [selectedExportValue, setSelectedExportValue] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'xls'>('csv');

  const preview = useMemo(() => {
    try {
      return buildQuestionnaireDraftFromManualInput({
        title,
        samplesText,
        scaleQuestionsText,
        cataQuestionLabel,
        cataOptionsText,
      });
    } catch {
      return null;
    }
  }, [
    title,
    samplesText,
    scaleQuestionsText,
    cataQuestionLabel,
    cataOptionsText,
  ]);

  const exportOptions =
    exportScope === 'questionnaire' ? questionnaireOptions : sessionOptions;

  const loadExportOptions = useCallback(async () => {
    setLoadingExportOptions(true);
    try {
      const options = await getResultExportOptions();
      setQuestionnaireOptions(options.questionnaireOptions.map((item) => item.value));
      setSessionOptions(options.sessionOptions.map((item) => item.value));
    } catch {
      // Keep export section usable even if options loading fails.
    } finally {
      setLoadingExportOptions(false);
    }
  }, []);

  useEffect(() => {
    loadExportOptions().catch(() => undefined);
  }, [loadExportOptions]);

  useEffect(() => {
    if (exportOptions.length > 0) {
      if (!exportOptions.includes(selectedExportValue)) {
        setSelectedExportValue(exportOptions[0]);
      }
      return;
    }

    setSelectedExportValue('');
  }, [exportScope, exportOptions, selectedExportValue]);

  const persistDraft = async (mode: 'manual' | 'import') => {
    setSaving(true);
    setStatusMessage(null);
    setErrorMessage(null);

    try {
      const draft =
        mode === 'manual'
          ? buildQuestionnaireDraftFromManualInput({
              title,
              samplesText,
              scaleQuestionsText,
              cataQuestionLabel,
              cataOptionsText,
            })
          : parseQuestionnaireImport(importText);

      const questionnaireId = await saveQuestionnaire(draft);
      await retryLoadSession();
      setStatusMessage(t('admin_screen.save_success', { id: questionnaireId }));
      navigation.navigate('Home');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const onStartExport = async () => {
    setExporting(true);
    setErrorMessage(null);
    try {
      const result = await exportResults(
        exportScope,
        selectedExportValue,
        exportFormat,
      );
      const payload = `\uFEFF${result.content}`;
      const dataUri = `data:${result.mimeType};charset=utf-8,${encodeURIComponent(payload)}`;

      try {
        await Linking.openURL(dataUri);
      } catch {
        await Share.share({
          title: result.filename,
          message: payload,
        });
      }

      setStatusMessage(t('admin_screen.export_done', { filename: result.filename }));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScreenContainer testID="screen-admin">
      <View style={styles.root}>
        <StudyAppBar showBackButton onBackPress={onBackPress} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>{t('admin_screen.title')}</Text>
          <Text style={styles.lead}>{t('admin_screen.lead')}</Text>

          {statusMessage ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>{statusMessage}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t('admin_screen.create_manual_title')}
            </Text>

            <Text style={styles.label}>{t('admin_screen.label_name')}</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t('admin_screen.placeholder_name')}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              accessibilityLabel={t('admin_screen.label_name')}
            />

            <Text style={styles.label}>{t('admin_screen.label_samples')}</Text>
            <TextInput
              value={samplesText}
              onChangeText={setSamplesText}
              placeholder={t('admin_screen.placeholder_samples')}
              placeholderTextColor={colors.textMuted}
              multiline
              style={[styles.input, styles.textArea]}
              accessibilityLabel={t('admin_screen.label_samples')}
            />

            <Text style={styles.label}>
              {t('admin_screen.label_scale_questions')}
            </Text>
            <TextInput
              value={scaleQuestionsText}
              onChangeText={setScaleQuestionsText}
              placeholder={t('admin_screen.placeholder_scale_questions')}
              placeholderTextColor={colors.textMuted}
              multiline
              style={[styles.input, styles.textArea]}
              accessibilityLabel={t('admin_screen.label_scale_questions')}
            />

            <Text style={styles.label}>
              {t('admin_screen.label_cata_question')}
            </Text>
            <TextInput
              value={cataQuestionLabel}
              onChangeText={setCataQuestionLabel}
              placeholder={t('admin_screen.placeholder_cata_question')}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              accessibilityLabel={t('admin_screen.label_cata_question')}
            />

            <Text style={styles.label}>
              {t('admin_screen.label_cata_options')}
            </Text>
            <TextInput
              value={cataOptionsText}
              onChangeText={setCataOptionsText}
              placeholder={t('admin_screen.placeholder_cata_options')}
              placeholderTextColor={colors.textMuted}
              multiline
              style={[styles.input, styles.textArea]}
              accessibilityLabel={t('admin_screen.label_cata_options')}
            />

            {preview ? (
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>
                  {t('admin_screen.preview_title')}
                </Text>
                <Text style={styles.previewBody}>
                  {t('admin_screen.preview_body', {
                    samples: preview.samples.length,
                    questions: preview.questions.length,
                  })}
                </Text>
              </View>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !saving && styles.primaryButtonPressed,
              ]}
              onPress={() => {
                persistDraft('manual').catch(() => undefined);
              }}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel={t('admin_screen.save_manual_aria')}
            >
              {saving ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.primaryButtonLabel}>
                  {t('admin_screen.save_manual_button')}
                </Text>
              )}
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {t('admin_screen.import_title')}
            </Text>
            <Text style={styles.helpText}>{t('admin_screen.import_help')}</Text>

            <TextInput
              value={importText}
              onChangeText={setImportText}
              placeholder={t('admin_screen.import_placeholder_json')}
              placeholderTextColor={colors.textMuted}
              multiline
              style={[styles.input, styles.importArea]}
              accessibilityLabel={t('admin_screen.import_aria')}
            />

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && !saving && styles.secondaryButtonPressed,
              ]}
              onPress={() => {
                persistDraft('import').catch(() => undefined);
              }}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel={t('admin_screen.import_button_aria')}
            >
              <Text style={styles.secondaryButtonLabel}>
                {t('admin_screen.import_button')}
              </Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('admin_screen.export_title')}</Text>
            <Text style={styles.helpText}>
              {t('admin_screen.export_help')}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                styles.refreshExportButton,
                pressed && !loadingExportOptions && styles.secondaryButtonPressed,
              ]}
              onPress={() => {
                loadExportOptions().catch(() => undefined);
              }}
              disabled={loadingExportOptions}
              accessibilityRole="button"
              accessibilityLabel={t('admin_screen.export_refresh_aria')}
            >
              {loadingExportOptions ? (
                <ActivityIndicator color={colors.textPrimary} />
              ) : (
                <Text style={styles.secondaryButtonLabel}>
                  {t('admin_screen.export_refresh_button')}
                </Text>
              )}
            </Pressable>

            <Text style={styles.label}>{t('admin_screen.export_scope_label')}</Text>
            <View style={styles.toggleWrap}>
              <Pressable
                style={({ pressed }) => [
                  styles.toggleChip,
                  exportScope === 'questionnaire' && styles.toggleChipSelected,
                  pressed && styles.toggleChipPressed,
                ]}
                onPress={() => setExportScope('questionnaire')}
                accessibilityRole="radio"
                accessibilityState={{
                  selected: exportScope === 'questionnaire',
                }}
                accessibilityLabel={t('admin_screen.export_scope_questionnaire_aria')}
              >
                <View
                  style={[
                    styles.radioCircle,
                    exportScope === 'questionnaire' &&
                      styles.radioCircleSelected,
                  ]}
                >
                  {exportScope === 'questionnaire' && (
                    <View style={styles.radioDot} />
                  )}
                </View>

                <Text
                  style={[
                    styles.toggleChipText,
                    exportScope === 'questionnaire' &&
                      styles.toggleChipTextSelected,
                  ]}
                >
                  {t('admin_screen.export_scope_questionnaire')}
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.toggleChip,
                  exportScope === 'session' && styles.toggleChipSelected,
                  pressed && styles.toggleChipPressed,
                ]}
                onPress={() => setExportScope('session')}
                accessibilityRole="radio"
                accessibilityState={{ selected: exportScope === 'session' }}
                accessibilityLabel={t('admin_screen.export_scope_session_aria')}
              >
                <View
                  style={[
                    styles.radioCircle,
                    exportScope === 'session' && styles.radioCircleSelected,
                  ]}
                >
                  {exportScope === 'session' && (
                    <View style={styles.radioDot} />
                  )}
                </View>

                <Text
                  style={[
                    styles.toggleChipText,
                    exportScope === 'session' && styles.toggleChipTextSelected,
                  ]}
                >
                  {t('admin_screen.export_scope_session')}
                </Text>
              </Pressable>
            </View>

            <Text style={styles.label}>
              {exportScope === 'questionnaire'
                ? t('admin_screen.export_select_questionnaire')
                : t('admin_screen.export_select_session')}
            </Text>
            {loadingExportOptions ? (
              <View style={styles.inlineLoader}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : exportOptions.length === 0 ? (
              <Text style={styles.helpText}>
                {t('admin_screen.export_no_items')}
              </Text>
            ) : (
              <View style={styles.optionsWrap}>
                {exportOptions.map((value) => {
                  const selected = selectedExportValue === value;
                  return (
                    <Pressable
                      key={value}
                      style={({ pressed }) => [
                        styles.optionChip,
                        selected && styles.optionChipSelected,
                        pressed && !selected && styles.optionChipPressed,
                      ]}
                      onPress={() => setSelectedExportValue(value)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={t('admin_screen.export_target_aria', { value })}
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
                        {value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <Text style={styles.label}>{t('admin_screen.export_format_label')}</Text>
            <View style={styles.toggleWrap}>
              <Pressable
                style={({ pressed }) => [
                  styles.toggleChip,
                  exportFormat === 'csv' && styles.toggleChipSelected,
                  pressed && styles.toggleChipPressed,
                ]}
                onPress={() => setExportFormat('csv')}
                accessibilityRole="radio"
                accessibilityState={{ selected: exportFormat === 'csv' }}
                accessibilityLabel={t('admin_screen.export_format_csv_aria')}
              >
                <View
                  style={[
                    styles.radioCircle,
                    exportFormat === 'csv' && styles.radioCircleSelected,
                  ]}
                >
                  {exportFormat === 'csv' && <View style={styles.radioDot} />}
                </View>

                <Text
                  style={[
                    styles.toggleChipText,
                    exportFormat === 'csv' && styles.toggleChipTextSelected,
                  ]}
                >
                  CSV
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.toggleChip,
                  exportFormat === 'xls' && styles.toggleChipSelected,
                  pressed && styles.toggleChipPressed,
                ]}
                onPress={() => setExportFormat('xls')}
                accessibilityRole="radio"
                accessibilityState={{ selected: exportFormat === 'xls' }}
                accessibilityLabel={t('admin_screen.export_format_xls_aria')}
              >
                <View
                  style={[
                    styles.radioCircle,
                    exportFormat === 'xls' && styles.radioCircleSelected,
                  ]}
                >
                  {exportFormat === 'xls' && <View style={styles.radioDot} />}
                </View>

                <Text
                  style={[
                    styles.toggleChipText,
                    exportFormat === 'xls' && styles.toggleChipTextSelected,
                  ]}
                >
                  XLS
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                (exporting || !selectedExportValue) && styles.disabledButton,
                pressed &&
                  !exporting &&
                  selectedExportValue &&
                  styles.primaryButtonPressed,
              ]}
              onPress={() => {
                onStartExport().catch(() => undefined);
              }}
              disabled={exporting || !selectedExportValue}
              accessibilityRole="button"
              accessibilityLabel={t('admin_screen.export_start_aria')}
            >
              {exporting ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.primaryButtonLabel}>
                  {t('admin_screen.export_download_button')}
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
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
    gap: spacing.lg,
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
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  label: {
    marginTop: spacing.md,
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
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
  textArea: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  importArea: {
    minHeight: 220,
    textAlignVertical: 'top',
  },
  helpText: {
    marginTop: spacing.sm,
    ...typography.caption,
    color: colors.textMuted,
  },
  previewCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  previewTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  previewBody: {
    marginTop: spacing.xs,
    ...typography.body,
    color: colors.textSecondary,
  },
  primaryButton: {
    marginTop: spacing.lg,
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  primaryButtonPressed: {
    opacity: 0.92,
  },
  primaryButtonLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.onPrimary,
    textAlign: 'center',
  },
  secondaryButton: {
    marginTop: spacing.lg,
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  refreshExportButton: {
    marginTop: spacing.md,
  },
  secondaryButtonPressed: {
    opacity: 0.92,
  },
  secondaryButtonLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  toggleWrap: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  toggleChip: {
    flexDirection: 'row',
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  toggleChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.sampleCardBg,
  },
  toggleChipPressed: {
    opacity: 0.92,
  },
  toggleChipText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  toggleChipTextSelected: {
    color: colors.sampleAccent,
  },
  inlineLoader: {
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  optionsWrap: {
    marginTop: spacing.md,
    flexDirection: 'column',
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
  optionChipPressed: {
    opacity: 0.92,
  },
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
  disabledButton: {
    opacity: 0.5,
  },
  successBanner: {
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.sampleCardBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  successText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  errorBanner: {
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
});
