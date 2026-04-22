import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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
  const {
    currentSample,
    isLoading,
    error,
    retryLoadSession,
    questionnaireTitle,
    questionnaireQuestions,
    samples,
  } = useSampleContext();

  // loading state
  if (isLoading) {
    return (
      <ScreenContainer testID="screen-home">
        <StudyAppBar />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.infoText}>Ladataan istuntoa...</Text>
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
            accessibilityLabel="Yritä uudelleen"
          >
            <Text style={styles.retryButtonLabel}>Yritä uudelleen</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Admin')}
            style={({ pressed }) => [
              styles.ghostButton,
              pressed && styles.ghostButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Avaa kyselyn hallinta"
          >
            <Text style={styles.ghostButtonLabel}>Avaa kyselyn hallinta</Text>
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
          <Text style={styles.infoText}>
            Ei arvioitavia näytteitä juuri nyt.
          </Text>
          <Pressable
            onPress={async () => {
              await retryLoadSession();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Päivitä näkymä"
          >
            <Text style={styles.retryButtonLabel}>Päivitä</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Admin')}
            style={({ pressed }) => [
              styles.ghostButton,
              pressed && styles.ghostButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Avaa kyselyn hallinta"
          >
            <Text style={styles.ghostButtonLabel}>Avaa kyselyn hallinta</Text>
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
          <Text style={styles.pageTitle}>{questionnaireTitle}</Text>

          <Pressable
            onPress={() => navigation.navigate('Admin')}
            style={({ pressed }) => [
              styles.secondaryCta,
              pressed && styles.secondaryCtaPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Avaa kyselyn hallinta"
          >
            <Text style={styles.secondaryCtaLabel}>Hallinnoi kyselyä</Text>
          </Pressable>

          <View style={styles.questionnaireCard}>
            <Text style={styles.questionnaireCardTitle}>Aktiivinen kysely</Text>
            <Text style={styles.questionnaireCardBody}>
              Näytteitä: {samples.length} / kysymyksiä: {questionnaireQuestions.length}
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
                Luo tai tuo uusi kysely hallintanäkymässä.
              </Text>
            )}
          </View>

          <View style={styles.sampleCard}>
            <Text style={styles.sampleLabel}>Nykyinen näytekoodi:</Text>
            <Text style={styles.sampleCode}>{currentSample}</Text>
          </View>

          <Text style={styles.instruction}>
            Kysymykset haetaan aktiivisen kyselyn skeemasta. Arviointinakyma
            mukautuu automaattisesti kysymystyyppeihin.
          </Text>

          <View style={styles.ratingCard}>
            <Text style={styles.ratingCardTitle}>Kysymystyypit</Text>
            <View style={styles.questionList}>
              {questionnaireQuestions.map((question) => (
                <View key={question.id} style={styles.questionTypeRow}>
                  <Text style={styles.questionListItem}>{question.label}</Text>
                  <Text style={styles.questionTypeTag}>
                    {question.type === 'scale' ? 'Asteikko' : 'Monivalinta / CATA'}
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
            accessibilityLabel="Aloita arviointi"
          >
            <Text style={styles.ctaLabel}>Aloita arviointi</Text>
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
