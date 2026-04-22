import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { ScreenContainer } from '../components/ScreenContainer';
import { StudyAppBar } from '../components/StudyAppBar';
import { RootStackParamList } from '../navigation/AppNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useSampleContext } from '../context/SampleContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({
  navigation,
  route,
}: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { nextSample, resetSession } = useSampleContext();

  const saveSucceeded = route.params?.saveSucceeded === true;
  const flowCompleted = route.params?.flowCompleted === true;

  const primaryCtaLabel = flowCompleted
    ? t('result_screen.new_round')
    : t('result_screen.next_sample');

  const handleNextStep = () => {
    if (flowCompleted) {
      resetSession();
    } else {
      nextSample();
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <ScreenContainer testID="screen-result">
      <View style={styles.root}>
        <StudyAppBar />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.pageTitle}>{t('result_screen.title')}</Text>

          <Text style={styles.lead}>{t('result_screen.lead')}</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>
              {flowCompleted
                ? t('result_screen.all_done_title')
                : saveSucceeded
                  ? t('result_screen.saved_title')
                  : t('result_screen.title')}
            </Text>
            <Text style={styles.infoBody}>
              {flowCompleted
                ? t('result_screen.all_done_body')
                : saveSucceeded
                  ? t('result_screen.saved_body')
                  : t('result_screen.default_body')}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={handleNextStep}
            accessibilityRole="button"
            accessibilityLabel={primaryCtaLabel}
          >
            <Text style={styles.ctaLabel}>{primaryCtaLabel}</Text>
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
});
