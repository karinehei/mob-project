import React, { useMemo, useState } from 'react';
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
import { RootStackParamList } from '../navigation/AppNavigator';
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

const IMPORT_PLACEHOLDER = `{
  "title": "Jogurttitesti",
  "samples": ["451", "926", "780"],
  "questions": [
    { "label": "Ulkonäkö", "type": "scale", "minScore": 0, "maxScore": 10 },
    { "label": "Tuoksu", "type": "scale", "minScore": 0, "maxScore": 10 },
    { "label": "Havaitut ominaisuudet", "type": "multiSelect", "options": ["makea", "hapan", "pehmeä"] }
  ]
}`;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Kyselyn tallennus epäonnistui. Tarkista tiedot ja yritä uudelleen.';
}

export default function AdminScreen({ navigation }: Props): React.JSX.Element {
  const { retryLoadSession } = useSampleContext();

  const [title, setTitle] = useState('');
  const [samplesText, setSamplesText] = useState('');
  const [scaleQuestionsText, setScaleQuestionsText] = useState(
    'Ulkonäkö\nTuoksu\nMaku\nRakenne',
  );
  const [cataQuestionLabel, setCataQuestionLabel] = useState(
    'Mitkä ominaisuudet tunnistit?',
  );
  const [cataOptionsText, setCataOptionsText] = useState('makea, hapan, pehmeä');
  const [importText, setImportText] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
  }, [title, samplesText, scaleQuestionsText, cataQuestionLabel, cataOptionsText]);

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
      setStatusMessage(`Kysely tallennettu aktiiviseksi (${questionnaireId}).`);
      navigation.navigate('Home');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer testID="screen-admin">
      <View style={styles.root}>
        <StudyAppBar />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>Kyselyn hallinta</Text>
          <Text style={styles.lead}>
            Luo uusi aktiivinen kysely tai tuo valmis JSON-rakenne ilman
            suoraa Firestore-muokkausta.
          </Text>

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
            <Text style={styles.cardTitle}>Luo kysely käsin</Text>

            <Text style={styles.label}>Kyselyn nimi</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Esim. Jogurttien aistinvarainen arviointi"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              accessibilityLabel="Kyselyn nimi"
            />

            <Text style={styles.label}>Näytekoodit</Text>
            <TextInput
              value={samplesText}
              onChangeText={setSamplesText}
              placeholder="451, 926, 780"
              placeholderTextColor={colors.textMuted}
              multiline
              style={[styles.input, styles.textArea]}
              accessibilityLabel="Näytekoodit"
            />

            <Text style={styles.label}>Asteikkokysymykset (0-10)</Text>
            <TextInput
              value={scaleQuestionsText}
              onChangeText={setScaleQuestionsText}
              placeholder="Yksi kysymys per rivi"
              placeholderTextColor={colors.textMuted}
              multiline
              style={[styles.input, styles.textArea]}
              accessibilityLabel="Asteikkokysymykset"
            />

            <Text style={styles.label}>CATA-kysymyksen otsikko</Text>
            <TextInput
              value={cataQuestionLabel}
              onChangeText={setCataQuestionLabel}
              placeholder="Esim. Mitkä ominaisuudet tunnistit?"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              accessibilityLabel="CATA-kysymyksen otsikko"
            />

            <Text style={styles.label}>CATA-vaihtoehdot</Text>
            <TextInput
              value={cataOptionsText}
              onChangeText={setCataOptionsText}
              placeholder="makea, hapan, pehmeä"
              placeholderTextColor={colors.textMuted}
              multiline
              style={[styles.input, styles.textArea]}
              accessibilityLabel="CATA-vaihtoehdot"
            />

            {preview ? (
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Esikatselu</Text>
                <Text style={styles.previewBody}>
                  Näytteitä: {preview.samples.length}
                  {'\n'}
                  Kysymyksiä: {preview.questions.length}
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
              accessibilityLabel="Tallenna käsin luotu kysely"
            >
              {saving ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.primaryButtonLabel}>
                  Tallenna aktiiviseksi kyselyksi
                </Text>
              )}
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tai tuo JSON</Text>
            <Text style={styles.helpText}>
              Tuonti tukee kenttiä `title`, `samples` ja `questions`.
            </Text>

            <TextInput
              value={importText}
              onChangeText={setImportText}
              placeholder={IMPORT_PLACEHOLDER}
              placeholderTextColor={colors.textMuted}
              multiline
              style={[styles.input, styles.importArea]}
              accessibilityLabel="JSON-tuonti"
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
              accessibilityLabel="Tuo kysely JSONista"
            >
              <Text style={styles.secondaryButtonLabel}>Tuo ja aktivoi kysely</Text>
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
  secondaryButtonPressed: {
    opacity: 0.92,
  },
  secondaryButtonLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
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
